import { BPViewBase } from "../../component/controls/BPViewBase";

/**
 * @author Tinker
 * @date
 * @description
 */
export abstract class BPDelegateBase {
    private _view: BPViewBase;
    
    constructor(view: BPViewBase) {
        this._view = view;
    }

    /**
     * view组件
     */
    public getView() {
        return this._view;
    }

    /**
     * view预制体中得根节点
     */
    public getViewNode() {
        return this._view.getViewNode();
    }

    /**
     * 自动创建的外层根节点
     */
    public getBaseNode() {
        return this._view.getBaseNode();
    }
}