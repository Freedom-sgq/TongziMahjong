import { BPMap } from "../struct/BPMap";
import { BPSingletonBase } from "../struct/BPSingletonBase";
import { BPClassType } from "../util/BPType";
import { BPCacheBase } from "./BPCacheBase";
import { BPCacheConfig } from "./BPConfigs";

/**
 * @author Tinker
 * @date
 * @description
 */
export class BPCacheManager extends BPSingletonBase {
    private _cacheMap: BPMap<BPCacheBase> = null;

    protected constructor() {
        super();
        this._cacheMap = new BPMap<BPCacheBase>();
    }

    /**
     * ...
     */
    public init(cacheConfig: BPCacheConfig): void {
        if (cacheConfig == null) {
            return;
        }

        for (let i = 0; i < cacheConfig.length; ++i) {
            const cacheCls = cacheConfig[i];
            const cacheName = cacheCls.name;
            this._instantiateCache(cacheName, cacheCls);
        }
    }

    /**
     * ...
     */
    private _instantiateCache(cacheName: string, cacheClass: { new(name: string): BPCacheBase }) {
        if (this._cacheMap.has(cacheName)) {
            return;
        }

        this._cacheMap.set(cacheName, new cacheClass(cacheName));
    }

    /**
     * ...
     */
    public getCache<T extends BPCacheBase>(cacheCls: BPClassType<T> | string): T {
        let name: string = "";
        if (typeof cacheCls != "string") {
            name = cacheCls.name
        }
        else {
            name = cacheCls;
        }
        let outCache = this._cacheMap.get(name);
        return outCache as T;
    }

    /**
     * ...
     */
    public destroy(): void {
        super.destroy();

        this._cacheMap.forEach((key, cache) => {
            cache.destroy();
        });

        this._cacheMap.clear();
    }

}