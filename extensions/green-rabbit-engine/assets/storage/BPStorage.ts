import * as cc from 'cc';
import { BPSingletonBase } from "../struct/BPSingletonBase";

/**
 * @author Tinker
 * @date 
 * @description 本地存储..
 */
export class BPStorage extends BPSingletonBase {
    /**唯一标识 */
    private _uniqueKey: string;

    protected constructor() {
        super();
        this._uniqueKey = "";
    }

    /**
     * 
     */
    public init(uniqueKey: string): void {
        this._uniqueKey = uniqueKey || this._uniqueKey;
    }

    /**
     * 如果uniqueKey不存在或者为"" 默认返回key
     * 否则uniqueKey_key一般为uuid拼接的..
     */
    private _makeKey(key: string) {
        if (!this._uniqueKey) {
            return key;
        }
        return this._uniqueKey + "_" + key;
    }

    /**
     * 
     */
    public set(inKey: string, value: any, isGlobal: boolean = false) {
        const key = isGlobal ? inKey : this._makeKey(inKey);
        cc.sys.localStorage.setItem(key, JSON.stringify(value));
    }

    /**
     * 
     */
    public get(inKey: string, isGlobal: boolean = false) {
        const key = isGlobal ? inKey : this._makeKey(inKey);
        let dataString = cc.sys.localStorage.getItem(key);
        if (dataString) {
            try {
                return JSON.parse(dataString);
            } catch (e) {
                return dataString;
            }
        }
        return null;
    }

    /**
     * 
     */
    public remove(inKey: string, isGlobal: boolean = false) {
        let key = isGlobal ? inKey : this._makeKey(inKey);
        cc.sys.localStorage.removeItem(key);
    }

    /**
     * 
     */
    public clear(): void {
        //清理缓存之前先记录热更搜索路径
        const searchPaths = cc.sys.localStorage.getItem('HotUpdateSearchPaths');
        cc.sys.localStorage.clear();
        if (searchPaths) {
            cc.sys.localStorage.setItem('HotUpdateSearchPaths', searchPaths);
        }
    }

    /**
     * 
     */
    public destroy(): void {
        super.destroy();
        this._uniqueKey = "";
    }
}