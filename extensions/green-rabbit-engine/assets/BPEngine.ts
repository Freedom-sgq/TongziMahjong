import * as cc from 'cc';
import * as BPModule from "./zone/BPExport";
import {BPEventConfig} from "./event/BPEventConfig";
import { DEBUG } from "cc/env";

/**
 * BPEngine导出命名空间
 */
namespace bp {
    /**
     * 事件
     */
    export const event = BPModule.BPEvent.getInstance();

    /**
     * 资源
     */
    export const res = BPModule.BPResManager.getInstance();

    /**
     * 日志类
     */
    export const log = BPModule.BPLog;

    /**
     * gui
     */
    export const gui = BPModule.BPGUIManager.getInstance();

    /**
     * model
     */
    export const model = BPModule.BPModelManager.getInstance();

    /**
     * model
     */
    export const cache = BPModule.BPCacheManager.getInstance();

    /**
     * net driver
     */
    export const net = BPModule.BPNetDriver.getInstance();
    export const http = BPModule.BPHttp.getInstance();

    /**
     * language
     */
    export const lang = BPModule.BPLang.getInstance();

    /**
     * audio
     */
    export const audio = BPModule.BPAudioManager.getInstance();

    /**
     * cmd
     */
    export const cmd = BPModule.BPCmdManager.getInstance();

    /**
     * decal
     */
    export const decal = BPModule.BPDecalManager.getInstance();

    /**
     * 
     */
    export const str = BPModule.BPString;

    /**
     * storage
     */
    export const storage = BPModule.BPStorage.getInstance();

    /**
     * 定时器
     */
    export const timer = BPModule.BPTimerManager.getInstance();

    /**
     * 
     */
    export const time = BPModule.BPTime;

    /**
     * 游戏系统
     */
    export const sys = BPModule.BPGameSystem

    /**
     * 
     */
    export const constant = BPModule.BPConst;

    /**
     * 平台
     */
    export const platform = BPModule.BPPlatform;

    export const math = BPModule.BPMath;

    export const eventConfig = BPEventConfig;
}

/**
 * 导出模块
 */
export { BPModule, bp };

/**
 * 编辑器全局空间
 */
// if (CC_EDITOR) {
    window["bp"] = window["bp"] || bp;
    //@ts-ignore
    window["BPModule"] = window["BPModule"] || BPModule;
// }

if (DEBUG) {
    window['bp']['decal'] = window['bp']['decal']  || bp.decal;
}

cc.log("BPEngine exported success");