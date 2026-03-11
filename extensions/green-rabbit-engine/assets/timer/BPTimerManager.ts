import { BPPriorityQueue } from "../struct/BPPriorityQueue";
import { BPSingletonBase } from "../struct/BPSingletonBase";
import { BPTimer } from "./BPTimer";
import { BPMap } from "../struct/BPMap";
import { BPLog } from "../util/BPLog";

class BPTimerPool {
    // 可用容器
    private _pool: BPTimer[] = [];
    // 用来查找在运行的定时器
    private _runtime: BPMap<number, BPTimer> = new BPMap();
    private _serial = 0;

    public put(timer: BPTimer) {
        this._runtime.delete(timer.id).reset();
        this._pool.push(timer);
    }

    public get() {
        this._serial = this._serial + 1;
        if (this._serial > 0x7FFFFFFF) {
            this._serial = 0;
        }

        let outTimer = this._pool.pop();
        if (!outTimer) {
            outTimer = this._createTimer();
        }

        outTimer.id = this._serial;
        this._runtime.set(outTimer.id, outTimer);
        return outTimer;
    }

    public find(id: number) {
        return this._runtime.get(id);
    }

    private _createTimer() {
        return new BPTimer(this._serial);
    }

    public destroy() {
        this._serial = 0;
        this._pool = [];

        this._runtime.forEach((_, timer) => {
            timer.reset();
        });
        this._runtime.clear();
    }
}

/**
 * 
 */
export class BPTimerManager extends BPSingletonBase {
    private _elapsed = 0;
    private _pool = new BPTimerPool();
    private _queue = new BPPriorityQueue<BPTimer>();
    private _pause = new BPMap<number, BPTimer>();

    public override init() {
    }

    /**
     * @param [repeat=1] 0: 无限重复, 1~N次数 无限重复的定时器会默认先调用一次
     */
    public start(callback: Function, interval: number = 1, repeat: number = 0): number {
        const timer = this._pool.get();
        timer.setup(this._elapsed, {
            callback: callback,
            interval: interval,
            repeat: repeat,
        });

        // 重复定时器先调用一次 ...
        if (repeat == 0) {
            callback?.();
        }

        this._queue.push(timer);
        return timer.id;
    }

    /**
     * 
     */
    public stop(id: number) {
        const timer = this._pool.find(id);
        if (!timer) {
            BPLog.error(`停止失败, 未找到对应得定时器对象 id: ${id} ... `)
            return;
        }
        BPLog.engine(`停止定时器对象 id: ${id} ...`)
        this._queue.remove(timer);
        this._pause.delete(timer.id);
        this._pool.put(timer);
    }

    /**
     * 
     */
    public pause(id: number) {
        const timer = this._pool.find(id);
        if (!timer) {
            BPLog.error(`暂停失败, 未找到对应得定时器对象 id: ${id} ... `)
            return;
        }

        timer.pause(this._elapsed);
        this._queue.remove(timer);
        this._pause.set(timer.id, timer);
    }

    /**
     * 
     */
    public resume(id: number) {
        const timer = this._pool.find(id);
        if (!timer) {
            BPLog.error(`恢复失败, 未找到对应得定时器对象 id: ${id} ... `)
            return;
        }

        timer.resume(this._elapsed);
        this._queue.push(timer);
        this._pause.delete(timer.id);
    }

    /**
     *  递归更新...
     */
    private _update(timer: BPTimer) {
        if (!timer || timer.timing > this._elapsed) {
            return;
        }

        const hasNext = timer.trigger();
        if (!hasNext) {
            // 出队, 回收
            this._pool.put(this._queue.front());
        }
        else {
            // 更新
            this._queue.update(timer);
        }

        this._update(this._queue.peek());
    }

    /**
     * 
     */
    public update(dt: number) {
        this._elapsed = this._elapsed + dt;
        const timer = this._queue.peek();
        this._update(timer);
    }

    /**
     * 
     */
    public destroy() {
        super.destroy();

        this._queue.clear();
        this._pool.destroy();
        this._pause.forEach((_, timer) => {
            timer.reset();
        });
        this._pause.clear();
    }
}