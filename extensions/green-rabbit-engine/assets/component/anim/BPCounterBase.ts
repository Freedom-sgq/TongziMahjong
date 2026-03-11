import { BPDecorator as BPDec } from "../../util/BPDecorator";
import { BPString } from "../../util/BPString";
import { BPAnimBase, BPEasingType } from "./BPAnimBase";

/**
 * @author Tinker
 * @date
 * @description 进度动画基类(目前没做不同参数排队机制)
 */
@BPDec.ccclass
export abstract class BPCounterBase extends BPAnimBase {
    public static readonly OnTweenUpdate = "onTweenUpdate";
    public static readonly OnTweenStart = "onTweenStart";
    public static readonly OnTweenFinish = "onTweenFinish";

    @BPDec.property({ type: cc.Enum(BPEasingType), tooltip: CC_DEV && "缓动枚举" })
    public easingType: BPEasingType = BPEasingType.None;

    @BPDec.property()
    public get value(): number {
        return this._value;
    }
    private set value(val: number) {
        if (this._value == val) {
            return;
        }

        this._value = val;
        this._broadcastEvent(BPCounterBase.OnTweenUpdate);
    }

    private _value: number = 0;
    private _targetValue: number = 0;

    /**
     *  from a to b
     */
    public to(targetValue: number, customDuration?: number, customEasingType?: BPEasingType): void {
        this._stopTween();
        this._to(targetValue, customDuration, customEasingType);
    }

    /**
     *  最后一次的速率和缓动函数决定当前的参数
     */
    public by(deltaValue: number, customDuration?: number, customEasingType?: BPEasingType): void {
        this._stopTween();
        this._to(this._targetValue + deltaValue, customDuration, customEasingType);
    }

    /**
     * 缓动到一个目标值
     * @param targetValue 目标
     * @param customDuration 自定义时间
     * @param customEasingType 自定义缓动类型
     */
    private _to(targetValue: number, customDuration?: number, customEasingType?: BPEasingType): void {
        this._targetValue = targetValue;

        const value = targetValue;
        const duration = customDuration != null ? customDuration : this.duration;
        const easingType = customEasingType ? customEasingType : this.easingType;

        let easingString = BPString.convertFirstLetter(BPEasingType[easingType]);
        if (easingString == "none") {
            easingString = "";
        }

        this._curTween = cc.tween<BPCounterBase>(this)
            .call(() => {
                this._broadcastEvent(BPCounterBase.OnTweenStart);
            })
            .to(duration, { value: value },
                {
                    easing: easingString
                }
            )
            .call(() => {
                this._broadcastEvent(BPCounterBase.OnTweenFinish);
            })
            .start();
    }

    /**
     *  广播事件.
     */
    private _broadcastEvent(eventName: string) {
        //this.node.emit(eventName, this._value, this._targetValue);

        //作为基类用抽象方法模板替代事件
        this[`_${eventName}`](this._value, this._targetValue);
    }

    protected abstract _onTweenStart(value: number, targetValue: number): void;
    protected abstract _onTweenUpdate(value: number, targetValue: number): void;
    protected abstract _onTweenFinish(value: number, targetValue: number): void;
}