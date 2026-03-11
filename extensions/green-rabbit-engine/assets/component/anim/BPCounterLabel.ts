import { BPDecorator as BPDec } from "../../util/BPDecorator";
import { BPString } from "../../util/BPString";
import { BPCounterBase } from "./BPCounterBase";


/**
 * @author Tinker
 * @date
 * @description 变化label
 */
@BPDec.ccclass
export class BPCounterLabel extends BPCounterBase {

    @BPDec.property()
    public txtformat: string = "${value}";

    /**
     * 
     */
    private _label: cc.Label = null;
    public get label(): cc.Label {
        if (!this._label) {
            this._label = this.getComponent(cc.Label);
        }

        return this._label;
    }

    /**
     * @implements BPCounterBase
     */
    protected _onTweenStart(value: number, targetValue: number): void {
    }

    /**
     * @implements BPCounterBase
     */
    protected _onTweenUpdate(value: number, targetValue: number): void {
        this.label.string = BPString.format(this.txtformat, value);
    }

    /**
     * @implements BPCounterBase
     */
    protected _onTweenFinish(value: number, targetValue: number): void {
    }
}