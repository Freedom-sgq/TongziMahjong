import * as cc from 'cc';
import { BPLog } from "../../util/BPLog";
import { BPResManager } from "../../res/BPResManager";
import { BPLang } from "../../util/BPLang";
import { BPString } from "../../util/BPString";
import { BPFunc } from "../../util/BPType";
import { BPDecorator as BPDec } from "../../util/BPDecorator";
import { BPLocalizedBase } from "./BPLocalizedBase";
import { EDITOR } from 'cc/env';
declare let Editor: any;

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

    protected _updateRenderComponentEditor(onComplete?: BPFunc<[void], void>): void {
        if (!EDITOR) { return; }

        const url = BPLang.getInstance().getResUrlEditor(this._key);
        let splits = BPString.split(url, ":");
        if (splits.length == 1) {
            // 使用 Editor.Ipc 发送消息以获取 UUID
            Editor.Ipc.send('asset-db:query-uuid', `db://assets/${splits[0]}`, (uuid: string) => {
                if (uuid) {
                    cc.assetManager.loadAny(uuid, (err, spf: cc.SpriteFrame) => {
                        if (err) {
                            console.error(err);
                        } else {
                            this.getComponent(cc.Sprite).spriteFrame = spf;
                            onComplete?.();
                        }
                    });
                } else {
                    console.error(`UUID not found for URL: ${url}`);
                }
            });
        }
        else if (splits.length == 2) {
            // 使用 Editor.Ipc 发送消息以获取 UUID
            Editor.Ipc.send('asset-db:query-uuid', `db://assets/${splits[0]}`, (uuid: string) => {
                if (uuid) {
                    cc.assetManager.loadAny(uuid, (err, atlas: cc.SpriteAtlas) => {
                        if (err) {
                            console.error(err);
                        } else {
                            this.getComponent(cc.Sprite).spriteFrame = atlas.getSpriteFrame(splits[1]);
                            onComplete?.();
                        }
                    });
                } else {
                    console.error(`UUID not found for URL: ${url}`);
                }
            });
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