import { BPModule, bp } from "BPEngine";
import { NetMsgCommonCode, NetMsgEventStruct, NetMsgOp, NetMsgPriType, NetMsgSubType } from "./NetDefine";

type BPNetMsgConfig = BPModule.BPNetMsgConfig;
const BPProtobuf = BPModule.BPProtobuf;
const BPWebSocket = BPModule.BPWebSocket;
const BPNetBase = BPModule.BPNetBase;
const BPNetEvent = BPModule.BPNetEvent;

/**
 * @author
 * @date
 * @description ws + proto 修仙项目网络实现
 */
export class NetImpXx extends BPNetBase {

    private _msgCodes: BPNetMsgConfig["msgCodes"];
    private _msgClses: BPNetMsgConfig["msgClses"];

    /**
     * 
     */
    constructor(msgConfig: BPNetMsgConfig) {
        super(new BPWebSocket(), new BPProtobuf());

        this._msgCodes = msgConfig.msgCodes;
        this._msgClses = msgConfig.msgClses;
    }

    /**
     * 处理发送 初始化消息
     */
    private _dealInitMsgSend(dataObj: any) {
        const jsonString = JSON.stringify(dataObj);
        const jsonBytes = bp.str.encodeUtf8Bytes(jsonString);
        const dataLength = jsonBytes.byteLength;

        // 格式和数据消息不同
        // 1个字节的大类型
        // 3个字节的数据长度
        // 数据长度个字节的数据
        let buffer = new ArrayBuffer(1 + 3 + dataLength);
        let view = new DataView(buffer);
        view.setUint8(0, NetMsgPriType.Init);
        view.setUint8(1, (dataLength >> 16) & 0xFF);
        view.setUint8(2, (dataLength >> 8) & 0xFF);
        view.setUint8(3, dataLength & 0xFF);
        for (let i = 0; i < jsonBytes.byteLength; i++) {
            view.setUint8(4 + i, jsonBytes[i]);
        }
        const bytes = new Uint8Array(buffer);
        return bytes;
    }

    /**
     * 处理 发送 业务消息
     */
    private _dealDataMsgSend(msgCode: number, sub: NetMsgSubType, dataObj: any): [any, string] {
        let msgName = this._msgCodes[msgCode];
        if (msgName == null) {
            bp.log.net(`msgCode: ${msgCode} with subType ${sub} has no msg name, check your msg config...`);
            return [null, ""];
        }
        // msgName = Login + Req/Notify
        msgName = msgName + NetMsgSubType[sub];
        const msgCls = this._msgClses[msgName];
        if (msgCls == null) {
            bp.log.net(`msgName: ${msgName} has no msg class, check your msg config...`);
            // return [null, ""];
        }

        const pbData = this._dataTransfer.write(msgCls, dataObj);
        // if (pbData == null) {
        //     bp.log.net(`msgCode: ${msgCode}'s net data tranfer failed...`);
        //     return [null, ""];
        // }

        // 格式和数据消息相同
        // 1个字节的大类型
        // 3个字节的数据长度
        // 1个字节的子类型
        // 2个字节的消息码cmd对应消息号
        // 数据长度个字节的数据
        const dataLength = 1 + 2 + pbData.byteLength;
        let buffer = new ArrayBuffer(1 + 3 + dataLength);
        let view = new DataView(buffer);
        view.setUint8(0, NetMsgPriType.Data);
        view.setUint8(1, (dataLength >> 16) & 0xFF);
        view.setUint8(2, (dataLength >> 8) & 0xFF);
        view.setUint8(3, dataLength & 0xFF);
        view.setUint8(4, sub);
        view.setUint16(5, msgCode);
        for (let i = 0; i < pbData.byteLength; i++) {
            view.setUint8(7 + i, pbData[i]);
        }

        const bytes = new Uint8Array(buffer);
        return [bytes, msgName];
    }

    /**
     * 心跳消息
     */
    private _dealHeartBeatMsgSend() {
        // 格式和数据消息不同
        // 1个字节的大类型
        let buffer = new ArrayBuffer(4);
        let view = new DataView(buffer);
        view.setUint8(0, NetMsgPriType.Heartbeat);
        const bytes = new Uint8Array(buffer);
        return bytes;
    }

    /**
     * 根据服务器定义
     * 握手类型和消息类型 结构不同
     */
    protected override _onSend(op: NetMsgOp, callback?: (event: NetMsgEventStruct) => void) {
        op.pri = op.pri ?? NetMsgPriType.Data; // 默认消息大类型
        op.sub = op.sub ?? NetMsgSubType.Req; // 默认消息小类型

        const priType = op.pri;
        const msgCode = op.code;
        const subType = op.sub;

        let sendBytes = null;
        let msgName = "";
        let broadCast = true;
        if (priType == NetMsgPriType.Init) {
            // 握手消息
            sendBytes = this._dealInitMsgSend(op.data ?? {});
        }
        else if (priType == NetMsgPriType.Data) {
            [sendBytes, msgName] = this._dealDataMsgSend(msgCode, subType, op.data ?? {});
        }
        else if (priType == NetMsgPriType.Heartbeat) {
            sendBytes = this._dealHeartBeatMsgSend();
            broadCast = false;
        }

        if (sendBytes == null) {
            return;
        }

        this._protocol.send(sendBytes);
        //if (broadCast) {
        bp.log.net(`👈[Msg Send]: 【${NetMsgPriType[priType]}】【${msgName}】`, op.data);
        //}

        callback && this.once(this._makeReceiveNetEventName(priType, msgName),
            (event: NetMsgEventStruct) => { callback(event); }, this);
    }

