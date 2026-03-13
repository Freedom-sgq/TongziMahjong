import * as cc from 'cc';
import { BPDecorator as BPDec } from "../../util/BPDecorator";
import { BPOmitFunctionsOptional } from "../../util/BPType";
import { BPAnimBase } from "./BPAnimBase";
import { DEV } from 'cc/env';

/**
 * @author Tinker
 * @date
 * @description 变换动画基类
 */
@BPDec.ccclass
export abstract class BPTransformBase extends BPAnimBase {
    @BPDec.property({ tooltip: DEV && '播放次数' })
    public repeat: number = 1;

    @BPDec.property({
        tooltip: DEV && '播放间隔(秒)',
        visible() { return this.repeat == 0 }
    })
    public repeatInterval: number = 0;

    @BPDec.property({ tooltip: DEV && '自动播放' })
    public playOnLoad: boolean = false;

    @BPDec.property({ tooltip: DEV && '延迟占比', min: 0, max: 0.99 })
    public delayRate: number = 0;

    @BPDec.property({ tooltip: DEV && '回弹占比', min: 0, max: 0.99 })
    public bounceRate: number = 0;

    @BPDec.property({
        tooltip: DEV && '回弹频率', visible() {
            return this.bounceRate > 0;
        }
    })
    public bounceFrequency: number = 0;

    @BPDec.property({
        tooltip: DEV && '回弹阻尼系数', visible() {
            return this.bounceRate > 0;
        }
    })
    public bounceDamping: number = 0;


    /**
     * 默认属性缓存
     */
    protected _defaults: BPOmitFunctionsOptional<cc.Node> = {};

    /**
     * 
     */
    public override onLoad() {
        this._defaults = this._cacheDefaults();

        if (this.bounceRate == 0) {
            this.bounceFrequency = this.bounceDamping = 0;
        }

        if (this.playOnLoad == true) {
            this.play();
        }
    }

    /**
     * 
     */
    public override start() {
    }

    /**
     * 
     */
    public play() {
        let action = this._makeAction();
        if (action == null) {
            return;
        }
        //
        if (this.repeat > 0) {
            this._curTween = cc.tween(this.node).repeat(this.repeat, action);
        }
        else {
            this._curTween = cc.tween(this.node).repeatForever(action);
        }
        this._curTween.start();
    }

    /**
     * 
     */
    public stop() {
        this._curTween && this._curTween.stop();
        for (let key in this._defaults) {
            this.node[key] = this._defaults[key];
        }
    }

    /**
     * 震动函数
     * @param a amplitude 基础振幅
     * @param t time 时间
     */
    protected _getDeltaBounce(a: number, t: number): number {
        const w = 2 * Math.PI * this.bounceFrequency;
        if (w == 0) {
            return 0;
        }
        return a * Math.sin(w * t) / Math.exp(this.bounceDamping * t) / w;
    }

    /**
     * 构造动画效果
     */
    protected abstract _makeAction(): cc.Tween;

    /**
     * 缓存初始状态
     */
    protected abstract _cacheDefaults(): Record<string, any>;

}