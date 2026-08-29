import * as cc from 'cc';
import { BPSingletonBase } from "../struct/BPSingletonBase";
import { BPLog } from "../util/BPLog";

export class BPEvent extends BPSingletonBase {
    private _eventTarget: cc.EventTarget = null;

    protected constructor() {
        super();
        this._eventTarget = new cc.EventTarget();
    }

    /**
     * 虚拟点击
     */
    public fakeTouch(node: cc.Node);
    public fakeTouch(x: number, y: number);
    public fakeTouch(x, y?) {
        if (x instanceof cc.Node) {
            const ps = x.getComponent(cc.UITransform)!.convertToWorldSpaceAR(cc.v3(0, 0, 0));
            x = ps.x;
            y = ps.y;
        }

        let rect;
        //@ts-ignore
        const inputManager = cc.internal.inputManager;
        if (cc.sys.isBrowser) {
            rect = inputManager._canvasBoundingRect;
        } else {
            const windowSize = cc.screen.windowSize;
            rect = {
                left: 0,
                top: 0,
                width: windowSize.width,
                height: windowSize.height,
            };
        }

        //将x,y从Creator世界坐标转换到设备窗口坐标
        const vp = cc.view.getViewportRect();
        const sx = cc.view.getScaleX();
        const sy = cc.view.getScaleY();
        const ratio = cc.view.getDevicePixelRatio();
        const screenX = (x * sx + vp.x) / ratio + rect.left;
        const screenY = rect.top + rect.height - (y * sy + vp.y) / ratio;
        const pt = cc.v2(screenX, screenY);

        //模拟点击操作
        BPLog.engine(`模拟点击屏幕坐标：${pt.x}, ${pt.y}`);
        const touch = inputManager.getTouchByXY(pt.x, pt.y, rect);
        inputManager.handleTouchesBegin([touch]);
        setTimeout(() => {
            inputManager.handleTouchesEnd([touch]);
        }, 100);
    }

    /**
     * ....
     * @param
     * @example
     */
    public on(eventName: string, callback: (...args: any[]) => void, target: object) {
        return this._eventTarget?.on(eventName, callback, target);
    }

    /**
     * ....
     * @param
     * @example
     */
    public once(eventName: string, callback: (...args: any[]) => void, target?: object) {
        return this._eventTarget?.once(eventName, callback, target);
    }

    /**
     * 会根据参数类型多态调用，对外保持接口统一
     * @param eventName 事件名称 不建议使用字面量
     * @param callback 函数指针
     * @param target 目标
     * @example
     * bp.event.off(this);
     * bp.event.off(Events.InitGame);
     * bp.event.off(Events.InitGame, this.onInitGame, this);
     */
    public off(target: object): void;
    public off(eventName: string): void;
    public off(eventName: string, callback: (...args: any[]) => void, target: object): void;
    public off(eventName: string | object, callback?: (...args: any[]) => void, target?: object): void {
        if (typeof eventName == "string") {
            if (typeof callback == "function") {
                this._eventTarget?.off(eventName, callback, target);
            }
            else {
                this._eventTarget?.off(eventName);
            }
        }
        else if (typeof eventName == "object") {
            this._eventTarget?.targetOff(eventName);
        }
    }

    /**
     * @param eventName 事件名
     * @param tag 提供一个可选的子类型，用于事件筛选
     * @param params 透传参数
     * @example
     */
    public emit(eventName: string): void;
    public emit(eventName: string, params: object): void;
    public emit(eventName: string, tag: string): void;
    public emit(eventName: string, tag: string, params: object): void;
    public emit(eventName: string, ...args: any[]): void;
    public emit(eventName: string, ...args: any[]): void {
        if (args.length > 6) {
            BPLog.error(`事件参数长度过长！`);
        }
        this._eventTarget?.emit(eventName, ...args);
    }

    /**
     * ....
     * @param
     * @example
     */
    destroy(): void {
        super.destroy();
        // this._eventTarget?.clear();
    }
}
