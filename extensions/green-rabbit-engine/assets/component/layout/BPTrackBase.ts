/**
 * @author Tinker
 * @date
 * @description 分布轨迹的抽象，给定一个周期, 根据分布获得坐标值
 */
export abstract class BPTrackBase {

    /**
     * 循环周期 
     */
    protected abstract _interval: number;

    public getInterval(): number {
        return this._interval;
    }

    /** 
     * 裁剪周期
     */
    protected _cullValue(value: number): number {
        let out = value % this._interval;
        return out;
    }

    /** 
     * 根据分布值，获取坐标值
     */
    abstract getPoint(value: number): cc.Vec2;

    /** 
     * 获取缩放值
     */
    abstract getScale(value: cc.Vec2): number;

    /** 
     * 节点被setPosition的后续操作, 比如改zIndex，opacity等
     */
    abstract onAfterUpdatePos(node: cc.Node): void;
}