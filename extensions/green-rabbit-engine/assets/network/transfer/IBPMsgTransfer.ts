/**
 * @author
 * @date
 * @description
 */
export interface IBPMsgTransfer {
    write(msgCls: any, dataObj: any): Uint8Array;

    read(msgCls: any, dataBytes: any): Record<string, any>;
}