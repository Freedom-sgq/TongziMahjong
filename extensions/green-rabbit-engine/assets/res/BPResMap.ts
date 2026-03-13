import * as cc from 'cc';
import { BPMap } from "../struct/BPMap";
import { BPRes } from "./BPRes";

type CCAsset = cc.Asset;
type CCBundle = cc.AssetManager.Bundle;

export class BPResMap extends BPMap<BPRes> {
    constructor(map?: Record<string, BPRes>) {
        super(map);
    }

    /**
     * ....
     */
    public decBPRef(uuid: string) {
        let res = this.get(uuid);
        res?.decBPRef();
    }

    /**
     * ....
     */
    public addBPRef(uuid: string) {
        let res = this.get(uuid);
        res?.addBPRef();
    }

    /**
     * @description
     */
    public tryRelease(uuid: string, bForce: boolean = false): void {
        let res = this.get(uuid);
        if (res == null) {
            return;
        }

        if (!bForce && !res.isRefCountZero()) {
            return;
        }

        let deletedRes = this.delete(uuid);
        if (deletedRes == null) {
            return;
        }

        deletedRes.destroy();
    }

    /**
     * 
     */
    public tryReleaseAll(bForce: boolean = false): void {
        this.forEach((resName, res) => {
            this.tryRelease(resName, bForce);
        });
    }

    /**
     * ....
     */
    public cacheRes<T extends CCAsset>(bundle: CCBundle, assets: T | Array<T>): BPRes | Array<BPRes> {
        if (Array.isArray(assets)) {
            return this._cacheArray(bundle, assets);
        }
        else {
            return this._cacheSingle(bundle, assets);
        }
    }

    /**
     * ....
     */
    private _cacheArray(bundle: CCBundle, assets: Array<CCAsset>): Array<BPRes> {
        let outArray: Array<BPRes> = [];
        for (let i = 0; i < assets.length; ++i) {
            let res = this._cacheSingle(bundle, assets[i]);
            outArray.push(res);
        }
        return outArray;
    }

    /**
     * ....
     */
    private _cacheSingle(bundle: CCBundle, asset: CCAsset): BPRes {
        let uuid = BPRes.ensureUuid(asset);
        let res = this.get(uuid);
        if (res == null) {
            res = BPRes.makeRes(bundle, asset);
            this.set(uuid, res);
        }
        return res;
    }
}