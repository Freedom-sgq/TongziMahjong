import * as cc from 'cc';
import { BPTimerManager } from "../timer/BPTimerManager";
import { BPComponentBase } from "./BPComponentBase";
import { EDITOR } from 'cc/env';


export abstract class BPGameLaunchBase extends BPComponentBase {
    protected _runtimeInited: boolean = false;

    /**
     * ....
     */
    protected override onPreload(): void {
        if (cc.game.isPersistRootNode(this.node)) {
            cc.game.addPersistRootNode(this.node);
        }

        // if (cc.sys.isNative) {
        //     jsb && jsb.device && jsb.device.setKeepScreenOn(true);
        // }

        cc.game.setFrameRate(60);
        cc.dynamicAtlasManager.enabled = false;
        cc.setDisplayStats(false);
    }

    protected override onLoad(): void {
        this._resizeCanvas();
        this._initRuntime();
    }

    public getNodeUIRoot(): cc.Node {
        return this.node.getChildByName("ND_UIRoot");
    }

    /**
     * ....
     */
    private _initRuntime(): void {
        if (EDITOR) { return; }
        if (this._runtimeInited == true) { return; }
        
        this._onInitRuntime();
        this._runtimeInited = true;

        // 监听游戏从后台切换到前台
        cc.game.on(cc.Game.EVENT_SHOW, this._onGameShow, this);
    }

    protected override onEnable() {
        cc.view.on('canvas-resize', this._resizeCanvas, this);
    }

    protected override onDisable() {
        cc.view.off('canvas-resize', this._resizeCanvas, this);
    }


    /**
     * h / w
     * h` / w`
     */
    protected _resizeCanvas(): void {
        const cpCanvas = cc.director.getScene().getComponentInChildren(cc.Canvas);
        const winRatio = this._getWinHWRatio();
        const resRatio = this._getResolutionHWRatio();
        if (winRatio - resRatio >= 0) {
            // 长屏
            // cpCanvas.fitWidth = true;
            // cpCanvas.fitHeight = false;
        }
        else {
            // 宽屏
            // cpCanvas.fitWidth = false;
            // cpCanvas.fitHeight = true;
        }
        const cpNodeUIRoot = this.getNodeUIRoot().getComponent(cc.Widget);
        cpNodeUIRoot.top = cpNodeUIRoot.bottom = 0;
        cpNodeUIRoot.left = cpNodeUIRoot.right = 0;

        // h/w
        const maxRatio = 1700 / 750;
        const overMaxRatio = this._getWinHWRatio() - maxRatio;
        // w/h
        const minRatio = 1 / this._getResolutionHWRatio();
        const winSize = cc.screen.windowSize;
        const overMinRatio = 1 / this._getWinHWRatio() - minRatio;
        if (overMaxRatio > 0) {
            const toH = overMaxRatio * 0.5 * winSize.width;
            cpNodeUIRoot.top = cpNodeUIRoot.bottom = toH;
        }
        else if (overMinRatio > 0) {
            const toW = overMinRatio * 0.5 * winSize.height;
            cpNodeUIRoot.left = cpNodeUIRoot.right = toW;
        }

        const safeArea = cc.sys.getSafeAreaRect();
        const finalTop = Math.max(cpNodeUIRoot.top, winSize.height - safeArea.y - safeArea.height);
        const finalBottom = Math.max(cpNodeUIRoot.bottom, safeArea.y);
        cpNodeUIRoot.top = finalTop;
        cpNodeUIRoot.bottom = finalBottom;
    }

    /**
     * ....
     */
    protected _getResolutionHWRatio() {
        const size = cc.view.getDesignResolutionSize();
        let ratio = size.height >= size.width ?
            (size.height / size.width) : (size.width / size.height);
        return ratio;
    }

    /**
     * ....
     */
    protected _getWinHWRatio() {
        const winSize = cc.screen.windowSize;
        let ratio = winSize.height >= winSize.width ?
            (winSize.height / winSize.width) : (winSize.width / winSize.height);
        return ratio;
    }

    /**
     * ....
     */
    protected override update(dt: number): void {
        super.update(dt);
        BPTimerManager.getInstance().update(dt);
    }

    /**
     * 
     */
    protected override onDestroy(): void {
        super.onDestroy();
    }

    /**
     * 前台
     */
    protected abstract _onGameShow(): void;

    /**
     * @description 仅编辑器环境可执行
     */
    protected abstract _onUpdateEditor(): void;

    /**
     * @description 仅运行时环境执行
     */
    protected abstract _onInitRuntime(): void;
}
