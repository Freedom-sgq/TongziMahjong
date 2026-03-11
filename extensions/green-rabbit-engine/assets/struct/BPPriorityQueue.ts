/**
 * 
 */
export abstract class BPPriorityQueueElement {
    /**元素在容器中得序列，用于查找 */
    private _index: number = -1;

    public get index(): number {
        return this._index;
    }

    public set index(value: number) {
        this._index = value;
    }

    /**
     * 是否比参数元素更重要
     * @param other 
     */
    public abstract firstThan(other: BPPriorityQueueElement): boolean;
}


/**
 * @author Tinker
 * @date 
 * @description 优先队列，用优先级比较抽象大小堆.
 */
export class BPPriorityQueue<T extends BPPriorityQueueElement> {
    private _heap: Array<T>;
    private _size: number;

    /**
     * ....
     */
    constructor() {
        this._heap = new Array<T>();
        this._size = 0;
    }

    /**
     * @description 队列长度
     */
    public get size(): number {
        return this._size;
    }

    /**
     * @description 是否为空队列
     */
    public isEmpty(): boolean {
        return this._size == 0;
    }

    /**
     * 
     */
    public remove(element: T) {
        if (!this.contains(element)) {
            return;
        }

        const index = element.index;
        if (index === this._last()) {
            this._heap.pop();
            element.index = -1;
            this._size = this._size - 1;
            return;
        }

        const replacement = this._heap[this._last()];
        this._swap(index, this._last());
        this._heap.pop();
        this._size = this._size - 1;
        element.index = -1;

        this.update(replacement);
    }

    public update(element: T) {
        if (!this.contains(element)) {
            return;
        }

        const index = element.index;
        const bUp = this._compareWithParent(index);
        if (bUp) {
            // 需要上浮
            this._heapifyUp(index);
        }
        else {
            // 需要下沉
            this._heapifyDown(index);
        }
    }

    /**
     * @description 入队
     */
    public push(element: T): void {
        this._size = this._size + 1;
        element.index = this._last();

        this._heap.push(element);
        this._heapifyUp();
    }

    /**
     * @description 出队
     */
    public front(): T {
        if (this.isEmpty()) {
            return null;
        }

        // 先交换, 避免二次交换
        this._swap(0, this._last());
        // 再出队
        const element = this._heap.pop();
        this._size = this._size - 1;
        if (element) {
            element.index = -1; 
        }
        this._heapifyDown();
        return element;
    }

    /**
     * 是否包含元素
     */
    public contains(element: T): boolean {
        return element.index >= 0 && 
               element.index < this._size && 
               this._heap[element.index] === element;
    }

    /**
     * @description 查看队头
     */
    public peek(): T {
        if (this.isEmpty()) {
            return null;
        }

        return this._heap[0];
    }

    /**
     * 
     */
    public clear(): void {
        this._heap = [];
        this._size = 0;
    }

    /**
     *  队尾
     */
    private _last = () => this._size - 1;

    /**
     *  父
     */
    private _parent = (index: number) => Math.floor((index - 1) / 2);

    /**
     *  左索引
     */
    private _left = (index: number) => 2 * index + 1;

    /**
     *  右索引
     */
    private _right = (index: number) => 2 * index + 2;

    /**
     *  自己是否比父牛
     */
    private _compareWithParent = (index: number) => {
        const parent = this._parent(index);
        if (parent < 0) {
            // 越界
            return false;
        }

        return this._heap[index].firstThan(this._heap[parent]);
    };

    /**
     * 目标是否比自己牛
     */
    private _compare = (index: number, target: number) => {
        if (target > this._last()) {
            // 越界
            return false;
        }

        return this._heap[target].firstThan(this._heap[index]);
    }

    /**
     *  交换
     */
    private _swap = (index: number, target: number) => {
        if (index == target) { return; }
        [this._heap[index], this._heap[target]] = [this._heap[target], this._heap[index]];

        // 更新element index属性
        this._heap[index].index = index;
        this._heap[target].index = target;
    };

    /**
     * 上浮
     */
    private _heapifyUp = (cur: number = this._last()) => {
        let current = cur;
        while (this._compareWithParent(current)) {
            const parent = this._parent(current);
            this._swap(current, parent);
            current = parent;
        }
    };

    /**
     * 下沉
     */
    private _heapifyDown = (cur: number = 0) => {
        let current = cur;
        while (current < this._last()) {
            const left = this._left(current);
            const right = this._right(current);

            let target = current;
            if (this._compare(target, left)) {
                target = left;
            }

            if (this._compare(target, right)) {
                target = right;
            }

            if (target == current) {
                break;
            }

            // 可以下沉，交换
            this._swap(current, target);
            current = target;
        }
    };
}