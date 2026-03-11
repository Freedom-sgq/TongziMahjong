
export interface BPProtocolEvents {
    onOpen?: (event: Event) => any;
    onMessage?: (event: Event) => any;
    onError?: (event: Event) => any;
    onClose?: (event: Event) => any;
    onHeartbeatTimeout?: () => any,
    onReconnectTimeout?: () => any,
}

/**
 * @author
 * @date
 * @description
 */
export abstract class BPProtocolBase {
    protected _protocalEvents: BPProtocolEvents;
    protected _sendHeartBeat: Function;

    protected abstract _onOpen(event: Event): any;
    protected abstract _onMessage(event: Event): any;
    protected abstract _onError(event: Event): any;
    protected abstract _onClose(event: Event): any;
    protected abstract _onHeartbeatTimeout(): any;
    protected abstract _onReconnectTimeout(): any;
}