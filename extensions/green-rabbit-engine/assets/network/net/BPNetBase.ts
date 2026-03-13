import * as cc from 'cc';
import { BPLog } from "../../util/BPLog";
import { IBPMsgTransfer } from "../transfer/IBPMsgTransfer";
import { BPProtocolOptionsType, IBPSocketProtocol } from "../protocol/IBPSocketProtocol";

/**
 * @author
 * @date
 * @description
 */
export abstract class BPNetBase {
    protected _netEvent: cc.EventTarget = null;
    protected _protocol: IBPSocketProtocol;
    protected _dataTransfer: IBPMsgTransfer;

    /**
     * ....
     */
    constructor(protocal: IBPSocketProtocol, transfer: IBPMsgTransfer) {
        this._netEvent = new cc.EventTarget();
        this._protocol = protocal;
        this._dataTransfer = transfer;

        this._protocol.bindEventsAndHeartBeat({
            onOpen: this._onOpen.bind(this),
            onMessage: this._onMessage.bind(this),
            onError: this._onError.bind(this),
            onClose: this._onClose.bind(this),
            onHeartbeatTimeout: this._onHeartbeatTimeout.bind(this),
            onReconnectTimeout: this._onReconnectTimeout.bind(this),
        }, this._sendHeartBeat.bind(this));
    }

    /**
     * ....
     */
    public connect(options: BPProtocolOptionsType): void {
        this._protocol.connect(options);
    }

    /**
     * 
     */
    public isConnected(): boolean {
        return this._protocol.isValid();
    }

    /**
     * ....
     */
    public close(): void {
        this._protocol.close();
    }

    /**
     * ....
     */
    public send(op: any, cb?: Function): void {
        if (this._protocol?.isValid() == false) {
            BPLog.net(`net protocal state is not valid...`);
            return;
        }

        this._onSend(op, cb);
    }

    /**
     * ....
     */
    public on(msgCode: number, callback: (msgObj: any) => void, target: object): void
    public on(msgName: string, callback: (msgObj: any) => void, target: object): void
    public on(msgKey: number | string, callback: (msgObj: any) => void, target: object) {
        if (typeof msgKey == "number") {
            msgKey = msgKey.toString();
        }
        this._netEvent.on(msgKey, callback, target);
    }

    /**
     * 
     */
    protected once(msgCode: number, callback: (msgObj: any) => void, target: object): void
    protected once(msgName: string, callback: (msgObj: any) => void, target: object): void
    protected once(msgKey: number | string, callback: (msgObj: any) => void, target: object) {
        if (typeof msgKey == "number") {
            msgKey = msgKey.toString();
        }
        this._netEvent.once(msgKey, callback, target);
    }

    /**
     * ....
     */
    public off(target: object): void {
        this._netEvent.targetOff(target);
    }

    /**
     * ....
     */
    protected emit(eventName: string, eventObj?: any) {
        this._netEvent?.emit(eventName, eventObj);
    }

    /**
     * 
     */
    public destroy(): void {
        this.close();
        
        // this._netEvent.clear();
        this._netEvent = null;
        this._protocol = null;
        this._dataTransfer = null;
    }

    /**
     * ....
     */
    protected abstract _onSend(op: any, callback?: Function);
    protected abstract _onOpen(event: Event);
    protected abstract _onMessage(event: Event);
    protected abstract _onError(event: Event);
    protected abstract _onClose(event: Event);
    protected abstract _onHeartbeatTimeout();
    protected abstract _onReconnectTimeout();
    protected abstract _sendHeartBeat();
}