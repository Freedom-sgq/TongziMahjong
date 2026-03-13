import * as cc from 'cc';
import { BPPlatformInfo } from "../data/BPConfigs";
import { BPLog } from "../util/BPLog";
import { BPGameSystem } from "./BPGameSystem";

/**
 * @author
 * @date 
 * @description
 */
export class BPPlatformCaller {
    private _keyName: string = "";

    /**
     *
     */
    private _className: string = "";
    private _methodName: string = "";
    private _signature: string = "";
    private _proxyMethod: (...args: any[]) => any;

    /**
     *
     */
    constructor(config: BPPlatformInfo) {
        this._keyName = config.key;

        this._className = config.cls;
        this._methodName = config.method;
        this._signature = config.sign;
        this._proxyMethod = config.proxy;
    }

    /**
     *
     */
    public j2p(obj: Record<string, any> = {}): any {
        let out = null;
        if (BPGameSystem.isLocal()) {
            // webs or local...
            obj.code = 200;
            out = this._proxyMethod?.(obj);
        }
        else {
            if (!this._className || !this._methodName) {
                BPLog.error(`BPPlatform caller [${this._keyName}] invoke 
                j2p() function failed, please check params...`);
                return null;
            }

            if (cc.sys.os === cc.sys.OS.ANDROID) {
                // // android...
                // out = jsb.reflection.callStaticMethod(this._className,
                //     this._methodName,
                //     this._signature,
                //     JSON.stringify(obj),
                // );
            }
            else if (cc.sys.os === cc.sys.OS.IOS) {
                // // ios...
                // out = jsb.reflection.callStaticMethod(this._className.split('/').pop(),//class name only
                //     this._methodName + ':',
                //     JSON.stringify(obj),
                // );
            }
            else {
                BPLog.error(`jsb undefined platorm: ${cc.sys.os} ...`);
                return null;
            }
        }

        return out;
    }

    /**
     *
     */
    public p2j(obj: Record<string, any>): any {
        return this._proxyMethod?.(obj);
    }
}