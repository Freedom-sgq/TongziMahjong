// import { BPModule } from "BPEngine";
// import ProtoMsg = require("../Msg/ProtoMsg.js");
// import { NetMsgEventStruct, NetMsgPriType } from "../Net/NetDefine";

// /**
//  * 消息码映射事件
//  */
// export const MsgCodes = ProtoMsg.protosxx.MsgCode;
// const MsgClasses = ProtoMsg.protosxx.MsgMeta;
// export import MsgClasses = ProtoMsg.protosxx.MsgMeta;

// export const RspEvent = function (code: ProtoMsg.protosxx.MsgCode) {
//     return MsgCodes[code] + "Rsp";
// }

// export const PushEvent = function (code: ProtoMsg.protosxx.MsgCode) {
//     return MsgCodes[code] + "Push";
// }

// export const PriEvent = function (pri: NetMsgPriType) {
//     return NetMsgPriType[pri];
// }

// /**
//  * 消息事件类型
//  */
// export type NetMsgEventObj<T extends BPModule.BPNonEnumKeys<typeof MsgClasses>> = NetMsgEventStruct<InstanceType<(typeof MsgClasses)[T]>>;

// /**
//  * 消息Data类型
//  */
// export type NetMsgDataObj<T extends BPModule.BPNonEnumKeys<typeof MsgClasses>> = InstanceType<(typeof MsgClasses)[T]>;

// /**
//  *  网络配置
//  */
// type ConfigGuard = BPModule.BPNetMsgConfig;
// export const NetMsgConfig = {
//     msgCodes: MsgCodes,
//     msgClses: MsgClasses,
// } satisfies ConfigGuard;

// export class NetConfig {
// }

// export const enum HttpRouter {
//     Notice = "/dhxx/api/server/noticeList",        // 公告
//     ServerList = "/dhxx/api/server/list",
// }

// export const enum HttpRspState {
//     Success = 200,
//     Fail = 0,
// }