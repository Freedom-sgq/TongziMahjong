import * as cc from 'cc';
import { BPComponentBase } from "../BPComponentBase";
import { BPDecorator as BPDec } from "../../util/BPDecorator";
import { DEV } from "cc/env";

@BPDec.ccclass
export class BPToggleGroup extends BPComponentBase {
    static readonly OnCheckBoxChanged = "OnCheckBoxChanged";
    static readonly OnRadioButtonChanged = "OnRadioButtonChanged";

    /**
     * 
     */
    @BPDec.property
    private _maxCheckCount: number = 0;

    @BPDec.property({
        tooltip: DEV && "复选数量\n[0]: 退化为RadioButton，只能切换 \n[1,n): CheckBox的复选数量"
    })
    public get maxCheckCount() {
        return this._maxCheckCount;
    }
    public set maxCheckCount(maxCount: number) {
        this._maxCheckCount = maxCount;
    }

    @BPDec.property
    private _defaultTabName: string = "";

    @BPDec.property({
        tooltip: DEV && "RadioButton默认check的节点名",
        visible() { return this._maxCheckCount == 0 }
    })
    public get defaultTabName() {
        return this._defaultTabName;
    }
    public set defaultTabName(name: string) {
        this._defaultTabName = name;
    }

    private _lastToggle: cc.Toggle = null;
    private _toggles: Array<cc.Toggle> = null;

    /**
     * 
     */
    protected override onLoad(): void {
        this._initToggles();
        this._updateToggles();
    }

    protected override onStart(): void {
        this._hitToggle(this._lastToggle, true);
    }

    /**
     * 获取当前选中状态信息
     */
    public getStatus() {
        let checkedList: Array<cc.Toggle> = [];
        let unCheckedList: Array<cc.Toggle> = [];

        if (this._toggles) {
            for (let i = 0; i < this._toggles.length; ++i) {
                let toggle = this._toggles[i];
                toggle.isChecked ? checkedList.push(toggle) : unCheckedList.push(toggle);
            }
        }
        return [checkedList, unCheckedList];
    }

    /**
     * 切换页签...
     */
    public switch(index: number) {
        if (!this._isRadioButton()) {
            return;
        }

        const toggle = this._toggles[index];
        this._hitToggle(toggle);
    }

    /**
     * 
     * @returns 
     */
    public getToggles() {
        return this._toggles;
    }

    public getToggle(index: number) {
        return this._toggles[index];
    }

    public getToggleByName(name: string) {
        return this._toggles.find((toggle) => toggle.node.name == name);
    }

    /**
     * 是否是RadioButton
     *
     */
    private _isRadioButton() {
        return this._maxCheckCount == 0;
    }

    /**
     * 是否是上次操作toggle
     */
    private _isLastToggle(toggle: cc.Toggle) {
        return this._lastToggle == toggle;
    }

    /**
     * 
     */
    private _initToggles() {
        this._toggles = this.node?.children.map((node) => {
            let toggle = node.getComponent(cc.Toggle);
            toggle && (toggle.isChecked = false);
            toggle && node.on("toggle", this._hitToggle, this);
            if (node.name == this._defaultTabName) {
                this._lastToggle = toggle;
            }
            return toggle;
        }).filter(Boolean);
    }

    /**
     *  更新按钮状态
     */
    private _updateToggles() {
        for (let i = 0; i < this._toggles.length; ++i) {
            const toggle = this._toggles[i];
            if (this._isRadioButton()) {
                toggle.isChecked = this._isLastToggle(toggle);
            }
            else {
                const [checkedList] = this.getStatus();
                const checkedCount = checkedList.length;
                // 上次操作是回溯还是保留
                if (this._isLastToggle(toggle)) {
                    toggle.isChecked = checkedCount > this._maxCheckCount ? !toggle.isChecked : toggle.isChecked;
                }
                // 是否可交互
                toggle.interactable = checkedCount >= this._maxCheckCount ? toggle.isChecked : true;
            }
        }
    }

    /**
     * 
     */
    private _hitToggle(toggle: cc.Toggle, isFake = false) {
        if (!toggle) return;

        if (this._isRadioButton()) {
            const lastToggle = this._lastToggle;
            this._lastToggle = toggle;
            this._updateToggles();

            if (isFake || !this._isLastToggle(lastToggle)) {
                this.node.emit(BPToggleGroup.OnRadioButtonChanged, toggle, lastToggle);
            }
        }
        else {
            this._lastToggle = toggle;
            this._updateToggles();
            this.node.emit(BPToggleGroup.OnCheckBoxChanged, toggle, ...this.getStatus());
        }
    }


}