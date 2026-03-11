import { BPPlatformConfig } from "../data/BPConfigs";
import { BPMap } from "../struct/BPMap";
import { BPLog } from "../util/BPLog";
import { BPString } from "../util/BPString";
import { BPPlatformCaller } from "./BPPlatformCaller";

/**
 * @author
 * @date 
 * @description
 */
export class BPPlatform {
    private static _callers = new BPMap<BPPlatformCaller>();

    /**
     * 
     */
    public static init(config: BPPlatformConfig) {
        for (let i = 0; i < config.length; i++) {
            const info = config[i];
            let caller = BPPlatform._callers.get(info.key);
            if (caller) {
                continue;
            }
            BPPlatform._callers.set(info.key, new BPPlatformCaller(info));
        }
    }

    /**
     * js 访问 平台
     */
    public static doCall(keyName: string, objParams: Record<string, any>) {
        let caller = BPPlatform._getCaller(keyName);
        if (!caller) {
            return null;
        }

        return caller.j2p(objParams);
    }

    /**
     * 平台 访问 js
     */
    public static doListen(keyName: string, jsonParams: string) {
        let caller = BPPlatform._getCaller(keyName);
        if (!caller) {
            return null;
        }

        let objParams = BPString.parseJson(jsonParams);
        return caller.p2j(objParams);
    }

    /**
     * 
     */
    private static _getCaller(keyName: string) {
        let caller = BPPlatform._callers.get(keyName);
        if (caller == null) {
            BPLog.engine(`caller ${keyName} not found...`);
        }

        return caller;
    }

}