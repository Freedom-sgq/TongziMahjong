import { BPDecorator as BPDec } from "../../util/BPDecorator";
import { BPTrackBase } from "./BPTrackBase";

/**
 * @author Tinker
 * @date
 * @description
 */
@BPDec.ccclass("BPTrackEllipse")
export class BPTrackEllipse extends BPTrackBase {
    @BPDec.property({ tooltip: CC_DEV && "长轴" })
    public axisA = 0;

    @BPDec.property({ tooltip: CC_DEV && "短轴" })
    public axisB = 0;

    protected _interval: number = 360;

    /**
     *  椭圆方程
     */
    public getPoint(value: number): cc.Vec2 {
        const interval = this._interval;
        const per = interval / 4;
        const per2 = interval / 2;
        const per3 = 3 * interval / 4;

        let cull = this._cullValue(value);
        if (cull < 0) {
            cull = cull + this._interval;
        }

        let squareA = this.axisA * this.axisA;
        let squareB = this.axisB * this.axisB;

        let k = Math.tan(cc.misc.degreesToRadians(cull));
        let x = Math.sqrt((squareB) / ((k * k) + (squareB) / (squareA)));
        if (cull > per && cull < per3) {
            x = -x;
        }

        let y = Math.sqrt((squareB) - (squareB) * (x * x) / (squareA));
        if (cull > per2) {
            y = -y;
        }

        return cc.v2(x, y);
    }

    getScale(pos: cc.Vec2): number {
        return 1;
    }

    /**
     * 
     */
    onAfterUpdatePos(cell: cc.Node): void {
        cell.zIndex = -cell.y;
    }

}