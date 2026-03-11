import { IBPMsgTransfer } from "./IBPMsgTransfer";

export class BPProtobuf implements IBPMsgTransfer {
    constructor() {
    }

    /**
     * @implements IBPMsgTransfer
     */
    write(msgCls: any, dataObj: any): Uint8Array {
        let dataBytes = new Uint8Array();
        if (msgCls && dataObj) {
            dataBytes = msgCls.encode(dataObj).finish();
        }
        return dataBytes;
    }


    /**
     * @implements IBPMsgTransfer
     */
    read(msgCls: any, dataBytes: any): Record<string, any> {
        const msgObj = msgCls.toObject(msgCls.decode(dataBytes), { defaults: false });
        return msgObj;
    }
}