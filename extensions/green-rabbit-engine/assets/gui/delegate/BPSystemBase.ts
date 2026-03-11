import { BPViewBase } from "../../component/controls/BPViewBase";
import { BPEvent } from "../../event/BPEvent";
import { BPLog } from "../../util/BPLog";
import { BPGUIManager } from "../BPGUIManager";
import { BPDelegateBase } from "./BPDelegateBase";
import { BPEntityBase } from "./BPEntityBase";
import { IBPEntity } from "./IBPEntity";
import { IBPSystem } from "./IBPSystem";

/**
 * @author Tinker
 * @date
 * @description
 */
export abstract class BPSystemBase<EntityImp extends IBPEntity = BPEntityBase> extends BPDelegateBase implements IBPSystem {
    private _entity: EntityImp;
    private _params: Record<string, any>;

    constructor(inView: BPViewBase, inEntity: EntityImp, viewParams: Record<string, any> = {}) {
        super(inView);

        this._entity = inEntity;
        this._params = viewParams;
    }

    protected get params(): Record<string, any> {
        return this._params;
    }

    public get entity(): EntityImp {
        return this._entity;
    }

    protected get panel(): EntityImp["panel"] {
        return this._entity?.panel;
    }

    protected get model(): EntityImp["model"] {
        return this._entity?.model;
    }

    protected get cache(): EntityImp["cache"] {
        return this._entity?.cache;
    }

    protected get custom(): EntityImp["custom"] {
        return this._entity?.custom;
    }

    /**
     * 是否接受Update
     * @param canTick 
     */
    protected _enableTick(canTick: boolean) {
        this.getView().setCanTickLogic(canTick);
    }

    /**
     * 
     */
    public getTickStatus(): boolean {
        return this.getView().getTickStatus();
    }

    /**
     * 
     */
    public schedule(callback: Function, interval?: number, repeat?: number, delay?: number) {
        this.getView().schedule(callback, interval, repeat, delay);
    }

    /**
     * 
     */
    public scheduleOnce(callback: Function, delay?: number) {
        this.getView().scheduleOnce(callback, delay);
    }

    /**
     * 
     */
    public getParentSystem<T extends BPSystemBase>() {
        return this.getView().getParentView().getSystem<T>();
    }

    /**
     * 
     */
    public unschedule(callback: Function): void {
        this.getView().unschedule(callback);
    }

    /**
     *  关闭当前view
     */
    protected _close() {
        this.getView().close();
    }

    /**
     *  切换到某个view
     *  切换成功会关闭自身
     */
    protected _swtich(viewName: string, userData?: Record<string, any>) {
        BPGUIManager.getInstance().openView(viewName, {
            params: userData,
            onLoad: () => {
                this._close();
            }
        });
    }

    /**
     * @implements IBPSystem
     */
    public onLoad(): void {
        BPLog.engine(`${this.getView().viewInsName} System onLoad ...`);

        const entity = this._entity as unknown as BPEntityBase;
        entity?.getComp("BTN_Close", cc.Button)?.node.on("click", this._close, this);
    };

    /**
     * @implements IBPSystem
     */
    public onStart(): void {
        BPLog.engine(`${this.getView().viewInsName} System onStart ...`);
    };

    /**
     * @implements IBPSystem
     */
    public onEnable(): void {
        //BPLog.engine(`${this.getView().viewInsName} System onEnable ...`);
    }

    /**
     * @implements IBPSystem
     */
    public onDisable(): void {
        //BPLog.engine(`${this.getView().viewInsName} System onDisable ...`);
    }

    /**
     * @implements IBPSystem
     */
    public onUpdate(deltaTime: number): void {
        //BPLog.engine(`${this.getView().viewInsName} System onUpdate ${deltaTime} ...`);
    };

    /**
     * 从不可见到可见
     */
    public onVisible(newViewParams: Record<string, any> = {}): void {
        
    }

    /**
     * return true 关闭
     * return false 基类close不生效
     */
    public onCheckClose(): boolean {
        return true;
    }

    /**
     * @implements IBPSystem
     */
    public onDestroy(): void {
        BPLog.engine(`${this.getView().viewInsName} System onDestroy ...`);
        BPEvent.getInstance().off(this);
    };

}