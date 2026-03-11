import { BPModule, bp } from "BPEngine";
import { BPComponentBase } from "../BPComponentBase";
import { BPDecorator as BPDec } from "../../util/BPDecorator";
import { BPToggleGroup } from "./BPToggleGroup";
import {BPGUIManager} from "../../gui/BPGUIManager";

const TabNodeNamePrefix = "TAB_";

/**
 * @author Tinker
 * @date
 * @description Tab页签管理Page
 */
@BPDec.ccclass
export class BPTabPageControl extends BPComponentBase {
    static readonly OnPageCreate = "OnPageCreate";
    static readonly OnPageActive = "OnPageActive";
    static readonly OnPageHide = "OnPageHide";

    @BPDec.property({
        type: BPToggleGroup,
        tooltip: CC_DEV && "命名规则TAB_XXX, XXX为Page中的节点名"
    })
    public tabContainer: BPToggleGroup = null;

    @BPDec.property({
        type: cc.Node,
        tooltip: CC_DEV && "通过名字映射Page中的节点如TAB_TestView会映射到该容器下TestView节点"
    })
    public pageContainer: cc.Node = null;

    /**
     * 
     */
    protected override onLoad(): void {
        this.tabContainer?.node.on(BPToggleGroup.OnRadioButtonChanged, this._onRadioButtonChanged, this);
    }

    /**
     * 
     */
    public switchToPage(param: number | string) {
        if (!this.pageContainer) {
            return;
        }

        if (typeof param == "number") {
            this.tabContainer.switch(param);
        } else {
            const toggles = this.tabContainer.getToggles();
            for (let i = 0; i < toggles.length; ++i) {
                if (toggles[i].node.name == TabNodeNamePrefix + param) {
                    this.tabContainer.switch(i);
                    break;
                }
            }
        }
    }

    /**
     * 找page节点
     */
    public getPage(param: number | string): [cc.Node, string] {
        if (typeof param == "number") {
            param = this._getPageName(this.tabContainer.getToggle(param)?.node);
        }
        const page = this.pageContainer.getChildByName(param);
        return [page, param];
    }

    /**
     * 
     */
    public getAllPageNames() {
        let names = [];
        const toggles = this.tabContainer.getToggles();
        for (let i = 0; i < toggles.length; ++i) {
            const name = toggles[i].node.name;
            names.push(name.substring(TabNodeNamePrefix.length));
        }
        return names;
    }

    /**
     * 
     */
    private _getPageName(tab: cc.Node) {
        return tab.name.substring(TabNodeNamePrefix.length);
    }

    /**
     * 
     */
    private _onRadioButtonChanged(tab: cc.Toggle, lastTab: cc.Toggle) {
        this._updatePageVisible(this._getPageName(tab.node), true);

        if (!lastTab) { return; }
        this._updatePageVisible(this._getPageName(lastTab.node), false);
    }

    /**
     * 
     */
    private _updatePageVisible(pageName: string, bVisible: boolean) {
        const [page] = this.getPage(pageName);
        if (page) {
            // page.active = bVisible;
            bVisible ? BPGUIManager.getInstance().openView(pageName) : BPGUIManager.getInstance().hideView(pageName);
            //cc.log(`子页： ${pageName} ... 显示：${bVisible}`);
            bVisible && this.node.emit(BPTabPageControl.OnPageActive, this.pageContainer, pageName, page);
            !bVisible && this.node.emit(BPTabPageControl.OnPageHide, this.pageContainer, pageName, page);
        }
        else {
            bVisible && this.node.emit(BPTabPageControl.OnPageCreate, this.pageContainer, pageName);
        }
    }

    /**
     * 
     */
    protected override onDestroy(): void {

    }
}