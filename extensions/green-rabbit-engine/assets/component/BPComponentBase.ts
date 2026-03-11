/**
 * @author Tinker
 * @date
 * @description 统一生命周期接口
 */

import { BPEvent } from "../event/BPEvent";

export abstract class BPComponentBase extends cc.Component {
    /**
     * @description
     * 在onLoad之前，node-activator调用
     */
    private __preload(): void {
        this.onPreload();
    };

    /**
     * @virtual
     * @description onLoad之前
     */
    protected onPreload(): void { };

    /**
     * 
     */
    protected override start(): void {
        this.onStart();
    }

    /**
     * @virtual
     * @description 统一生命周期接口
     */
    protected onStart(): void { };


    /**
     * 
     * @param dt 
     */
    protected override update(dt: number): void {
        this.onUpdate(dt);
    }
    /**
     * 
     * @param dt 
     */
    protected onUpdate(dt: number): void { };

    /**
     * @virtual
     * @description 销毁
     */
    protected override onDestroy(): void {
        BPEvent.getInstance().off(this);
    }
}