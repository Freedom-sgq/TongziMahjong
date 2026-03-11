import { BPDecorator as BPDec } from "../../util/BPDecorator";
import { BPSingletonBase } from "../../struct/BPSingletonBase";
import { BPDecalUnit, BPDecalUnitNotifyType } from "./BPDecalUnit";
import { BPString } from "../../util/BPString";
import { BPLog } from "../../util/BPLog";
import { BPEvent } from "../../event/BPEvent";
import { BPDecalGroup } from "./BPDecalGroup";

const TreeRootName = "DecalRoot";

export interface BPDecalEventParams {
    routeName?: string,
    value?: number;
}

/**
 * @author Tinker
 * @description 贴花组件，用于实现节点的装饰;
 */
@BPDec.ccclass
export class BPDecalManager extends BPSingletonBase {
    /**
     * 
     */
    private _root: BPDecalUnit = null;

    /**
     * 
     */
    protected constructor() {
        super();
        this._root = new BPDecalUnit(TreeRootName);
    }

    /**
     * @description 注册监听消息,单元数值权重变更会发送消息
     * 
     */
    public register(routeName: string, callback: (eventParams: BPDecalEventParams) => void,
        target: BPDecalGroup, type?: BPDecalUnitNotifyType) {

        BPEvent.getInstance().on(routeName, callback, target);
        let [unit] = this._findUnit(routeName);
        if (unit == null) {
            unit = this._makeUnit(routeName);
        }
        unit.setNotifyType(type);
        unit.emitEvent();
    }

    /**
     * @description 变更一个单元数据
     * 没有单元会创建一个对应单元
     */
    public updateUnit(routeName: string, value: number): void {
        let [unit] = this._findUnit(routeName);
        if (unit == null) {
            // 没有就创建单元..
            unit = this._makeUnit(routeName);
        }

        if (!unit.isLeaf()) {
            BPLog.error(`updateUnit must from leaf unit!`);
            return;
        }

        unit.updateValue(value);
    }

    public getUnitValue(routeName: string): number {
        let [unit] = this._findUnit(routeName);
        return unit?.getValue() ?? 0;
    }

    /**
     * 
     */
    private _makeUnit(routeName: string) {
        const [nameList, nameCount, unitName] = this._parseRouteName(routeName);
        if (!nameCount) {
            return null;
        }

        let parent = this._root;
        for (let i = 0; i < nameCount - 1; ++i) {
            let childName = nameList[i];
            let child = parent.getChild(childName);
            if (child == null) {
                child = new BPDecalUnit(childName);
                child.setParent(parent);
            }
            parent = child;
        }

        let unit = parent.getChild(unitName);
        if (!unit) {
            unit = new BPDecalUnit(unitName);
            unit.setParent(parent);
        }

        return unit;
    }

    /**
     * @description 移除一个单元节点
     */
    public removeUnit(routeName: string): void {
        let [unit] = this._findUnit(routeName);
        if (unit == null) {
            return;
        }

        unit.removeFromParent();
    }

    /**
     *
     */
    public destroy(): void {
        super.destroy();
        this._root.clear();
    }

    /**
     * @description 找到对应的单元
     * 如果路径错误，则返回null
     */
    private _findUnit(routeName: string): [BPDecalUnit, BPDecalUnit, string] {
        let [nameList, nameCount] = this._parseRouteName(routeName);

        let parent = this._root;
        for (let i = 0; i < nameCount - 1; ++i) {
            let childName = nameList[i];
            parent = parent.getChild(childName);
            if (parent == null) {
                return [null, null, null];
            }
        }

        // 路径正确
        let unitName = nameList[nameList.length - 1];
        let unit = parent.getChild(unitName);
        return [unit, parent, unitName];
    }

    /**
     * @description 解析路径信息返回必要参数
     */
    private _parseRouteName(routeName: string): [Array<string>, number, string] {
        // 拆解routeName, name1.name2.name3 => nameCount: 3
        let nameList = BPString.split(routeName, ".");
        let nameCount = nameList.length;
        if (nameCount < 1) {
            BPLog.error(`parse route name failed reason is : 【${routeName}】 is not valid...`);
            return [null, null, null];
        }

        return [nameList, nameCount, nameList[nameCount - 1]];
    }

}
