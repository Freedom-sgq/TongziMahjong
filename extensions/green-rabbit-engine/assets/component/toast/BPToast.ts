import { BPModule, bp } from "BPEngine";
import { BPToastComponent } from "./BPToastComponent";
import { BPDecorator as BPDec } from "../../util/BPDecorator";
import { BPComponentBase } from "../BPComponentBase";

export enum EnumToastType {
    Ladder = 0,
    Scale = 1,
}


@BPDec.ccclass
export class BPToast extends BPComponentBase {

    @BPDec.property(cc.Prefab)
    prefabToast: cc.Prefab = null;

    @BPDec.property({ type: cc.Enum(EnumToastType) })
    toastType = EnumToastType.Ladder;

    @BPDec.property({ tooltip: "展示时间" })
    displayTime = 1.5;

    @BPDec.property({ tooltip: "缩放时间" })
    scaleTime = 0.2;

    @BPDec.property({ tooltip: "垂直偏移" })
    offsetY = 10;

    private _toastHeight: number = 0;
    private _arrHide: Array<cc.Node> = [];
    private _arrToast: Array<cc.Node> = [];
    private _arrContent: Array<string> = [];
    private _toastContentFuc?: (node: cc.Node, str: string) => void = undefined;

    protected override onLoad(): void {
        super.onLoad && super.onLoad();
        this.node.zIndex = bp.constant.UIMaxZIndex;
        this._toastHeight = this.prefabToast.data.height + this.offsetY;
    }

    public show(content: string): void {
        if (!content) content = 'no content';
        content += '';

        // 最多显示4个
        if (this._arrToast.length > 3) {
            this._arrContent.push(content);
            return;
        }

        switch (this.toastType) {
            case EnumToastType.Ladder:
                this._showLadderToast(content);
                break;

            case EnumToastType.Scale:
                this._showScaleToast(content);
                break;
        }
    }

    public setToastContentFuc(func: (node: cc.Node, str: string) => void): void {
        this._toastContentFuc = func;
    }

    private _getToastItem(): cc.Node {
        let node = this._arrHide.shift();
        if (!node) {
            node = cc.instantiate(this.prefabToast);
            node.parent = this.node;
        }

        node.stopAllActions();
        node.opacity = 0;
        node.scale = 0;
        return node;
    }

    private _showScaleToast(content: string): void {
        const node = this._getToastItem();
        const comp = node.getComponent(BPToastComponent);
        comp.setContentFuc(this._toastContentFuc);
        comp.setContent(content);

        cc.tween(node)
            .to(this.scaleTime, { scale: 1, opacity: 255 })
            .delay(this.displayTime)
            .to(this.scaleTime, { opacity: 0 }, { easing: 'backOut' })
            .call(() => {
                this._arrHide.push(node);

                const content = this._arrContent.shift();
                content && this.show(content);
            })
            .start();
    }

    private _showLadderToast(content: string): void {
        const node = this._getToastItem();
        const comp = node.getComponent(BPToastComponent);
        comp.setContentFuc(this._toastContentFuc);
        comp.setContent(content);

        cc.tween(node)
            .to(this.scaleTime, { scale: 1, opacity: 255 })
            .delay(this.displayTime)
            .to(this.scaleTime, { opacity: 0 }/*, {easing: 'sineOut'}*/)
            .call(() => {
                comp.setContent('');
                let item = this._arrToast.shift();
                this._arrHide.push(item);

                const content = this._arrContent.shift();
                content && this.show(content);
            })
            .start();

        this._arrToast.push(node);
        let len = this._arrToast.length;
        for (let i = 0; i < len; ++i) {
            this._arrToast[i].y = this._toastHeight * (len - 1 - i);
        }
    }
}