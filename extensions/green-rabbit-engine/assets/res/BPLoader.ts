import * as cc from 'cc';
import { BPSet } from "../struct/BPSet";
import { BPClassType } from "../util/BPType";
import { BPRes } from "./BPRes";
import { BPResManager } from "./BPResManager";

type CCAsset = cc.Asset;
type CCRequestItem = cc.AssetManager.RequestItem;

type ProgressCallBack = (finish: number, total: number, item: CCRequestItem) => void;
type CompleteCallBack<T extends CCAsset> = (err: Error, assets: T, res?: BPRes) => void;
type CompleteCallBackArray<T extends CCAsset> = (err: Error, assets: Array<T>, reses?: Array<BPRes>) => void;

/**
 * @author Tinker
 * @date 
 * @description 
 */
export class BPLoader {
    private _uuidSet = new BPSet<string>();
    private _autoRelease: boolean;

    /**
     * @param {boolean} inAutoRelease 析构的时候是否尝试释放
     */
    constructor(inAutoRelease: boolean = false) {
        this._autoRelease = inAutoRelease;
    }

    /**
     * @description 加载单个资源
     */
    loadRes<T extends CCAsset>(bundleName: string, path: string, type: BPClassType<T>, onProgress: ProgressCallBack, onComplete: CompleteCallBack<T>): void;
    loadRes<T extends CCAsset>(bundleName: string, path: string, type: BPClassType<T>, onComplete?: CompleteCallBack<T>): void;
    loadRes<T extends CCAsset>(bundleName: string, path: string, onProgress: ProgressCallBack, onComplete: CompleteCallBack<T>): void;
    loadRes<T extends CCAsset>(bundleName: string, path: string, onComplete?: CompleteCallBack<T>): void;
    loadRes<T extends CCAsset>(path: string, type: BPClassType<T>, onProgress: ProgressCallBack, onComplete: CompleteCallBack<T>): void;
    loadRes<T extends CCAsset>(path: string, type: BPClassType<T>, onComplete?: CompleteCallBack<T>): void;
    loadRes<T extends CCAsset>(path: string, onProgress: ProgressCallBack, onComplete: CompleteCallBack<T>): void;
    loadRes<T extends CCAsset>(path: string, onComplete?: CompleteCallBack<T>): void;
    public loadRes<T extends CCAsset>(): void {
        let lastArg = arguments[arguments.length - 1];
        if (typeof lastArg == "function") {
            let _onComplete = (erorr: Error, asset: T, res: BPRes) => {
                if (!erorr) {
                    this._cacheAsset(asset);
                }
                lastArg && lastArg(erorr, asset, res);
            };
            arguments[arguments.length - 1] = _onComplete;
        }
        BPResManager.getInstance().loadRes.apply(BPResManager.getInstance(), Array.prototype.slice.call(arguments));
    }

    /**
     * @description 加载单个资源
     */
    public async loadResAsync<T extends CCAsset>(path: string, type: BPClassType<T>): Promise<T> {
        const self = this;
        let asset = await new Promise<T>(function (resolve, reject) {
            const onComplete: CompleteCallBack<T> = function (error: Error, asset: T, res: BPRes) {
                if (error) {
                    reject(error);
                } else {
                    resolve(asset);
                }
            };
            self.loadRes(path, type, onComplete);
        }).catch((error) => {
            //BPLog.warn(error);
        });

        return asset as T;
    }

    /**
     * @description 加载一组资源
     */
    loadResArray<T extends CCAsset>(bundleName: string, paths: string[], type: BPClassType<T>, onProgress: ProgressCallBack, onComplete: CompleteCallBackArray<T>): void;
    loadResArray<T extends CCAsset>(bundleName: string, paths: string[], type: BPClassType<T>, onComplete?: CompleteCallBackArray<T>): void;
    loadResArray<T extends CCAsset>(bundleName: string, paths: string[], onProgress: ProgressCallBack, onComplete: CompleteCallBackArray<T>): void;
    loadResArray<T extends CCAsset>(bundleName: string, paths: string[], onComplete?: CompleteCallBackArray<T>): void;
    loadResArray<T extends CCAsset>(paths: string[], type: BPClassType<T>, onProgress: ProgressCallBack, onComplete: CompleteCallBackArray<T>): void;
    loadResArray<T extends CCAsset>(paths: string[], type: BPClassType<T>, onComplete?: CompleteCallBackArray<T>): void;
    loadResArray<T extends CCAsset>(paths: string[], onProgress: ProgressCallBack, onComplete: CompleteCallBackArray<T>): void;
    loadResArray<T extends CCAsset>(paths: string[], onComplete?: CompleteCallBackArray<T>): void;
    loadResArray<T extends CCAsset>(): void {
        let lastArg = arguments[arguments.length - 1];
        if (typeof lastArg == "function") {
            let _onComplete = (erorr: Error, assets: Array<T>, reses: Array<BPRes>) => {
                if (!erorr) {
                    for (let i = 0; i < assets.length; i++) {
                        let asset = assets[i];
                        this._cacheAsset(asset);
                    }
                }
                lastArg && lastArg(erorr, assets, reses);
            };
            arguments[arguments.length - 1] = _onComplete;
        }
        BPResManager.getInstance().loadRes.apply(BPResManager.getInstance(), Array.prototype.slice.call(arguments));
    }

    /**
     * @description
     */
    private _cacheAsset(asset: CCAsset) {
        let uuid = BPRes.ensureUuid(asset);
        if (!this._uuidSet.has(uuid)) {
            this._uuidSet.add(uuid);
            BPResManager.getInstance().addBPRefCount(uuid);
        }
    }

    /**
     * @description
     */
    public releaseAll(): void {
        this._uuidSet.forEach((uuid) => {
            BPResManager.getInstance().decBPRefCount(uuid);
            if (this._autoRelease) {
                BPResManager.getInstance().tryRelease(uuid);
            }
        });

        this._uuidSet.clear();
    }

    /**
     * @description
     */
    public destroy(): void {
        this.releaseAll();
    }
}