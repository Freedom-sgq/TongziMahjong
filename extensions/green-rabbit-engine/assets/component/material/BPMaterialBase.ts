import { BPDecorator as BPDec } from "../../util/BPDecorator";
import { BPComponentBase } from "../BPComponentBase";

/**
 * @description 材质组件的基类
 */
@BPDec.ccclass
export abstract class BPMaterialBase extends BPComponentBase {

    /**
     * 材质资源
     */
    protected _material: cc.Material = null;

    /**
     * ....
     */
    protected onLoad(): void {
        this._material = this.getComponent(cc.RenderComponent).getMaterial(0);
        this.updateMaterial();
    }

    /**
     * ....
     */
    public abstract updateMaterial(): void;
}