import { BPDecorator as BPDec } from "../../util/BPDecorator";
import { BPCounterBase } from "./BPCounterBase";

/**
 * @author Tinker
 * @date
 * @description 缓动进度条
 */
@BPDec.ccclass
export class BPCounterProgressBar extends BPCounterBase {
    /**
     * 
     */
    private _progressBar: cc.ProgressBar = null;
    public get progressBar(): cc.ProgressBar {
        if (!this._progressBar) {
            this._progressBar = this.getComponent(cc.ProgressBar);
        }

        return this._progressBar;
    }

    /**
     * 
     */
    @BPDec.property({ type: cc.Sprite, tooltip: CC_DEV && "副进度条，一般用于预先或者延迟缓动" })
    public subBarSprite: cc.Sprite = null;

    /**
     * @implements BPCounterBase
     */
    protected _onTweenStart(value: number, targetValue: number): void {
        // 没有副进度条则不处理
        if (this.subBarSprite == null) {
            return;
        }

        if (value == targetValue) {
            return;
        }

        // 减少，主进度条直接变化到目标值
        if (value > targetValue) {
            this.progressBar.progress = targetValue;
        }

        // 增加，副进度条直接变化到目标值
        if (value < targetValue) {
            this._updateSubBarProgress(targetValue);
        }
    }

    /**
     * @implements BPCounterBase
     */
    protected _onTweenUpdate(value: number, targetValue: number): void {
        // 减少，副进度条延迟缓动
        if (value > targetValue) {
            this._updateSubBarProgress(value);
        }

        // 增加，主进度条延迟缓动
        if (value < targetValue) {
            this.progressBar.progress = value;
        }
    }

    /**
     * @implements BPCounterBase
     */
    protected _onTweenFinish(value: number, targetValue: number): void {

    }

    /**
     * 
     */
    private _updateSubBarProgress(progress: number): void {
        switch (this.progressBar.mode) {
            case cc.ProgressBar.Mode.HORIZONTAL:
                this.subBarSprite.node.width = this.progressBar.totalLength * progress;
                break;

            case cc.ProgressBar.Mode.VERTICAL:
                this.subBarSprite.node.height = this.progressBar.totalLength * progress;
                break;

            case cc.ProgressBar.Mode.FILLED:
                this.subBarSprite.fillRange = progress;
                break;

            default:
                break;
        }
    }
}