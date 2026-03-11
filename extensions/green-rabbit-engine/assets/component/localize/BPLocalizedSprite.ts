import { BPLog } from "../../util/BPLog";
import { BPResManager } from "../../res/BPResManager";
import { BPLang } from "../../util/BPLang";
import { BPString } from "../../util/BPString";
import { BPFunc } from "../../util/BPType";
import { BPDecorator as BPDec } from "../../util/BPDecorator";
import { BPLocalizedBase } from "./BPLocalizedBase";

/**
 * 多语言图片替换，配合编辑器工具使用
 */
@BPDec.ccclass
@BPDec.disallowMultiple
//@BPDec.executeInEditMode
@BPDec.menu("BPComponents/BPLocalizedSprite")
export class BPLocalizedSprite extends BPLocalizedBase {
    protected _renderComponent: cc.Sprite = null;
    private _dynamicLoadedAsset: cc.Asset = null;

    /**
     * 
     */
    protected override onPreload(): void {
        this._renderComponent = this.node.getComponent(cc.Sprite);
        if (this._renderComponent == null) {
            cc.error(`failed to update BPLocalizedSprite in node ${this.node.name}, cc.Sprite is needed!`);
            return;
        }
        //this._updateRenderComponent();
    }

    /**
     * 
     */
    protected override onDestroy(): void {
        this._decDynamicAssetBPRef();
        this._dynamicLoadedAsset = null;
    }

    /**
     * 
     */
    public override setup(key: string): void {
        this.key = key;
    }

    /**
     * @implements BPLocalizedBase
     */
    protected _updateRenderComponent(): void {
        if (this._renderComponent == null) { 
            return; 
        }

        if (this._key == "") {
            return;
        }

        let url = BPLang.getInstance().getResUrl(this._key);
        let splits = BPString.split(url, ":");
        if (splits.length == 2) {
            // `${bundleName}:${spriteFramePath}`
            BPResManager.getInstance().loadRes(url, cc.SpriteFrame, (error, asset: cc.SpriteFrame) => {
                if (error) { return; }
                
                this._updateDynamicAssetBPRef(asset);
                this._renderComponent.spriteFrame = asset;
            });
        }
        else if (splits.length == 3) {
            // `${bundleName}:${spriteAltasPath}:${spriteFrame}`
            BPResManager.getInstance().loadRes(url, cc.SpriteAtlas, (error, asset: cc.SpriteAtlas) => {
                if (error) { return; }

                this._updateDynamicAssetBPRef(asset);
                this._renderComponent.spriteFrame = asset.getSpriteFrame(splits[2]);
            });
        }
        else {
            BPLog.error(`url:${url} is not valid...`);
        }
    }

    /**
     * @implements BPLocalizedBase
     */
    protected _updateRenderComponentEditor(onComplete?: BPFunc<[void], void>): void {
        if (!CC_EDITOR) { return; }

        const url = BPLang.getInstance().getResUrlEditor(this._key);
        let splits = BPString.split(url, ":");
        if (splits.length == 1) {
            const uuid = Editor.assetdb.remote.urlToUuid("db://assets/" + splits[0]);
            cc.assetManager.loadAny(uuid, (err, spf: cc.SpriteFrame) => {
                this.getComponent(cc.Sprite).spriteFrame = spf;
                onComplete?.();
            });
        }
        else if (splits.length == 2) {
            const uuid = Editor.assetdb.remote.urlToUuid("db://assets/" + splits[0]);
            cc.assetManager.loadAny(uuid, (err, altas: cc.SpriteAtlas) => {
                this.getComponent(cc.Sprite).spriteFrame = altas.getSpriteFrame(splits[1]);
                onComplete?.();
            });
        }
        else {
            Editor.error(`key's format ${this._key} is not valid...`);
        }
    }

    /**
     * 
     */
    private _updateDynamicAssetBPRef(asset: cc.Asset): void {
        if (asset == null) {
            return;
        }

        this._decDynamicAssetBPRef();
        this._dynamicLoadedAsset = asset;
        this._addDynamicAssetBPRef();
    }

    /**
     * 
     */
    private _decDynamicAssetBPRef(): void {
        if (this._dynamicLoadedAsset == null) {
            return;
        }
        BPResManager.getInstance().decBPRefCount(this._dynamicLoadedAsset);
    }

    /**
     * 
     */
    private _addDynamicAssetBPRef(): void {
        if (this._dynamicLoadedAsset == null) {
            return;
        }
        BPResManager.getInstance().decBPRefCount(this._dynamicLoadedAsset);
    }
}