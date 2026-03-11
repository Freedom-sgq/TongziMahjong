import { BPViewBase } from "../../component/controls/BPViewBase";
import { BPDelegateBase } from "./BPDelegateBase";
import { BPNodeTraversal } from "../BPNodeTraversal";
import { BPEntityCache, BPEntityCustom, BPEntityModel, BPEntityPanel, IBPEntity } from "./IBPEntity";

// export type BPEntityElement<T extends BPEntityBase, 
// U extends keyof BPEntityContent> = ReturnType<T["getContent"]>[U];

/**
 * @author Tinker
 * @date
 * @description
 */
export abstract class BPEntityBase extends BPDelegateBase implements IBPEntity {
    // ui
    public panel: BPEntityPanel;
    // 静态数据
    public model: BPEntityModel;
    // 缓存
    public cache: BPEntityCache;
    // 自定义
    public custom: BPEntityCustom;

    private _traversal: BPNodeTraversal = null;

    constructor(view: BPViewBase) {
        super(view);
        this._traversal = new BPNodeTraversal(view.getViewNode());
    }

    /**
     * @description
     */
    public getComp<T extends cc.Component = cc.Component>(
        nodeName: string,
        type?: { new(): T } | string,
        useDynamic: boolean = false): T {

        let outNode = this.getNode(nodeName, useDynamic);
        if (!outNode) {
            return null;
        }

        let outComp: T;
        if (typeof type == "string") {
            outComp = outNode.getComponent(type);
        }
        else {
            outComp = outNode.getComponent<T>(type);
        }

        return outComp;
    }

    /**
     * @description
     * 
     */
    public getNode(inNodeName: string, isDynamicNode: boolean = false): cc.Node {
        return this._traversal.getNode(inNodeName, isDynamicNode);
    }

    /**
     * @description
     * 深度遍历查询，没有缓存，效率不高，但没有时效问题
     */
    public findNode(inNodeName: string): cc.Node {
        return this._traversal.findNode(inNodeName);
    }
}