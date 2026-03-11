
import { BPPriorityQueueElement } from "../struct/BPPriorityQueue";
import { BPConst } from "../util/BPConst";
/**
 * 
 */
export interface BPTimerOp {
    callback: Function,
    interval: number,
    // 0无限循环, 1~n次数
    repeat: number,
}

/**
 * @Author: Tinker
 * @Description: 计时器节点
 */
export class BPTimer extends BPPriorityQueueElement {
    private _id: number;
    /**触发回调时间*/
    private _timing: number = 0;
    private _count: number = 0;

    private _callback: Function = null;
    private _interval: number = 0;
    private _repeat: number = 1;

    private _pauseRemainTime = 0;
    /**
     * 
     */
    constructor(id: number) {
        super();
        this._id = id;
    }

    /**
     * 
     */
    get id(): number {
        return this._id;
    }

    set id(value: number) {
        this._id = value;
    }

    get timing(): number {
        return this._timing;
    }

    public trigger() {
        let hasNext = false;
        if (this._repeat == 0) {
            hasNext = true;
        }
        else if (this._repeat > 0) {
            this._count = this._count + 1;
            this._count < this._repeat && (hasNext = true);
        }

        // 回调一下
        this._callback?.();

        if (hasNext) {
            // 更新
            this._timing = this._timing + this._interval;
        }

        return hasNext;
    }

    public pause(time: number) {
        this._pauseRemainTime = this._timing - time;
    }

    public resume(time: number) {
        this._timing = this._pauseRemainTime + time;
    }

    /**
     * 
     */
    public setup(time: number, op: BPTimerOp) {
        this._callback = op.callback;
        this._interval = op.interval;
        this._repeat = op.repeat;

        this._timing = time + this._interval;
    }

    /**
     * 
     */
    public reset() {
        this._callback = null;
        this._interval = 0;
        this._repeat = 1;
        this._timing = 0;
        this._count = 0;
    }

    /**
     * 
     */
    public firstThan(other: BPTimer): boolean {
        const delta = this._timing - other.timing;

        if (Math.abs(delta) < BPConst.Epsilon5) {
            return this._id < other.id;
        }

        return delta < 0;
    }
}
