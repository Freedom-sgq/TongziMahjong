
import { BPSingletonBase } from "../struct/BPSingletonBase";
import { BPNetBase } from "./net/BPNetBase";
import { BPProtocolOptionsType } from "./protocol/IBPSocketProtocol";

/**
 * @author
 * @date
 * @description
 */
export class BPNetDriver extends BPSingletonBase {
    private _netPool: Array<BPNetBase> = null;

    protected constructor() {
        super();
        this._netPool = new Array<BPNetBase>();
    }

    /**
     * 
     */
    public init(): void {
    }

    /**
     * ....
     */
    public registerNet(inNet: BPNetBase): void {
        if (inNet) {
            this._netPool.push(inNet);
        }
    }

    /**
     * ....
     */
    public getNet(type: number): BPNetBase {
        if (this._netPool.length - 1 < type) {
            return null;
        }

        return this._netPool[type];
    }

    /**
     * ....
     */
    public getDefaultNet(): BPNetBase {
        return this._netPool[0];
    }

    /**
     * ....
     */
    public connect(netType: number, op: BPProtocolOptionsType): void {
        let net = this._netPool[netType];
        if (net) {
            net.connect(op);
        }
    }

    /**
     * ....
     */
    public close(netType: number): void {
        let net = this._netPool[netType];
        if (net) {
            net.close();
        }
    }

    /**
     * ....
     */
    public send(netType: number, op: any): void {
        let net = this._netPool[netType];
        if (net) {
            net.send(op);
        }
    }

    /**
     * ....
     */
    public on(msgCode: number, callback: (msgObj: any) => void, target: object, type?: number): void
    public on(msgName: string, callback: (msgObj: any) => void, target: object, type?: number): void
    public on(msgKey: number | string, callback: (msgObj: any) => void, target: object, type = 0): void {
        let net = this._netPool[type];
        if (net) {
            if (typeof msgKey == "string") {
                net.on(msgKey, callback, target);

            } else {
                net.on(msgKey, callback, target);
            }
        }
    }

    /**
     * ....
     */
    public off(type: number, target: object): void {
        let net = this._netPool[type];
        if (net) {
            net.off(target);
        }
    }

    /**
     * ....
     */
    public destroy(): void {
        super.destroy();
        for (let i = this._netPool.length - 1; i >= 0; --i) {
            this._netPool[i].destroy();
        }
        this._netPool.length = 0;
    }
}