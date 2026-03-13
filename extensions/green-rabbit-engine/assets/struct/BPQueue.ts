export class BPQueue<T> {
    private _queue: Map<number, T>;
    private _back: number;
    private _head: number;

    /**
     * ....
     */
    constructor() {
        this._queue = new Map<number, T>();
        this._back = 0;
        this._head = 0;
    }

    /**
     * @description 队列长度
     */
    public get size(): number {
        return this._back - this._head;
    }

    /**
     * @description 是否为空队列
     */
    public isEmpty(): boolean {
        return this._back == 0;
    }

    /**
     * @description 入队
     */
    public push(element: T): void {
        if (element) {
            this._queue.set(this._back, element);
            this._back = this._back + 1;
        }
    }

    /**
     * @description 出队
     */
    public front(): T | undefined {
        if (this.isEmpty()) {
            return undefined;
        }

        const item = this._queue.get(this._head);
        if (this._queue.delete(this._head)) {
            this._head = this._head + 1;
        }

        return item;
    }

    /**
     * @description 查看队头
     */
    public peek(): T | undefined {
        if (this.isEmpty()) {
            return undefined;
        }

        return this._queue.get(this._head);
    }

    /**
     * @description
     */
    public clear(): void {
        this._queue.clear();
        this._back = 0;
        this._head = 0;
    }

}