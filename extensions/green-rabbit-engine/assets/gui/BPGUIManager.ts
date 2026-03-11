import { BPView } from "../component/controls/BPView";
import { BPOpenViewOp, BPViewBase } from "../component/controls/BPViewBase";
import { BPViewConfig } from "../data/BPConfigs";
import { BPLog } from "../util/BPLog";
import { BPLoader } from "../res/BPLoader";
import { BPMap } from "../struct/BPMap";
import { BPSingletonBase } from "../struct/BPSingletonBase";
import { BPStack } from "../struct/BPStack";
import { BPEvent } from "../event/BPEvent";
import { BPEventConfig } from "../event/BPEventConfig";
import { BPDecorator } from "../util/BPDecorator";
import { BPString } from "../util/BPString";
import { BPGameLaunchBase } from "../component/BPGameLaunchBase";

/**
 * @author Tinker
 * @date
 * @description gui
 */
export class BPGUIManager extends BPSingletonBase {
    private _loader: BPLoader = null;
    private _viewConfigMap: BPMap<BPViewConfig> = null;
    private _viewStack: BPStack<BPViewBase> = null;
    private _viewBaseNodePrefabPath: string = "";

    protected constructor() {
        super();

        this._loader = new BPLoader();
        this._viewConfigMap = new BPMap<BPViewConfig>();
        this._viewStack = new BPStack<BPViewBase>();
    }

    /**
     * @description
     */
    public override init(inConfigs: BPViewConfig[], viewBaseNodePrefabPath: string): void {
        for (let i = 0; i < inConfigs.length; ++i) {
            let inConfig = inConfigs[i];
            this._registerView(inConfig);
        }

        this._viewBaseNodePrefabPath = viewBaseNodePrefabPath;
    }

    /**
     * @description
     * 每个BPView组件都有一个独立的viewInsName实例名对应...
     * 默认为view的配置名，如TestView,若有多余实例，则TestView_1/2/3...
     */
    @BPDecorator.serial
    public async openView(inViewName: string, op: BPOpenViewOp = {}) {
        return new Promise<BPView>(async (resolve, reject) => {
            const config: BPViewConfig = this._viewConfigMap.get(inViewName);
            if (config == null) {
                BPLog.engine(`no view config matches name: ${inViewName}...`);
                reject();
                return;
            }

            let viewInsName = inViewName;
            if (config.multiple) {
                const count = this.findViews(inViewName).length;
                viewInsName = `${inViewName}` + (count > 0 ? `_${count}` : "");
            }

            let compView: BPView = this.findView(viewInsName);
            if (compView && cc.isValid(compView.getBaseNode(), true)) {
                const viewNode = compView.getBaseNode();
                if (viewNode.active == false) {
                    // 隐藏的就显示..
                    compView.setActvie(true);
                    compView.getSystem()?.onVisible(op.params);
                    BPEvent.getInstance().emit(BPEventConfig.OnViewOpen, viewInsName);
                }
                else {
                    // 否则实例冲突
                    BPLog.engine(`view ${viewInsName} is already exist...`);
                }
                resolve(compView);
                return;
            }

            const viewUrl: string = config.viewUrl;
            const prefab = await this._loader.loadResAsync(viewUrl, cc.Prefab);
            if (!prefab) {
                BPLog.engine(`error load res ${viewUrl}...`);
                reject();
                return;
            }

            const pbBase = await this._loader.loadResAsync(this._viewBaseNodePrefabPath, cc.Prefab);
            const nodeBase = cc.instantiate(pbBase);
            // 用view的配置名..
            nodeBase.name = inViewName;
            compView = nodeBase.addComponent(BPView);
            if (!compView) {
                BPLog.engine(`can not find component of name: ${inViewName}...`);
                reject();
                return;
            }

            const nodeView = cc.instantiate(prefab);
            nodeView.name = BPViewBase.NodeViewName;
            nodeBase.addChild(nodeView);
            compView.setup(viewInsName, config, op);

            const parent = op.parentNode ?? this.getCanvas().getComponent(BPGameLaunchBase).getNodeUIRoot();
            const zIndex = op.zIndex ?? 0;
            parent.addChild(nodeBase, zIndex);
            BPEvent.getInstance().emit(BPEventConfig.OnViewOpen, viewInsName);
            resolve(compView);
        });
    }

    public hideView(viewInsName: string): void {
        const view = this.findView(viewInsName);
        if (!cc.isValid(view)) return;
        view.getBaseNode().active = false;
    }

    /**
     * @description
     */
    public closeView(inViewInsName: string): void;
    public closeView(inViewComp: BPViewBase): void;
    public closeView(inView: string | BPViewBase): void {
        let compView: BPViewBase;
        if (typeof inView == "string") {
            compView = this.findView(inView);
        }
        else if (inView instanceof BPViewBase) {
            compView = inView;
        }

        if (cc.isValid(compView)) {
            compView.close();
        }
    }

    /**
     * @param {string} inViewInsName view实例名字
     * @param {string[]} excludeViewNames 排除的view名,非实例名
     * @param {boolean} excludeSelf 是否包含该view
     * @description 关闭某个view之后的所有view
     */
    public closeLaterView(inViewInsName: string, excludeViewNames?: string[], excludeSelf?: boolean): void {
        let index = this._viewStack.findIndex((view) => {
            return view.viewInsName == inViewInsName;
        });

        if (index == -1) {
            return;
        }

        index = excludeSelf ? index : index + 1;
        const views = this._viewStack.peek(index);
        for (let i = 0; i < views.length; ++i) {
            const view = views[i];

            // 排除基view
            if (view.isFoundation) {
                continue;
            }

            // 排除viewName, 相关实例都会被排除...
            const viewName = BPString.split(view.viewInsName, "_")[0];
            if (excludeViewNames?.includes(viewName)) {
                continue;
            }

            this.closeView(view);
        }
    }

    /**
     * @param {string} inViewInsName view名字
     * @description 查找一个打开的view
     */
    public findView(inViewInsName: string): BPViewBase {
        const compView = this._viewStack.find((element) => {
            return element.viewInsName == inViewInsName;
        });
        return compView;
    }

    public findViews(inViewName: string): BPViewBase[] {
        const compViews = this._viewStack.find((element) => {
            const viewName = BPString.split(element.viewInsName, "_")[0];
            return viewName == inViewName;
        }, true);
        return compViews;
    }

    /**
     * ....
     */
    public removeViewStack(inCompView: BPViewBase): void {
        this._viewStack?.remove(inCompView);
        BPEvent.getInstance().emit(BPEventConfig.OnViewClose, inCompView.viewInsName);
    }

    /**
     * ....
     */
    public pushViewStack(inCompView: BPViewBase): void {
        this._viewStack.push(inCompView);
    }

    /**
     * ....
     */
    public getCanvas(): cc.Node {
        return cc.director.getScene().getChildByName('Canvas');
    }

    /**
     * ....
     */
    public override destroy(): void {
        super.destroy();
        this._loader.destroy();
        this._viewConfigMap.clear();
        this._viewStack.clear();
        this._viewBaseNodePrefabPath = "";
    }

    /**
     * ....
     */
    private _registerView(inConfig: BPViewConfig): void {
        this._viewConfigMap.set(inConfig.viewName, inConfig);
    }


}