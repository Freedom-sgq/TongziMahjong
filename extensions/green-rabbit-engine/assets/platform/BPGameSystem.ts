import * as cc from 'cc';
import { BPEvent } from "../event/BPEvent";
import { BPTimerManager } from "../timer/BPTimerManager";
import { BPAudioManager, BPCacheManager, BPCmdManager, BPDecalManager, BPGUIManager, BPLang, BPModelManager, BPNetDriver, BPStorage } from "../zone/BPExport";

/**
 * 
 */
export class BPGameSystem {
    private static _isLocal = false;

    /**
     * @param islocal 
     */
    public static setLocal(islocal) {
        this._isLocal = islocal;
    }

    /**
     * 
     */
    public static isLocal() {
        // 模拟本地
        if (BPGameSystem._isLocal == true) {
            return true;
        }

        // 是啥就是啥
        return !cc.sys.isNative;
    }

    /**
     *  重启
     */
    public static restart() {
        this._clearEngine();
        cc.game.restart();
    }

    /**
     * 退出
     */
    public static end() {
        cc.game.end();
    }

    /**
     * 
     */
    private static _clearEngine() {
        BPEvent.getInstance().destroy();
        BPStorage.getInstance().destroy();
        BPTimerManager.getInstance().destroy();
        BPDecalManager.getInstance().destroy();
        BPCmdManager.getInstance().destroy();
        BPAudioManager.getInstance().destroy();
        BPLang.getInstance().destroy();
        BPNetDriver.getInstance().destroy();
        BPModelManager.getInstance().destroy();
        BPCacheManager.getInstance().destroy();
        BPGUIManager.getInstance().destroy();
    }
}