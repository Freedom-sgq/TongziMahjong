import { BPLog } from "../util/BPLog";
import { BPSingletonBase } from "../struct/BPSingletonBase";
import { BPResMap } from "./BPResMap";
import { BPString } from "../util/BPString";
import { BPRes } from "./BPRes";
import {BPEvent} from "../event/BPEvent";
import {BPEventConfig} from "../event/BPEventConfig";

type CCAsset = cc.Asset;
type CCAssetType = typeof cc.Asset;
type CCBundle = cc.AssetManager.Bundle;
type ProgressCallBack = (finish: number, total: number, item: cc.AssetManager.RequestItem) => void;
type CompleteCallBack<T extends CCAsset> = (err: Error, assets: T | Array<T>, reses?: BPRes | Array<BPRes>) => void;

const isAssetClass = (obj: any): obj is typeof cc.Asset => {
    return obj === cc.Asset;
}

const BUNDLE_RESOURCES: string = cc.AssetManager.BuiltinBundleName.RESOURCES as unknown as string;

/**
 * @author Tinker
 * @date 
 * @description 
 * 动态加载，资源管理:
 * 1. 自动管理：通过构造BPLoder，走BPLoader加载，颗粒度自由
 * 2. 手动管理：手动调用本类成员函数加载，释放
 */
export class BPResManager extends BPSingletonBase {
    private _resCache: BPResMap = new BPResMap();

    /**
     * ....
     */
    init(...args: any[]): void { }

    /**
     * @description
     * @param
     * @example
     */
    public loadBundle(nameOrUrl: string, onComplete: (err: Error, bundle: CCBundle) => void): void
    public loadBundle(nameOrUrl: string, options: Record<string, any>, onComplete: (err: Error, bundle: CCBundle) => void): void
    public loadBundle(nameOrUrl: string, options: Record<string, any>): void
    public loadBundle(nameOrUrl: string): void
    public loadBundle(): void {
        cc.assetManager.loadBundle.apply(cc.assetManager, arguments);
    }

