import { BPTimerManager } from "../timer/BPTimerManager";
import { BPConst } from "../util/BPConst";
import { BPComponentBase } from "./BPComponentBase";

/**
 * @author Tinker
 * @date
 * @description 项目入口，初始化引擎; 默认编辑器可执行，用以同步引擎环境
 */

//@BPDecorator.executeInEditMode
export abstract class BPGameLaunchBase extends BPComponentBase {
    protected _runtimeInited: boolean = false;

    /**
     * ....
     */
    protected override onPreload(): void {
        if (cc.game.isPersistRootNode(this.node)) {
            cc.game.addPersistRootNode(this.node);
        }

        if (cc.sys.isNative) {
            jsb && jsb.Device && jsb.Device.setKeepScreenOn(true);
        }

        cc.game.setFrameRate(59);
        cc.dynamicAtlasManager.enabled = false;
        cc.debug.setDisplayStats(false);
    }

    /**
     * ....
     */
    protected override onLoad(): void {
        const maxZIndex = BPConst.MaxZIndex;
        const ndUIRoot = this.getNodeUIRoot();
        ndUIRoot.getChildByName("ND_TopMask").zIndex = maxZIndex;
        ndUIRoot.getChildByName("ND_BotMask").zIndex = maxZIndex;
        ndUIRoot.getChildByName("ND_LeftMask").zIndex = maxZIndex;
        ndUIRoot.getChildByName("ND_RightMask").zIndex = maxZIndex;

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
        if (CC_EDITOR) { return; }
        if (this._runtimeInited == true) { return; }
        
        this._onInitRuntime();
        this._runtimeInited = true;

        // 监听游戏从后台切换到前台
        cc.game.on(cc.game.EVENT_SHOW, this._onGameShow, this);
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
            cpCanvas.fitWidth = true;
            cpCanvas.fitHeight = false;
        }
        else {
            // 宽屏
            cpCanvas.fitWidth = false;
            cpCanvas.fitHeight = true;
        }
        const cpNodeUIRoot = this.getNodeUIRoot().getComponent(cc.Widget);
        cpNodeUIRoot.top = cpNodeUIRoot.bottom = 0;
        cpNodeUIRoot.left = cpNodeUIRoot.right = 0;

        // h/w
        const maxRatio = 1700 / 750;
        const overMaxRatio = this._getWinHWRatio() - maxRatio;
        // w/h
        const minRatio = 1 / this._getResolutionHWRatio();
        const overMinRatio = 1 / this._getWinHWRatio() - minRatio;
        if (overMaxRatio > 0) {
            const toH = overMaxRatio * 0.5 * cc.winSize.width;
            cpNodeUIRoot.top = cpNodeUIRoot.bottom = toH;
        }
        else if (overMinRatio > 0) {
            const toW = overMinRatio * 0.5 * cc.winSize.height;
            cpNodeUIRoot.left = cpNodeUIRoot.right = toW;
        }

        const safeArea = cc.sys.getSafeAreaRect();
        const finalTop = Math.max(cpNodeUIRoot.top, safeArea.y);
        const finalBottom = Math.max(cpNodeUIRoot.bottom, cc.winSize.height - safeArea.y - safeArea.height);
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
        let ratio = cc.winSize.height >= cc.winSize.width ?
            (cc.winSize.height / cc.winSize.width) : (cc.winSize.width / cc.winSize.height);
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