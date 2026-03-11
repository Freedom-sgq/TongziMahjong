import { BPDecorator as BPDec } from "../../util/BPDecorator";
import { BPComponentBase } from "../BPComponentBase";

@BPDec.ccclass
@BPDec.disallowMultiple
@BPDec.menu("BPComponents/BPToast")
export class BPToastComponent extends BPComponentBase {
    @BPDec.property(cc.RichText)
    rt_toast: cc.RichText = null;

    contentFuc?: (node: cc.Node, str: string) => void = undefined;

    setContent(content: string): void {
        if (this.contentFuc) {
            this.contentFuc(this.node, content);
        } else {
            this.rt_toast && (this.rt_toast.string = content);
        }
    }

    public setContentFuc(func?: (node: cc.Node, str: string) => void) {
        this.contentFuc = func;
    }
}