    /**
     * 
     * @param nameOrUrl Bundle 名称或 URL
     * @param options 可选参数
     * @returns Promise<CCBundle>
     * @example
     * const bundle = await BPResManager.getInstance().loadBundleAsync("GameBundle");
     */
    public async loadBundleAsync(nameOrUrl: string, options?: Record<string, any>): Promise<CCBundle> {
        return new Promise((resolve, reject) => {
            this.loadBundle(nameOrUrl, options, (err: Error, bundle: CCBundle) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(bundle);
                }
            });
        });
    }

    /**
     * 递归加载bundle及其依赖
     * @param nameOrUrl bundle名称或URL
     * @param options 可选参数
     * @param onComplete 完成回调
     */
    public async loadBundleWithDeps(nameOrUrl: string, options?: Record<string, any>): Promise<CCBundle> {
        // 先加载主bundle
        const bundle = await this.loadBundleAsync(nameOrUrl, options);

        // 获取bundle的依赖列表
        const deps = bundle.deps || [];

        // 递归加载所有依赖
        const depPromises = deps.map(depName => this.loadBundleWithDeps(depName, options));
        await Promise.all(depPromises);

        return bundle;
    }

    /**
     * @example
     * BPResManager.getInstance().loadRes("GameBundle", "MainView", (err: Error, asset: cc.Prefab, res: BPRes) => { });
     * BPResManager.getInstance().loadRes("GameBundle:Prefab/MainView", (err: Error, asset: cc.Prefab, res: BPRes) => { });
     * BPResManager.getInstance().loadRes("GameBundle", ["Prefab/MainView", ...], (err: Error, asset: cc.Prefab, res: BPRes) => { });
     */
    public loadRes<T extends CCAsset>(bundleName: string, paths: string | string[], type: CCAssetType, onProgress: ProgressCallBack, onComplete: CompleteCallBack<T>): void;
    public loadRes<T extends CCAsset>(bundleName: string, paths: string | string[], type: CCAssetType, onComplete?: CompleteCallBack<T>): void;
    public loadRes<T extends CCAsset>(bundleName: string, paths: string | string[], onProgress: ProgressCallBack, onComplete: CompleteCallBack<T>): void;
    public loadRes<T extends CCAsset>(bundleName: string, paths: string | string[], onComplete?: CompleteCallBack<T>): void;
    public loadRes<T extends CCAsset>(paths: string | string[], type: CCAssetType, onProgress: ProgressCallBack, onComplete: CompleteCallBack<T>): void;
    public loadRes<T extends CCAsset>(paths: string | string[], type: CCAssetType, onComplete?: CompleteCallBack<T>): void;
    public loadRes<T extends CCAsset>(paths: string | string[], onProgress: ProgressCallBack, onComplete: CompleteCallBack<T>): void;
    public loadRes<T extends CCAsset>(paths: string | string[], onComplete?: CompleteCallBack<T>): void;
    public loadRes<T extends CCAsset>(): void {
        const bundleName = this._parseBundleArgs(arguments);
        const args = Array.prototype.slice.call(arguments);
        const onComplete = args[args.length - 1];

        // @ts-ignore
        if (CC_JSB && cc.assetManager.remoteBundle(bundleName) && !jsb.fileUtils.isDirectoryExist("remote/" + bundleName)) {
            BPEvent.getInstance().emit(BPEventConfig.BundleUnExistNotify);
            onComplete && onComplete(new Error(`downloading ${bundleName}`));
            return;
        }

        this.loadBundleWithDeps(bundleName).then((bundle: CCBundle) => {
            let lastArg = args[args.length - 1];
            // 单个资源加载做个保护...
            if (typeof args[0] === "string" && isAssetClass(args[1])) {
                const info = bundle.getInfoWithPath(args[0], args[1]);
                if (!info) {
                    lastArg && lastArg(new Error(`${bundleName} has no resource with path: ${args[0]} ... `));
                    return;
                }
            }

            if (typeof lastArg == "function") {
                let _onComplete = (err: Error, assets: T | Array<T>) => {
                    if (err) { lastArg && lastArg(err); return; }
                    let reses = this._resCache.cacheRes(bundle, assets);
                    lastArg && lastArg(err, assets, reses);
                };
                args[args.length - 1] = _onComplete;
            }
            bundle.load.apply(bundle, args);
        }).catch((error: Error) => {
            BPLog.engine(`load bundle failed and bundleName is ${bundleName} ... `);
        });
    };

    /**
     * @example
     * this._loadDir("GameBundle", "prefab/", (err: Error, asset: cc.Prefabs) => { });
     * this._loadDir("GameBundle:prefab/", (err: Error, asset: cc.Prefabs) => { });
     */
    private _loadDir<T extends CCAsset>(dir: string, type: CCAssetType, onProgress: ProgressCallBack, onComplete: (error: Error, assets: Array<T>) => void): void
    private _loadDir<T extends CCAsset>(dir: string, onProgress: ProgressCallBack, onComplete: (error: Error, assets: Array<T>) => void): void
    private _loadDir<T extends CCAsset>(dir: string, type: CCAssetType, onComplete: (error: Error, assets: Array<T>) => void): void
    private _loadDir<T extends CCAsset>(dir: string, type: CCAssetType): void
    private _loadDir<T extends CCAsset>(dir: string, onComplete: (error: Error, assets: Array<T>) => void): void
    private _loadDir<T extends CCAsset>(dir: string): void

    private _loadDir<T extends CCAsset>(bundleName: string, dir: string, type: CCAssetType, onProgress: ProgressCallBack, onComplete: (error: Error, assets: Array<T>) => void): void
    private _loadDir<T extends CCAsset>(bundleName: string, dir: string, onProgress: ProgressCallBack, onComplete: (error: Error, assets: Array<T>) => void): void
    private _loadDir<T extends CCAsset>(bundleName: string, dir: string, type: CCAssetType, onComplete: (error: Error, assets: Array<T>) => void): void
    private _loadDir<T extends CCAsset>(bundleName: string, dir: string, type: CCAssetType): void
    private _loadDir<T extends CCAsset>(bundleName: string, dir: string, onComplete: (error: Error, assets: Array<T>) => void): void
    private _loadDir<T extends CCAsset>(bundleName: string, dir: string): void
    private _loadDir(): void {
        const bundleName = this._parseBundleArgs(arguments);
        const args = Array.prototype.slice.call(arguments);

        this.loadBundle(bundleName, (error: Error, bundle: CCBundle) => {
            if (!error) {
                // TODO: 完善封装, 缓存
                bundle.loadDir.apply(bundle, args);
            }
        });
    }

    /**
     * 解析资源加载参数，提取bundle名称并调整参数数组
     * @param args 原始参数数组
     * @returns 解析后的bundle名称
     */
    private _parseBundleArgs(args: IArguments): string {
        // 处理 "bundleName:path" 格式的参数
        if (typeof args[0] === "string" && typeof args[1] !== "string") {
            const splits = BPString.split(args[0], ":");
            if (splits.length >= 2) {
                args[0] = splits[0];
                Array.prototype.splice.call(args, 1, 0, splits[1]);
            }
        }

        // 确定bundle名称
        if (typeof args[1] === "string" || Array.isArray(args[1])) {
            const bundleName = args[0] as string;
            Array.prototype.shift.call(args);
            return bundleName;
        }

        return BUNDLE_RESOURCES;
    }

    /**
     * @description
     * BPEngine引擎计数 +1
     */
    public addBPRefCount(inUuid: string | cc.Asset | BPRes): void {
        let _uuid = BPRes.ensureUuid(inUuid);
        this._resCache.addBPRef(_uuid);
    }

    /**
     * @description
     * BPEngine引擎计数 -1
     */
    public decBPRefCount(inUuid: string | cc.Asset | BPRes): void {
        let _uuid = BPRes.ensureUuid(inUuid);
        this._resCache.decBPRef(_uuid);
    }

    /**
     * @description
     * 尝试释放，安全方法
     */
    public tryRelease(inUuid: string | cc.Asset | BPRes): void {
        let _uuid = BPRes.ensureUuid(inUuid);
        this._resCache.tryRelease(_uuid);
    }

    /**
     * @description
     * 尝试全部释放，安全方法
     */
    public tryReleaseAll(bForce: boolean = false): void {
        this._resCache.tryReleaseAll(bForce);
    }

    /**
     * ....
     */
    destroy(): void {
        this.tryReleaseAll(true);
    }
}
