import { BPNetBase } from "../network/net/BPNetBase";
import { BPNetDriver } from "../network/BPNetDriver";
import { BPDataBase } from "./BPDataBase";
import { BPNetEvent } from "../network/BPNetDefine";
import { BPMap } from "../struct/BPMap";
import { BPLog } from "../util/BPLog";

/**
 * @author Tinker
 * @date
 * @description
 */
export abstract class BPCacheBase extends BPDataBase {
    private _cacheName: string;
    protected _cacheObj = new BPMap<string | number, any>();

    /**
     * @description net的引用
     */
    protected _net: BPNetBase = BPNetDriver.getInstance().getDefaultNet();

    /**
     * 
     */
    constructor(cacheName: string) {
        super();

        this._cacheName = cacheName;
        this._onNetBegin();
        // 网络连接成功事件
        //this._net.on(BPNetEvent.NetOpen, this._onNetBegin, this);
    }

    /**
     * 
     */
    private _onNetBegin() {
        BPLog.engine(`【BPCache】_onInit ===> ${this._cacheName}`);
        this._onInit();
        this._onRegEvents();
    }

    /**
     * @description 切换网络
     */
    setNet(net: BPNetBase): void {
        this._offEvent();
        this._net = net;
        this._onRegEvents();
    }

    destroy(): void {

    }

    /**
     *  @description 反注册
     */
    protected _offEvent(): void {
        this._net?.off(this);
    }

    /**
     * 
     */
    protected _get(k: string | number) {
        return this._cacheObj.get(k);
    }

    /**
     * 
     */
    protected _set(k: string | number, v: any) {
        this._cacheObj.set(k, v);
    }

    /**
     * 
     */
    protected _newObj<T>(obj: T): T {
        if (obj === null || typeof obj !== 'object') {
            return obj;
        }

        if (obj instanceof Date) {
            return new Date(obj.getTime()) as any;
        }

        if (Array.isArray(obj)) {
            const cloneArr = [] as any[];
            for (const item of obj) {
                cloneArr.push(this._newObj(item));
            }
            return cloneArr as any;
        }

        const cloneObj = {} as any;
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                cloneObj[key] = this._newObj(obj[key]);
            }
        }
        return cloneObj;
    }

    /**
     * @description 注册网络消息等其他事件接口
     */
    protected abstract _onRegEvents(): void;

    /**
     *  @description 初始化缓存
     */
    protected abstract _onInit(): void;
}