import { BPDecorator as BPDec } from "../../util/BPDecorator";
import { BPTransformBase } from "./BPTransformBase";

@BPDec.ccclass("ScaleFromTo")
class ScaleFromTo {
    @BPDec.property({ tooltip: CC_DEV && '从' })
    public from: number = 0.5;

    @BPDec.property({ tooltip: CC_DEV && '至' })
    public to: number = 1;
}

/**
 * @author Tinker
 * @date
 * @description
 */
@BPDec.ccclass
export class BPTransformScale extends BPTransformBase {
    @BPDec.property({ type: ScaleFromTo, tooltip: CC_DEV && '始终' })
    public fromTo: ScaleFromTo = new ScaleFromTo();

    /**
     * 
     */
    protected _cacheDefaults() {
        return {
            scale: this.node.scale
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
        const scalingTime = playTime - bouncingTime;
        const amplitude = (fromTo.to - fromTo.from) / scalingTime;

        const cpWidget = this.node.getComponent(cc.Widget);
        if (cpWidget) {
            cpWidget.updateAlignment();
            cpWidget.enabled = false;
        }
        let action = cc.tween()
            .set({ scale: fromTo.from })
            .delay(delayTime)
            .to(scalingTime, { scale: fromTo.to })
            .call(()=> {
                cpWidget && (cpWidget.enabled = true);
            })
            .to(bouncingTime, {
                scale: {
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