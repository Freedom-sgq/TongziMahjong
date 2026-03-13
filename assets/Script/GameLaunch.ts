import * as cc from 'cc';
import { bp, BPModule } from "BPEngine";
import { ViewBaseNodePrefabPath, ViewConfig } from "./Config/ViewConfig";
import { ModelConfig } from "./Config/ModelConfig";
import { CacheConfig } from "./Config/CacheConfig";
import { LangSpriteConfig, LangTextConfig } from "./Config/LangConfig";
import { StorageConfig } from "./Config/StorageConfig";
import { AudioChannel } from "./Config/AudioDefine";
import { EDITOR } from "cc/env";
import { ViewDefine } from './View/ViewDefine';

@BPModule.BPDecorator.ccclass
export default class GameLaunch extends BPModule.BPGameLaunchBase {
    /**
     * 
     */
    protected onLoad(): void {
        super.onLoad();
        bp.log.logic("GameLaunch onLoad");
    }

    /**
     * 
     */
    protected override _onInitRuntime(): void {
        bp.log.updateLogBinding();
        // bp.net.registerNet(new NetImpXx(NetMsgConfig));
        bp.model.init(ModelConfig);
        bp.cache.init(CacheConfig);
        bp.gui.init(ViewConfig, ViewBaseNodePrefabPath);
        bp.lang.init(LangTextConfig, LangSpriteConfig, { interpolation: { prefix: "${", suffix: "}" } });
        bp.audio.init(AudioChannel);

        const volumeGlobal = bp.storage.get(StorageConfig.VolumGlobal, true) ?? true;
        const volumeBGM = bp.storage.get(StorageConfig.VolumBGM, true) ?? true;
        const volumeEffect = bp.storage.get(StorageConfig.VolumEffect, true) ?? true;
        bp.audio.setGlobalVolume(volumeGlobal ? 1.0 : 0.0);
        bp.audio.setChannelVolume(AudioChannel.BGM, volumeBGM ? 1.0 : 0.0);
        bp.audio.setChannelVolume(AudioChannel.Effect, volumeEffect ? 1.0 : 0.0);

        bp.gui.openView(ViewDefine.TestView);
    }

    protected _onGameShow(): void {
        cc.log("[onGameShow]");
    }

    protected onUpdate(dt: number): void {

    }

    protected override _onUpdateEditor(): void {
        cc.log("_onUpdateEditor");
        bp.lang.init(LangTextConfig, LangSpriteConfig);
    }
}

if (EDITOR) {
    bp.lang.init(LangTextConfig, LangSpriteConfig);
}