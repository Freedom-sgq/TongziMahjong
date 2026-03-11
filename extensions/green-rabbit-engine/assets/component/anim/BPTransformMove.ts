import { BPDecorator as BPDec } from "../../util/BPDecorator";
import { BPTransformBase } from "./BPTransformBase";

@BPDec.ccclass("PositionFromTo")
class PositionFromTo {
    @BPDec.property({ tooltip: CC_DEV && '从' })
    public from: cc.Vec2 = cc.v2();

    @BPDec.property({ tooltip: CC_DEV && '至' })
    public to: cc.Vec2 = cc.v2();
}


/**
 * @author Tinker
 * @date
 * @description
 */
@BPDec.ccclass
export class BPTransformMove extends BPTransformBase {

    @BPDec.property({ type: PositionFromTo })
    public fromTo: PositionFromTo = new PositionFromTo();

    /**
     * 
     */
    protected _cacheDefaults() {
        return {
            position: this.node.position
        }
    }

    /**
     * 
     */
    protected _makeAction(): cc.Tween {
        const duration = this.duration;
        const from = this.fromTo.from;
        const to = this.fromTo.to;

        const direction = to.sub(from).normalize();
        const moveDuration = 0.5 * duration;
        const bouncingDuration = 0.5 * duration;
        const amplitude = cc.Vec2.distance(from, to) / moveDuration;

        // 播放
        let action = cc.tween()
            .set({ position: cc.v3(from) })
            .to(moveDuration, { position: cc.v3(to) }, { easing: 'quadIn' })
            .to(bouncingDuration, {
                position: {
                    value: cc.v3(to),
                    progress: (start: cc.Vec3, end: cc.Vec3, current: cc.Vec3, t: number) => {
                        const pos = direction.mul(-this._getDeltaBounce(amplitude, t));
                        return end.add(cc.v3(pos.x, pos.y));
                    }
                }
            });

        return action;
    }

}