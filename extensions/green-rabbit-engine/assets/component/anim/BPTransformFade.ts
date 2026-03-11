import { BPDecorator as BPDec } from "../../util/BPDecorator";
import { BPTransformBase } from "./BPTransformBase";

@BPDec.ccclass("FadeFromTo")
class FadeFromTo {
    @BPDec.property({ tooltip: CC_DEV && '从' })
    public from: number = 0;

    @BPDec.property({ tooltip: CC_DEV && '至' })
    public to: number = 255;
}

/**
 * @author Tinker
 * @date
 * @description
 */
@BPDec.ccclass
export class BPTransformFade extends BPTransformBase {
    @BPDec.property({ type: FadeFromTo, tooltip: CC_DEV && '始终' })
    public fromTo: FadeFromTo = new FadeFromTo();

    /**
     * 
     */
    protected _cacheDefaults() {
        return {
            opacity: this.node.opacity
        }
    }

    /**
     * 
     */
    protected _makeAction(): cc.Tween {
        const fromTo = this.fromTo;
        const delayTime = this.duration * Math.min(this.delayRate, 0.99);
        const playTime = this.duration - delayTime;

        const bouncingTime = playTime * this.bounceRate;
        const fadingTime = playTime - bouncingTime;
        const amplitude = (fromTo.to - fromTo.from) / fadingTime;

        let action = cc.tween()
            .set({ opacity: fromTo.from })
            .delay(delayTime)
            .to(fadingTime, { opacity: fromTo.to })
            .to(bouncingTime, {
                opacity: {
                    value: fromTo.to,
                    progress: (start: number, end: number, current: number, t: number) => {
                        return end + this._getDeltaBounce(amplitude, t);
                    }
                }
            })
            .delay(this.repeatInterval);

        return action;
    }
}