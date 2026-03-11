import { BPAudioInfo, BPAudioConfig } from "../data/BPConfigs";
import { BPLog } from "../util/BPLog";
import { BPMap } from "../struct/BPMap";
import { BPSingletonBase } from "../struct/BPSingletonBase";
import { BPMath } from "../util/BPMath";
import { BPAudioChannel } from "./BPAudioChannel";

/**
 * ...
 */
export interface BPAudioOption {
    /**是否循环 */
    loop?: boolean;

    /**音效实例的音量 */
    volume?: number;

    /**是否桩实例会在其他实例播放的时候暂停, 而后恢复*/
    pile?: boolean;

    /**结束回调 */
    onFinish?: (id?: number, ...args: any[]) => void;
}

/**
 * @author Tinker
 * @date
 * @description 音效管理器，提供音频通道封装.
 */
export class BPAudioManager extends BPSingletonBase {

    /**全局音量 */
    private _globalVolume: number = null;

    /** 通道映射 */
    private _channelMap: BPMap<number, BPAudioChannel> = null;

    /** 音频映射 */
    private _audioMap: BPMap<string, BPAudioInfo> = null;

    protected constructor() {
        super();

        this._globalVolume = 1.0;
        this._channelMap = new BPMap<number, BPAudioChannel>();
        this._audioMap = new BPMap<string, BPAudioInfo>();
    }

    /**
     * ...
     */
    public init(channels: any): void {
        if (!channels) {
            BPLog.error("Audio channels config is invalid...");
            return;
        }
        const keys = Object.keys(channels);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const channelID = channels[key];
            if (typeof channelID !== "number") {
                continue;
            }

            if (!this._channelMap.has(channelID)) {
                this._channelMap.set(channelID, new BPAudioChannel(channelID, this._globalVolume));
            }
        }
    }

    /**
     * 获取全局音量
     */
    getGlobalVolume(): number {
        return this._globalVolume;
    }

    /**
     * 设置全局音量范围[0, 1]
     */
    setGlobalVolume(volume: number): void {
        this._globalVolume = BPMath.clamp(volume);

        this._channelMap.forEach((_, audioChannel) => {
            audioChannel.updateByGlobalVolume(this._globalVolume);
        });
    }

    /**
     * 设置通道音量
     */
    setChannelVolume(channelID: number, volume: number): void {
        let channel = this._ensureChannel(channelID);
        channel?.setChannelVolume(volume);
    }

    /**
     * 播放某个音效
     */
    public play(name: string, option?: BPAudioOption): void {
        const info = this._audioMap.get(name);
        if (!info) {
            BPLog.error(`audio name: ${name} not registered...`);
            return;
        }

        let path = info.path;
        let channelID = info.channel;
        let maxInsCount = info.maxInsCount;
        let audioChannel = this._channelMap.get(channelID);
        if (!audioChannel) {
            BPLog.error(`channel id: ${channelID} not registered...`);
            return;
        }

        audioChannel.play(path, maxInsCount, option);
    }

    /**
     * 根据路径，播放音效
     * @param path
     * @param channelID
     */
    public playEffect(path: string, channelID: number, maxInsCount = 1, option?: BPAudioOption): void {
        let audioChannel = this._channelMap.get(channelID);
        if (!audioChannel) {
            BPLog.error(`channel id: ${channelID} not registered...`);
            return;
        }

        audioChannel.play(path, maxInsCount, option);
    }

    /**
     * 停止某个音效
     */
    public stop(name: string): void {
        const info = this._audioMap.get(name);
        if (!info) {
            BPLog.error(`audio name: ${name} not registered...`);
            return;
        }

        let path = info.path;
        let channelID = info.channel;

        let audioChannel = this._channelMap.get(channelID);
        if (!audioChannel) {
            BPLog.error(`channel id: ${channelID} not registered...`);
            return;
        }

        audioChannel.stop(path);
    }

    /**
     * 停止某个音效
     */
    public stopAudio(channelID: number, path: string): void {
        let audioChannel = this._channelMap.get(channelID);
        if (!audioChannel) {
            BPLog.error(`channel id: ${channelID} not registered...`);
            return;
        }
        audioChannel.stop(path);
    }

    /**
     * 停止某个通道
     */
    public stopChannel(channelID: number): void {
        let channel = this._ensureChannel(channelID);
        channel?.stopAll();
    }

    /**
     * 停止所有通道...
     */
    public stopAll(): void {
        this._channelMap.forEach((_, audioChannel) => {
            audioChannel.stopAll();
        });
    }

    /**
     * 暂停所有通道...
     */
    public pauseAll(): void {
        this._channelMap.forEach((_, audioChannel) => {
            audioChannel.pauseAll();
        });
    }

    /**
     * 暂停某个通道
     */
    public pauseChannel(channelID: number): void {
        let channel = this._ensureChannel(channelID);
        channel?.pauseAll();
    }

    /**
     * 恢复所有通道...
     */
    public resume(): void {
        this._channelMap.forEach((_, audioChannel) => {
            audioChannel.resumeAll();
        });
    }

    /**
     * 恢复某个通道
     */
    public resumeChannel(channelID: number): void {
        let channel = this._ensureChannel(channelID);
        channel?.resumeAll();
    }

    /**
     * ...
     */
    public destroy(): void {
        super.destroy();
        this._channelMap.forEach((_, audioChannel) => {
            audioChannel.destroy();
        });
        this._channelMap.clear();
        this._audioMap.clear();
        cc.audioEngine.uncacheAll();
    }

    /**
     * ...
     */
    _ensureChannel(channelID: number): BPAudioChannel {
        let audioChannel = this._channelMap.get(channelID);
        if (!audioChannel) {
            BPLog.engine(`Cannot find audio channel and channel ID is ${channelID}...`);
            return null;
        }

        return audioChannel;
    }
}