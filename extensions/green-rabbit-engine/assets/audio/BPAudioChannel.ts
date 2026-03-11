import { BPLog } from "../util/BPLog";
import { BPLoader } from "../res/BPLoader";
import { BPMap } from "../struct/BPMap";
import { BPAudioInstance } from "./BPAudioInstance";
import { BPAudioOption } from "./BPAudioManager";


/**
 * @author Tinker
 * @date
 * @description 一个audioChannel对应一个通道，统一管理
 */
export class BPAudioChannel {
    /**加载器 */
    private _loader = new BPLoader(true);

    /**通道id */
    private _channelID: number = null;

    /**全局音量 */
    private _globalVolume: number = null;

    /**通道音量 */
    private _channelVolume: number = null;

    /**实例缓存 */
    private _insMap: BPMap<Array<BPAudioInstance>> = null;

    /**桩实例缓存，桩实例存在，play其他实例，最后一个桩实例暂停，其他实例结束，桩实例恢复*/
    private _pileInsList: BPAudioInstance[] = null;

    /**
     * ...
     */
    constructor(channelID: number, globalVolume: number, channelVolume?: number) {
        this._channelID = channelID;
        this._channelVolume = channelVolume ?? 1.0;
        this._globalVolume = globalVolume ?? 1.0;
        this._insMap = new BPMap<Array<BPAudioInstance>>();
        this._pileInsList = new Array<BPAudioInstance>();
    }

    /**
     * ...
     */
    public play(path: string, maxInsCount: number, option?: BPAudioOption) {
        this._loader.loadRes(path, cc.AudioClip, (error, clip) => {
            if (error) {
                BPLog.error(`Load audio with ${path} failed: ${error}...`);
                return;
            }

            let insList = this._insMap.get(path);
            if (insList == null) {
                insList = this._insMap.set(path, new Array<BPAudioInstance>());
            }

            // 实例数量
            let count = insList.length;
            if (maxInsCount != null && maxInsCount > 0 && maxInsCount <= count) {
                const oldIns = insList[0];
                cc.audioEngine.stop(oldIns?.getId());
            }

            // 音频参数
            const loop = option?.loop ?? false;
            const volume = option?.volume ?? 1.0;
            const pile = option?.pile ?? false;

            this._pauseLastFixedIns();
            const id = cc.audioEngine.play(clip, loop, volume * this._channelVolume * this._globalVolume);
            const ins = new BPAudioInstance(id, path, volume);
            insList.push(ins);
            if (pile) { this._pileInsList.push(ins); }

            // 结束回调
            cc.audioEngine.setFinishCallback(id, () => {
                this._deleteIns(path, id);
                option?.onFinish?.(id);
            });
        });
    }

    /**
     * 恢复音频
     */
    public resume(path: string) {
        let insList = this._insMap.get(path);
        if (insList == null) {
            return;
        }

        insList.forEach((ins) => {
            let id = ins.getId();
            cc.audioEngine.resume(id);
        });
    }

    /**
     * 暂停音频
     */
    public pause(path: string) {
        const insList = this._insMap.get(path);
        if (insList == null) {
            return;
        }

        insList.forEach((ins) => {
            const id = ins.getId();
            cc.audioEngine.pause(id);
        });
    }

    /**
     * 停止
     */
    public stop(path: string) {
        const insList = this._insMap.get(path);
        if (insList == null) {
            return;
        }

        insList.forEach((ins) => {
            const id = ins.getId();
            cc.audioEngine.stop(id);
            this._deleteIns(path, id);
        });
        
        this._resumeLastFixedIns();
    }

    /**
     * 停止通道音频
     */
    public stopAll() {
        this._operateAllIns((ins) => {
            const id = ins.getId();
            cc.audioEngine.stop(id);
        });
    }

    /**
     * 暂停通道
     */
    public pauseAll() {
        this._operateAllIns((ins) => {
            const id = ins.getId();
            cc.audioEngine.pause(id);
        });
    }

    /**
     * 恢复通道
     */
    public resumeAll() {
        this._operateAllIns((ins) => {
            const id = ins.getId();
            cc.audioEngine.resume(id);
        });
    }

    /**
     * 设置通道音量
     */
    public setChannelVolume(channelVolume: number) {
        if (this._channelVolume == channelVolume) {
            return;
        }

        this._channelVolume = channelVolume;
        this._updateVolume();
    }

    /**
     * 全局音量更新 调用
     */
    public updateByGlobalVolume(globalVolume: number) {
        if (this._globalVolume == globalVolume) {
            return;
        }

        this._globalVolume = globalVolume;
        this._updateVolume();
    }

    /**
     * 通道内音频更新音量
     */
    private _updateVolume() {
        this._operateAllIns((ins) => {
            let id = ins.getId();
            let insVolume = ins.getVolume();
            cc.audioEngine.setVolume(id, this._globalVolume * this._channelVolume * insVolume);
        });
    }

    /**
     * 获取通道音量
     */
    public getChannelVolume() {
        return this._channelVolume;
    }

    /**
     * ...
     */
    public destroy() {
        this._insMap.clear();
        this._loader.destroy();
    }

    /**
     * 对所有实例操作...
     */
    private _operateAllIns(opFunction: (ins: BPAudioInstance) => void) {
        this._insMap.forEach((path, insList) => {
            insList.forEach((ins) => {
                opFunction(ins);
            });
        });
    }

    /**
     * 清除一个实例缓存
     */
    private _deleteIns(path: string, id: number) {
        let insList = this._insMap.get(path);
        for (let i = 0; i < insList.length; ++i) {
            let ins = insList[i];
            if (id == ins.getId()) {
                insList.splice(i, 1);
                break;
            }
        }

        const index = this._pileInsList.findIndex((ins) => ins.getId() == id);
        if (index !== -1) {
            this._pileInsList.splice(index, 1);
        }
    }

    /**
     * 
     */
    private _resumeLastFixedIns() {
        const last = this._pileInsList[this._pileInsList.length - 1];
        const id = last?.getId();
        if (id == null) {
            return;
        }
        cc.audioEngine.resume(id);
    }

    /**
     * 
     */
    private _pauseLastFixedIns() {
        const last = this._pileInsList[this._pileInsList.length - 1];
        const id = last?.getId();
        if (id == null) {
            return;
        }
        cc.audioEngine.pause(id);
    }
}