import { BPDecorator as BPDec } from "../../util/BPDecorator";
import { BPMaterialBase } from "./BPMaterialBase";

@BPDec.ccclass
@BPDec.executeInEditMode
export class BPGradiantMaterial extends BPMaterialBase {

    @BPDec.property
    private _beginColor: cc.Color = cc.Color.WHITE;
    @BPDec.property({
        tooltip: CC_DEV && "开始颜色"
    })
    public get beginColor(): cc.Color { return this._beginColor; }
    public set beginColor(value: cc.Color) { this._beginColor = value; this.updateMaterial(); }

    @BPDec.property
    private _endColor: cc.Color = cc.Color.WHITE;
    @BPDec.property({
        tooltip: CC_DEV && "结束颜色"
    })
    public get endColor(): cc.Color { return this._endColor; }
    public set endColor(value: cc.Color) { this._endColor = value; this.updateMaterial(); }


    @BPDec.property
    private _angle: number = 0;
    @BPDec.property({
        tooltip: CC_DEV && "渐变角度"
    })
    public get angle(): number { return this._angle; }
    public set angle(value: number) { this._angle = value; this.updateMaterial(); }

    @BPDec.property
    private _offset: number = 0;
    @BPDec.property({
        tooltip: CC_DEV && "偏移",
        min: -1,
        max: 1,
        step: 0.01,
    })
    public get offset(): number { return this._offset; }
    public set offset(value: number) { this._offset = value; this.updateMaterial(); }

    /**
     * 
     */
    public updateMaterial(): void {
        const material = this._material;
        if (!material) return;

        material.setProperty("begin_color", this.beginColor);
        material.setProperty("end_color", this.endColor);
        material.setProperty("angle", this.angle);
        material.setProperty("offset", this.offset);
    }
}