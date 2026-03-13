import * as cc from 'cc';
import { BPComponentBase } from "../BPComponentBase";
import { BPDecorator as BPDec } from "../../util/BPDecorator";
import { DEV } from 'cc/env';

/**
 * 缓动函数名枚举
 */
export enum BPEasingType {
    None = 0,
    QuadIn = 1,
    QuadOut = 2,
    QuadInOut = 3,
    QuartIn = 4,
    QuartOut = 5,
    QuartInOut = 6,
    SineIn = 7,
    SineOut = 8,
    SineInOut = 9,
    BackIn = 10,
    BackOut = 11,
    BackInOut = 12,
}

/**
 * @author Tinker
 * @date
 * @description 动画基类
 */
@BPDec.ccclass
export abstract class BPAnimBase extends BPComponentBase {
    /**
     * 效果时长(秒)
     */
    @BPDec.property({ tooltip: DEV && '效果时长(秒)' })
    public duration: number = 0.25;

    /**
     * 当前的cc.Tween对象
     */
    protected _curTween: cc.Tween = null;

    /**
     * 
     */
    protected _stopTween(): void {
        if (this._curTween) {
            this._curTween.stop();
            this._curTween = null;
        }
    }

    /**
     * 
     */
    protected override onDestroy(): void {
        this._stopTween();
    }
}