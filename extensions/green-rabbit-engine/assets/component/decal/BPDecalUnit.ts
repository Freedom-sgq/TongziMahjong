import { BPEvent } from "../../event/BPEvent";
import { BPMap } from "../../struct/BPMap";
import { BPLog } from "../../util/BPLog";

/**
 * 通知类型
 */
export enum BPDecalUnitNotifyType {
    /**
     * 经历过0或者非0变化，才通知
     */
    OnlyZero = 0,

    /**
     * 只要变化，总是通知
     */
    Always = 1,
}

/**
 * @author Tinker
 * @date
 * @description 贴花单元
 */
export class BPDecalUnit {
    /**
     * 单元名称
     */
    private _unitName: string;

    /**
     * 路径名称
     */
    private _routeName: string = "";

    /**
     * 事件通知类型
     */
    private _notifyType: BPDecalUnitNotifyType;

    /**
     * 抽象权重
     */
    private _value: number;

    /**
     *  子单元集合引用
     */
    private _children: BPMap<BPDecalUnit> = new BPMap<BPDecalUnit>();

    /**
     *  父单元引用
     */
    private _parent: BPDecalUnit = null;

    /**
     * 
     */
    constructor(name: string) {
        this._unitName = name;
        this._notifyType = BPDecalUnitNotifyType.OnlyZero;
        this._value = 0;
    }

    /**
     * @description 更新抽象权重, 根据单元属性确定是否发送事件通知, 会向上冒泡更新
     */
    public updateValue(newValue: number) {
        if (newValue == null) {
            return;
        }

        // 没变化不处理
        if (newValue == this._value) {
            return;
        }

        let oldValue = this._value;
        let deltaValue = newValue - oldValue;
        this._value = newValue;

        let needNotify = false;
        if (this._notifyType == BPDecalUnitNotifyType.OnlyZero) {
            // 若乘积为0, 则表示经历了0和非0的变化 
            needNotify = (oldValue * newValue == 0);
        }
        else if (this._notifyType == BPDecalUnitNotifyType.Always) {
            // 只要变化, 即通知
            needNotify = true;
        }

        // 先抛子节点事件
        needNotify && this.emitEvent();
        // 再向父更新
        this._updateParent(deltaValue);
    }

    /**
     * 
     */
    public setNotifyType(type: BPDecalUnitNotifyType) {
        if (type == null) {
            return;
        }
        this._notifyType = type;
    }

    /**
     *  是否为根节点
     */
    public isRoot() {
        return (this.getParent() == null);
    }

    public isLeaf(): boolean {
        return this._children.size() === 0;
    }

    /**
     * @description 冒泡更新
     */
    private _updateParent(deltaValue: number) {
        if (deltaValue == null || deltaValue == 0) {
            return;
        }

        let parent = this.getParent();
        if (parent == null || parent.isRoot() == true) {
            return;
        }

        parent.updateValue(parent.getValue() + deltaValue);
    }

    /**
     * @description 设置父单元，更新路径名称
     */
    public setParent(parent: BPDecalUnit): void {
        if (parent == null) {
            return;
        }

        if (this._parent != null) {
            BPLog.error("已有父节点...");
            return;
        }

        // 绑定关系
        this._parent = parent;
        this._parent.addChild(this);

        // 屏蔽根节点路径
        if (parent.isRoot() == true) {
            this._routeName = this._unitName;
        }
        else {
            this._routeName = parent.getRouteName() + "." + this._unitName;
        }

        this._updateParent(this._value);
    }

    /**
     * @description
     */
    public removeFromParent(): void {
        // 无父节点
        if (this._parent == null) {
            return;
        }

        this.clear();
    }

    /**
     *  @description 获取抽象权重
     */
    public getValue(): number {
        return this._value;
    }

    /**
     * @description 获取单元名称
     */
    public getName(): string {
        return this._unitName;
    }

    /**
     * @description 获取路径名称
     */
    public getRouteName(): string {
        return this._routeName;
    }

    /**
     * @description 查询一个自有子单元
     */
    public getChild(name: string): BPDecalUnit {
        return this._children.get(name);
    }

    /**
     * @description 新增一个子单元
     */
    public addChild(unit: BPDecalUnit): void {
        if (unit == null) {
            return;
        }

        this._children.set(unit.getName(), unit);
    }

    /**
     * @description 删除一个子单元
     */
    public removeChild(unit: BPDecalUnit): void {
        if (unit == null) {
            return;
        }

        this._children.delete(unit.getName());
    }

    /**
     * @description 获取当前单元的父单元
     */
    public getParent(): BPDecalUnit {
        return this._parent;
    }

    /**
     * @description 清理
     */
    public clear() {
        this.updateValue(0);
        this._parent?.removeChild(this);
        this._parent = null;
        this._routeName = "";
        this._unitName = "";

        // 会处递归处理子单元的数据
        this._children.forEach((_, child) => {
            child.clear();
        });
    }

    /**
     *  @description 发送更新事件
     */
    public emitEvent() {
        BPLog.engine(`Decal Event ===> eventName: ${this._routeName}, value: ${this._value}`);
        BPEvent.getInstance().emit(this._routeName, {
            routeName: this._routeName,
            value: this._value,
        });
    }

}
