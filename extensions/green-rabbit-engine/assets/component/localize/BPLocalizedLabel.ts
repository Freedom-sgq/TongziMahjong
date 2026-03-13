import * as cc from 'cc';
import { BPLang } from "../../util/BPLang";
import { BPFunc } from "../../util/BPType";
import { BPDecorator as BPDec } from "../../util/BPDecorator";
import { BPLocalizedBase } from "./BPLocalizedBase";
import { EDITOR } from 'cc/env';

/**
 * 多语言label支持
 */
@BPDec.ccclass
@BPDec.disallowMultiple
@BPDec.executeInEditMode
@BPDec.menu("BPComponents/BPLocalizedLabel")
export class BPLocalizedLabel extends BPLocalizedBase {
    private _option: Record<string, any> | null = null;
    protected _renderComponent: cc.Label | cc.RichText = null;

    /**
     * 
     */
    protected override onPreload(): void {
        this._renderComponent = this.node.getComponent(cc.Label) || this.node.getComponent(cc.RichText);
        if (this._renderComponent == null) {
            cc.error(`failed to update BPLocalizedLabel in node ${this.node.name}, cc.Label or cc.RichText is needed!`);
            return null;
        }
        this._updateRenderComponent();
    }

    /**
     * @example
     * lbl.setup("test.hello", { name: "world" });
     */
    public override setup(key: string, option?: Record<string, any>): void {
        this._option = option;
        this.key = key;
        this._updateRenderComponentEditor();
    }
    
    /**
     * 只更新op.适用于编辑器配置了key
     * @example %{name} flush({name: "张三"})
     */
    public flush(option?: Record<string, any>): void {
        this._option = option;
        this._updateRenderComponent();
    }

    /**
     * @implements BPLocalizedBase
     */
    protected _updateRenderComponent(): void {
        if (!this._renderComponent) { return; };

        let text = BPLang.getInstance().getText(this._key, this._option);
        this._renderComponent.string = text;
    }

    /**
     * @implements BPLocalizedBase
     */
    protected _updateRenderComponentEditor(onComplete?: BPFunc<any[], any>): void {
        if (!EDITOR) { return; }

        this._updateRenderComponent();
        onComplete?.();
    }
}
