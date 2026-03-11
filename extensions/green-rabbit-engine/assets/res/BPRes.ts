import { BPResBase } from "./BPResBase";

interface BPResInfo {
    bundle: cc.AssetManager.Bundle;
    uuid: string;
    path: string;
    resType: typeof cc.Asset;
}

/**
 * @author
 * @date 
 * @description
 */
export class BPRes extends BPResBase {
    private _uuid: string = "";
    private _bundle: cc.AssetManager.Bundle = null;
    private _asset: cc.Asset = null;
    private _refCountBP: number = 0;

    /**
     * @description
     */
    public static makeRes(bundle: cc.AssetManager.Bundle, asset: cc.Asset): BPRes {
        let assetRes = new BPRes(bundle, asset);
        return assetRes;
    }

    /**
     * @description
     */
    public static ensureUuid(o: string | cc.Asset | BPRes): string {
        if (o instanceof cc.Asset) {
            return (<any>o)._uuid;
        }
        else if (o instanceof BPRes) {
            return o.getUuid();
        }

        return o;
    }

    /**
     * ....
     */
    constructor(bundle: cc.AssetManager.Bundle, asset: cc.Asset) {
        super();

        this._uuid = (<any>asset)._uuid;

        this._bundle = bundle;
        this._asset = asset;

        this._asset.addRef();
        this._refCountBP = 0;
    }

    /**
     * ...
     */
    public destroy(bForce: boolean = false): void {
        if (this._asset == null) {
            return;
        }
        this._asset.decRef();

        if (bForce || this._asset.refCount == 0) {
            cc.assetManager.releaseAsset(this._asset);
        }

        this._uuid = "";
        this._bundle = null;
        this._asset = null;
        this._refCountBP = 0;
    }

    /**
     * ....
     */
    public getAsset(): cc.Asset {
        return this._asset;
    }

    /**
     * ....
     */
    public getBundle(): cc.AssetManager.Bundle {
        return this._bundle;
    }

    /**
     * ....
     */
    public getUuid(): string {
        return this._uuid;
    }

    /**
     * ....
     */
    public getInfo(): BPResInfo {
        let uuid = this._uuid;
        let bundle = this._bundle;
        let assetInfo = bundle.getAssetInfo(uuid);

        return {
            bundle: bundle,
            uuid: uuid,
            path: assetInfo.path,
            resType: assetInfo.ctor,
        };
    }

    /**
     * ....
     */
    public isRefCountZero(): boolean {
        return this._refCountBP == 0;
    }

    /**
     * ....
     */
    public addBPRef(): void {
        this._refCountBP = this._refCountBP + 1;
    }

    /**
     * ....
     */
    public decBPRef(): void {
        if (this._refCountBP <= 0) {
            return;
        }

        this._refCountBP = this._refCountBP - 1;
    }
}