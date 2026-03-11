import { BPDecorator } from "../../util/BPDecorator";
import { BPLocalizedLabel } from "../localize/BPLocalizedLabel";

const BPDec = BPDecorator;

@BPDec.ccclass("BPToggleColorNode")
export class BPToggleColorNode {
    @BPDec.property(cc.Node)
    node: cc.Node = null;

    @BPDec.property(cc.Color)
    origin: cc.Color = cc.Color.WHITE;

    @BPDec.property(cc.Color)
    mark: cc.Color = cc.Color.WHITE;
}

@BPDec.ccclass("BPToggleTxtLabel")
export class BPToggleTxtLabel {
    @BPDec.property(cc.Label)
    label: cc.Label = null;

    @BPDec.property(cc.String)
    origin: string = "";

    @BPDec.property(cc.String)
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
        tooltip: CC_DEV && "选中后隐藏的节点",
        type: [cc.Node],
    })
    public hideNodes: cc.Node[] = [];

    /**
     * 
     */
    @BPDec.property({
        tooltip: CC_DEV && "选中后显示的节点",
        type: [cc.Node],
    })
    public markNodes: cc.Node[] = [];

    @BPDec.property({
        tooltip: CC_DEV && "需要变化颜色得节点",
        type: [BPToggleColorNode],
    })
    public colorNodes: BPToggleColorNode[] = [];

    @BPDec.property({
        tooltip: CC_DEV && "需要变化内容得Label",
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

        for (let i = 0; i < this.colorNodes.length; ++i) {
            const colorNode = this.colorNodes[i];
            if (colorNode.node) {
                colorNode.node.color = !this.isChecked ? colorNode.origin : colorNode.mark;
            }
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