import * as cc from 'cc';
import { BPDecorator } from "../../util/BPDecorator";
import { BPLocalizedLabel } from "../localize/BPLocalizedLabel";
import { DEV } from 'cc/env';

const BPDec = BPDecorator;

@BPDec.ccclass("BPToggleTxtLabel")
export class BPToggleTxtLabel {
    @BPDec.property(cc.Label)
    label: cc.Label = null;

    @BPDec.property(cc.CCString)
    origin: string = "";

    @BPDec.property(cc.CCString)
    mark: string = "";
}

/**
 * 
 */
@BPDec.ccclass
@BPDec.inspector("packages://bp-engine/editor/inspectors/toggle.js")
@BPDec.menu("BPComponents/BPToggle")
export class BPToggle extends cc.Toggle {
    /**
     * 
     */
    @BPDec.property({
        tooltip: DEV && "选中后隐藏的节点",
        type: [cc.Node],
    })
    public hideNodes: cc.Node[] = [];

    /**
     * 
     */
    @BPDec.property({
        tooltip: DEV && "选中后显示的节点",
        type: [cc.Node],
    })
    public markNodes: cc.Node[] = [];

    @BPDec.property({
        tooltip: DEV && "需要变化内容得Label",
        type: [BPToggleTxtLabel],
    })
    public lblTxts: BPToggleTxtLabel[] = [];

    /**
     * 
     */
    protected _updateCheckMark() {
        //@ts-ignore
        super._updateCheckMark();

        for (let i = 0; i < this.hideNodes.length; ++i) {
            this.hideNodes[i].active = !this.isChecked;
        }

        for (let i = 0; i < this.markNodes.length; ++i) {
            this.markNodes[i].active = !!this.isChecked;
        }

        for (let i = 0; i < this.lblTxts.length; ++i) {
            const txt = this.lblTxts[i];
            const lbl = txt.label;
            const cpLocalLizedLabel = lbl.node.getComponent(BPLocalizedLabel);
            if (cpLocalLizedLabel) {
                const strTxt = !this.isChecked ? txt.origin : txt.mark;
                cpLocalLizedLabel.setup(strTxt);
            }
            else {
                lbl.string = !this.isChecked ? txt.origin : txt.mark;
            }
        }
    }


}