    /**
     *  处理初始化接收
     */
    private _dealInitMsgReceive(view: DataView, offset: number, dataLength: number) {
        const jsonBytes = new Uint8Array(dataLength);
        for (let i = 0; i < dataLength; i++) {
            jsonBytes[i] = view.getUint8(offset + i);
        }
        const jsonString = bp.str.decodeUtf8Bytes(jsonBytes);
        const dataObj = JSON.parse(jsonString);
        return dataObj;
    }

    /**
     *  处理 接收 业务
     */
    private _dealDataMsgReceive(msgCode: number, subFlag: number, dataBytes: Uint8Array): [any, string] {
        // 判断是否包含错误码 = > 0010 0000 错误码标志位
        const hasErrorCode = (subFlag & (1 << 5)) != 0;
        const subType = subFlag & 0x0F;

        const msgBaseName = this._msgCodes[msgCode];
        if (msgBaseName == null) {
            bp.log.net(`msgCode:【${msgCode}】 and hex is 【0x${msgCode.toString(16)}】 has no msg name, check your msg config...`);
            return [null, ""];
        }

        const msgName = msgBaseName + NetMsgSubType[subType];
        const errorClsName = this._msgCodes[NetMsgCommonCode.Error] as string;
        // 有错误走Error解析 没错误走消息解析
        const msgClsName = !hasErrorCode ? msgName : errorClsName;
        if (msgClsName == null) {
            bp.log.net(`msgCode: ${msgCode} with subType ${subType} has no msg name, check your msg config...`);
            return [null, ""];
        }

        const msgCls = this._msgClses[msgClsName];
        if (msgCls == null) {
            bp.log.net(`msgName: ${msgClsName} has no msg class, check your msg config...`);
            return [null, ""];
        }

        let dataObj = this._dataTransfer.read(msgCls, dataBytes);
        if (dataObj == null) {
            bp.log.error(`read error, net data tranfer failed...`);
            return [null, ""];
        }

        return [dataObj ?? {}, msgName];
    }

    /**
     *  处理初始化接收
     */
    private _dealHeartBeatMsgReceive(view: DataView, offset: number, dataLength: number) {
        const jsonBytes = new Uint8Array(dataLength);
        for (let i = 0; i < dataLength; i++) {
            jsonBytes[i] = view.getUint8(offset + i);
        }
        const jsonString = bp.str.decodeUtf8Bytes(jsonBytes);
        const dataObj = JSON.parse(jsonString);
        return dataObj;
    }

    /**
     * 
     */
    protected override _onMessage(event: MessageEvent) {
        const buffer = event.data as ArrayBuffer;
        const view = new DataView(buffer);
        // primary类型
        const priType = view.getUint8(0);
        const dataLength = (view.getUint8(1) << 16) | (view.getUint8(2) << 8) | view.getUint8(3);

        let dataObj = null;
        let msgName = "";
        let broadCast = true;
        if (priType == NetMsgPriType.Init) {
            dataObj = this._dealInitMsgReceive(view, 4, dataLength);
            this._protocol?.startHeartbeat();
        }
        else if (priType == NetMsgPriType.Data) {
            const subFlag = view.getUint8(4);
            const msgCode = view.getUint16(5);
            const pbBytes = new Uint8Array(buffer, 7, dataLength - 3);
            [dataObj, msgName] = this._dealDataMsgReceive(msgCode, subFlag, pbBytes);
        }
        else if (priType == NetMsgPriType.Kick) {
            const isMulti = (dataLength != null && dataLength > 0);
            dataObj = { isMulti: isMulti }
            this._protocol?.close("Kick");
        }
        else if (priType == NetMsgPriType.Heartbeat) {
            // 心跳消息
            dataObj = this._dealHeartBeatMsgReceive(view, 4, dataLength);
            this._protocol?.onHeartbeatInterval();
            broadCast = false;
        } else {
            bp.log.error(`priType: ${priType} is not support...`);
            return;
        }

        //if (broadCast) {
        bp.log.net(`👉[Msg Receive]: 【${NetMsgPriType[priType]}】【${msgName}】 ==> `, dataObj);
        this._emitReceiveEevent(priType, msgName, dataObj);
        //}

        // 错误..
        if (dataObj == null) {
            return;
        }

        // dataObj.msg && GameApi.showToast(dataObj.msg);
    }

    private _emitReceiveEevent(priType: NetMsgPriType, msgName: string, data: any) {
        let eventName = this._makeReceiveNetEventName(priType, msgName);
        let event: NetMsgEventStruct = {};

        data.code && (event.errCode = data.code);
        data.msg && (event.errMsg = data.msg);
        (!event.errCode && !event.errMsg) && (event.data = data);

        //bp.log.engine(`[Msg Event Send] eventName：【${eventName}】 ==> `, event);
        this.emit(eventName, event);
    }

    private _makeReceiveNetEventName(priType: NetMsgPriType, msgName: string) {
        // 非Data类型 => 大类型名
        // Data类型   => 具体消息名
        let eventName = NetMsgPriType[priType];
        if (priType == NetMsgPriType.Data) {
            eventName = msgName.replace("Req", "Rsp");
        }
        return eventName;
    }

    /**
     * 
     */
    protected override _sendHeartBeat() {
        this._onSend({
            pri: NetMsgPriType.Heartbeat,
            data: {},
        });
    }

    protected override _onOpen(event: Event) {
        this.emit(BPNetEvent.NetOpen, event);
    }

    protected override _onError(event: Event) {
        this.emit(BPNetEvent.NetError, event);
    }

    protected override _onClose(event: Event) {
        this.emit(BPNetEvent.NetClose, event);
    }

    protected override _onHeartbeatTimeout() {
        this.emit(BPNetEvent.NetHeartbeatTimeout);
    }

    protected override _onReconnectTimeout() {
        this.emit(BPNetEvent.NetReconnectTimeout);
    }
}