import * as cc from 'cc';
import { BPComponentBase } from "../BPComponentBase";
import { IBPSystem } from "../../gui/delegate/IBPSystem";
import { IBPEntity } from "../../gui/delegate/IBPEntity";
import { BPSystemBase } from "../../gui/delegate/BPSystemBase";
import { BPDelegateFactory } from "../../gui/delegate/BPDelegateFactory";
import { BPViewConfig } from "../../data/BPConfigs";
import { BPGUIManager } from "../../gui/BPGUIManager";
import { BPTransformScale } from '../anim/BPTransformScale';


/**
 * 
 */
export enum BPViewAnimType {
    None = 0,
    Scale = 1,
}

/**
 * ....
 */
export interface BPOpenViewOp {
    params?: Record<string, any> & { jumpParams?: string },
    parentNode?: cc.Node,
    parentView?: BPViewBase,
    zIndex?: number,
    noContainerBlock?: boolean,
    onLoad?: OnLoadCallback,
    onDestroy?: OnDestroyCallback,
};

type OnLoadCallback = (viewSystem: BPSystemBase) => void;
type OnDestroyCallback = (viewSystem: BPSystemBase) => void;

/**
 * 
 */
export abstract class BPViewBase extends BPComponentBase {
    public static readonly NodeViewName = "ND_View";
    public static readonly NodeMaskName = "ND_Mask";

    protected _canTickSystem: boolean = false;

    protected _entity: IBPEntity;
    protected _system: IBPSystem;

    protected _viewInsName: string;
    protected _parentView: BPViewBase;

    protected _noContainerBlock: boolean = false;
    // 模态默认是开启
    protected _useModal: boolean = true;
    // 遮罩默认是关闭
    protected _useMask: boolean = false;
    // 点击空白处关闭
    protected _useBlankClose: boolean = false;
    protected _anim: BPViewAnimType = BPViewAnimType.None;
    // 根基view标志
    protected _isFoundation: boolean = false;

    private _onLoadCallback: OnLoadCallback;
    private _onDestroyCallback: OnDestroyCallback;

    constructor() {
        super();
    }

    /**
     * @description
     */
    public setup(viewInsName: string, config: BPViewConfig, op: BPOpenViewOp): void {
        const factory = new BPDelegateFactory(config.systemClass, config.entityClass);
        this._entity = factory.createEntity(this);
        this._system = factory.createSystem(this, this._entity, op.params);

        this._viewInsName = viewInsName;
        this._parentView = op.parentView;
        this._noContainerBlock = op.noContainerBlock ?? this._noContainerBlock;

        this._useModal = config.useModal ?? this._useModal;
        this._useMask = config.useMask ?? this._useMask;
        this._useBlankClose = config.useBlankClose ?? this._useBlankClose;
        this._anim = config.anim ?? this._anim;
        this._isFoundation = op.parentView?.isFoundation ?? config.isFoundation ?? false;

        this._onLoadCallback = op.onLoad;
        this._onDestroyCallback = op.onDestroy;
    }

    public get viewInsName(): string {
        return this._viewInsName;
    }

    /**
     * 
     */
    public getParentView() {
        return this._parentView;
    }

    /**
     *  默认根节点
     */
    public getBaseNode() {
        return this.node;
    }

    /**
     *  界面Prefab中的底根节点
     */
    public getViewNode() {
        return this.node.getChildByName(BPViewBase.NodeViewName);
    }

    /**
     * 
     */
    public getSystem<T extends BPSystemBase>(): T {
        return this._system as T;
    }

    /**
     * 
     */
    public setActvie(v: boolean) {
        this.node.active = v;
    }

    /**
     * @description
     */
    public close(): void {
        if (!this._system?.onCheckClose?.()) {
            return;
        }

        const baseNode = this.getBaseNode();
        if (cc.isValid(baseNode)) {
            baseNode.destroy();
        }
    }


    /**
     * @description
     */
    public setCanTickLogic(bCanTick: boolean) {
        this._canTickSystem = bCanTick;
    }

    /**
     * 
     */
    public getTickStatus(): boolean {
        return this._canTickSystem;
    }

    /**
     * 基view不受gui的closeLater控制..
     * 并且其子逻辑view点也不接受cloaseLater控制..
     */
    public get isFoundation(): boolean {
        return this._isFoundation;
    }

    /**
     * @description
     */
    protected override onPreload(): void {
    }

    /**
     * @description
     */
    protected override async onLoad() {
        const baseNode = this.getBaseNode();
        const viewNode = this.getViewNode();
        const nodeMask = baseNode.getChildByName(BPViewBase.NodeMaskName);

        // 模态
        const cpblockInputEvents = baseNode.getComponent(cc.BlockInputEvents)
            ?? baseNode.addComponent(cc.BlockInputEvents);
        cpblockInputEvents.enabled = this._useModal;

        // 遮罩
        const sptMask = nodeMask?.getComponent(cc.Sprite);
        if (sptMask) {
            sptMask.enabled = this._useMask;
        }

        // 周边点击关闭
        if (this._useBlankClose) {
            const btnMask = nodeMask?.getComponent(cc.Button);
            btnMask?.node.on('click', () => {
                this.close();
            }, this);
            btnMask && (btnMask.enabled = true);
        }

        // 动画
        if (this._anim == BPViewAnimType.Scale) {
            const animTween = viewNode.addComponent(BPTransformScale)
            animTween.play();
        }

        //
        BPGUIManager.getInstance().pushViewStack(this);
        this._system?.onLoad();
        this._onLoadCallback?.(this._system as BPSystemBase);
    }

    /**
     * 
     */
    protected override onEnable(): void {
        this._system?.onEnable?.();
    }

    /**
     * 
     */
    protected override onDisable(): void {
        this._system?.onDisable?.();
    }

    /**
     * @description
     */
    protected override onStart(): void {
        this._system?.onStart?.();

        // 适用于子view的嵌套，屏蔽基输入事件阻挡组件..
        if (this._noContainerBlock == true) {
            const cpInputEvents = this.getBaseNode()?.getComponent(cc.BlockInputEvents);
            cpInputEvents && (cpInputEvents.enabled = false);
        }
    }

    /**
     * @description
     */
    protected override onUpdate(dt: number): void {
        if (this._canTickSystem) {
            this._system?.onUpdate?.(dt);
        }
    }

    /**
     * @description
     */
    protected override onDestroy(): void {
        this._onDestroyCallback?.call(this, this._system);
        this._system?.onDestroy();
        BPGUIManager.getInstance().removeViewStack(this);
    }

}