import { BPLog } from "../../util/BPLog";
import { BPProtocolBase, BPProtocolEvents } from "./BPProtocolBase";
import { BPNetBufferType, BPProtocolOptionsType, IBPSocketProtocol } from "./IBPSocketProtocol";


/**
 * @author
 * @date
 * @description
 */
export class BPWebSocket extends BPProtocolBase implements IBPSocketProtocol {
    static readonly heartbeatInterval: number = 10 * 1000;
    static readonly serverTimeoutInterval: number = 25 * 1000;
    static readonly reconnectInterval: number = 3 * 1000;
    static readonly maxReconnectCount: number = 5;

    private _ws: WebSocket;
    private _protocalOptions: BPProtocolOptionsType;

    private _startHeartbeatTimer: number;
    private _serverTimeoutTimer: number;
    private _autoReconnectTimer: number;
    private _autoReconnectCount: number = 0;
    private _isKicked = false;

    public getState(): number {
        if (!this._ws) {
            return WebSocket.CLOSED;
        }
        return this._ws.readyState;
    }

    public isValid(): boolean {
        return (this._ws && this._ws.readyState == WebSocket.OPEN);
    }

    public bindEventsAndHeartBeat(protocalEvents: BPProtocolEvents, sendHeartBeatFunction: Function): void {
        this._protocalEvents = protocalEvents;
        this._sendHeartBeat = sendHeartBeatFunction;
    }

    public connect(options: BPProtocolOptionsType): boolean {
        if (this.getState() === WebSocket.CONNECTING) {
            BPLog.net("websocket connecting, wait for a moment...")
            return false;
        }

        let url = options.url;
        if (!url) {
            let host = options.host;
            let port = options.port;
            let protocol = options.protocol ?? "ws";
            url = `${protocol}://${host}:${port}`;
        }

        // TODO: ios pem...
        this._ws = new WebSocket(url);
        this._ws.binaryType = options.binaryType ?? "arraybuffer";
        this._ws.onopen = this._onOpen.bind(this);
        this._ws.onmessage = this._onMessage.bind(this);
        this._ws.onerror = this._onError.bind(this);
        this._ws.onclose = this._onClose.bind(this);

        this._protocalOptions = options;

        return true;
    }

    public send(buffer: BPNetBufferType): number {
        if (this.isValid() == true) {
            this._ws.send(buffer);
            return 1;
        }
        return -1;
    }

    public close(reason?: string): void {
        if (reason == "Kick") {
            // 服务器先断，后续手动close无效.所以这边从成员变量处理
            this._isKicked = true;
        }

        if (this._ws) {
            this._ws.close(1000, reason);
        }
    }

    /**
     * 断线重连
     */
    public tryAutoReconnect(): void {
        if (this._autoReconnectTimer) {
            // 正在等待重连
            return;
        }

        // 可以重连
        this._autoReconnectCount++;
        BPLog.net("[Reconnect Count " + this._autoReconnectCount + "] ... ");
        this.connect(this._protocalOptions);

        // 递归调用.
        this._autoReconnectTimer = setTimeout(() => {
            if (this._autoReconnectCount >= BPWebSocket.maxReconnectCount) {
                // 超过自动重连次数
                BPLog.net("[Reconnect Count Over] ... ");
                this._onReconnectTimeout();
                return;
            }

            this._resetAutoReconnectTimer();
            this.tryAutoReconnect();
        }, BPWebSocket.reconnectInterval);
    }

    /**
     * 固定心跳
     */
    public startHeartbeat(): void {
        this._stopHeartbeat();
        this._startHeartbeatTimer = setInterval(() => {
            this._sendHeartBeat?.();
            if (this._serverTimeoutTimer) { return; }
            this._serverTimeoutTimer = setTimeout(() => {
                BPLog.net("[HeartBeat TimeOut] ... ");
                this._onHeartbeatTimeout();
                this._stopHeartbeat();
            }, BPWebSocket.serverTimeoutInterval);
        }, BPWebSocket.heartbeatInterval);
    }

    /**
     * 
     */
    public onHeartbeatInterval(): void {
        this._resetHeartbeatTimeout();
    }

    protected _onOpen(event: Event): any {
        BPLog.net("_onOpen", event);
        this._stopAutoConnect();
        if (this._protocalEvents && this._protocalEvents.onOpen) {
            this._protocalEvents.onOpen(event);
        }
    }

    protected _onMessage(event: Event): any {
        if (this._protocalEvents && this._protocalEvents.onMessage) {
            this._protocalEvents.onMessage(event);
        }
    }

    protected _onError(event: Event): any {
        BPLog.net("_onError", event);
        if (this._protocalEvents && this._protocalEvents.onError) {
            this._protocalEvents.onError(event);
        }
    }

    protected _onClose(event?: CloseEvent): any {
        this._stopHeartbeat();
        this._clearEvent();
        
        if (this._isKicked) {
            this._isKicked = false;
            return;
        }

        BPLog.net("_onClosed", event);
        if (this._protocalEvents && this._protocalEvents.onClose) {
            this._protocalEvents.onClose(event);
        }
        this.tryAutoReconnect();
    }

    protected _onHeartbeatTimeout(): void {
        this._onClose();
        if (this._protocalEvents && this._protocalEvents.onHeartbeatTimeout) {
            this._protocalEvents.onHeartbeatTimeout();
        }
    }

    private _stopHeartbeat(): void {
        if (this._startHeartbeatTimer != null) {
            clearInterval(this._startHeartbeatTimer);
            this._startHeartbeatTimer = null;
        }
        this._resetHeartbeatTimeout();
    }

    private _resetHeartbeatTimeout() {
        if (this._serverTimeoutTimer != null) {
            clearTimeout(this._serverTimeoutTimer);
            this._serverTimeoutTimer = null;
        }
    }

    protected _onReconnectTimeout() {
        if (this._protocalEvents && this._protocalEvents.onReconnectTimeout) {
            this._protocalEvents.onReconnectTimeout();
        }
    }

    private _resetAutoReconnectTimer(): void {
        if (this._autoReconnectTimer != null) {
            clearTimeout(this._autoReconnectTimer);
            this._autoReconnectTimer = null;
        }
    }

    private _stopAutoConnect() {
        this._autoReconnectCount = 0;
        this._resetAutoReconnectTimer();
    }

    private _clearEvent() {
        if (!this._ws) return;
        
        this._ws.onopen = null;
        this._ws.onmessage = null;
        this._ws.onerror = null;
        this._ws.onclose = null;
    }
}