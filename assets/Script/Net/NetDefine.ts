/**
 * 网络类型
 */
export enum NetType {
    WebSocket = 0,
};

/**
 * 消息推送操作
 */
export enum NetMsgPushOp {
    // 首次同步
    Sync = 0,
    // 用服务器提供的数据
    Add = 1,
    // 删除某项数据
    Remove = 2,
    // 更新某项数据
    Update = 3,
}

/**
 * 网络传递Op
 */
export interface NetMsgOp {
    pri?: number;                   // 抽象大类型
    sub?: number;                   // 抽象子类型
    code?: number;                  // 消息码
    data: Record<string, any>;      // 数据
}

/**
 * 大类型映射关系
 */
export enum NetMsgPriType {
    Init = 1,           // 握手
    HandshakeAck = 2,   // 握手确认
    Heartbeat = 3,      // 心跳
    Data = 4,           // 业务
    Kick = 5,           // 被踢
}

/**
 * 子类型映射关系
 */
export enum NetMsgSubType {
    Req = 0,        // 请求
    Notify = 1,     // 通知 c->s
    Rsp = 2,        // 响应
    Push = 3,       // 主推 s->c
}

/**
 * 系统类型数据结构PB索引码
 */
export enum NetMsgCommonCode {
    Error = 0x000,
}

/**
 * 
 */
export type NetMsgEventStruct<T = any> = {
    errCode?: string;
    errMsg?: string;
    data?: T;
}

