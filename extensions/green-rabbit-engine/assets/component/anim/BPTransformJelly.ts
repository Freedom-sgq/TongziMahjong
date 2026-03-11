import { BPDecorator as BPDec } from "../../util/BPDecorator";
import { BPTransformBase } from "./BPTransformBase";

/**
 * @author Tinker
 * @date
 * @description
 */
@BPDec.ccclass
export class BPTransformJelly extends BPTransformBase {
    @BPDec.property({ tooltip: CC_DEV && '按压缩放' })
    public pressScale: number = 0.2;

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
        const duration = this.duration;
        const defaultScale = this._defaults.scale;

        const pressDuration = duration * 0.2;
        const scaleBackDuration = duration * 0.15;
        const bounceDuration = duration * 0.65;
        const amplitude = this.pressScale / scaleBackDuration;

        let action = cc.tween()
            .to(pressDuration, {
                scaleX: defaultScale + this.pressScale,
                scaleY: defaultScale - this.pressScale
            }, {
                easing: 'sineOut'
            })
            .to(scaleBackDuration, {
                scaleX: defaultScale,
                scaleY: defaultScale
            })
            .to(bounceDuration, {
                scaleX: {
                    value: defaultScale,
                    progress: (start: number, end: number, current: number, t: number) => {
                        return end - this._getDeltaBounce(amplitude, t);
                    }
                },
                scaleY: {
                    value: defaultScale,
                    progress: (start: number, end: number, current: number, t: number) => {
                        return end + this._getDeltaBounce(amplitude, t);
                    }
                }
            })
            .delay(this.repeatInterval);

        return action;
    }

}