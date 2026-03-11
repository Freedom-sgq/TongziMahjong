import { BPDecorator as BPDec } from "../../util/BPDecorator";
import { BPTrackBase } from "./BPTrackBase";

/**
 * @author Tinker
 * @date
 * @description
 */
@BPDec.ccclass("BPTrackLine")
export class BPTrackLine extends BPTrackBase {
    @BPDec.property({ tooltip: CC_DEV && "水平轴长" })
    public axisHorizon = 0;

    protected _interval: number = 300;

    /**
     *  水平直线方程
     */
    getPoint(value: number): cc.Vec2 {
        let interval = this._interval;
        let culling = this._cullValue(value);

        if (culling < -0.5 * interval) {
            culling = interval + culling;
        }

        if (culling > 0.5 * interval) {
            culling = culling - interval;
        }

        let x = this.axisHorizon * culling / (interval);
        let y = 0;

        return cc.v2(x, y);
    }

    getScale(pos: cc.Vec2): number {
        return 1;
    }

    /**
     *  水平方向遮挡
     */
    onAfterUpdatePos(cell: cc.Node): void {
        cell.zIndex = -cell.x;
    }

}