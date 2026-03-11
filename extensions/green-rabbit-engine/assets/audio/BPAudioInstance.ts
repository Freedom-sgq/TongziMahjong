/**
 * @author Tinker
 * @date
 * @description 音效实例...
 */
export class BPAudioInstance {
    /** 实例音量 */
    private _volume: number = null;

    /** 实例id */
    private _id: number = null;

    /** 音频路径 */
    private _path: string = "";

    /**
     * ...
     */
    constructor(id: number, path: string, volume?: number) {
        this._id = id;
        this._volume = volume || 1.0;
    }

    getPath() {
        return this._path;
    }

    /**
     * ...
     */
    getVolume() {
        return this._volume;
    }

    /**
     * ...
     */
    getId() {
        return this._id;
    }
}
