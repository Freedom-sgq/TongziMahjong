import { BPFunc } from "../../util/BPType";
import { BPDecorator as BPDec } from "../../util/BPDecorator";
import { BPComponentBase } from "../BPComponentBase";

/**
 * 
 */
export abstract class BPLocalizedBase extends BPComponentBase {
    /**
     * 多语言的key字符串
     */
    @BPDec.property
    protected _key: string = "";

    /**
     * ....
     */
    @BPDec.property
    public get key(): string { return this._key; }
    public set key(value: string) {
        if (this._key == value) { return; }
        this._key = value;

        if (CC_EDITOR) {
            //this._updateRenderComponentEditor();
        }
        else {
            this._updateRenderComponent();
        }
    }

    /**
     * 对应的渲染组件
     */
    protected abstract _renderComponent: cc.Label | cc.RichText | cc.Sprite;

    /**
     * 由变更localized key驱动的更新..
     */
    public abstract setup(key: string, option?: Record<string, any>): void;

    /**
     * 更新渲染组件,运行时
     */
    protected abstract _updateRenderComponent(): void;

    /**
     * 更新编辑器对应cocos内置组件的绑定和inspector信息
     */
    protected abstract _updateRenderComponentEditor(onComplete?: BPFunc<any[], any>): void;
}