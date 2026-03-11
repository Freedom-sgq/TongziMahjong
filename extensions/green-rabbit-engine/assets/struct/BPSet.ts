type CallBackFuncType<T> = (value1: T, value2: T, set: Set<T>) => void

/**
 * @author Tinker
 * @date 
 * @description
 */
export class BPSet<T> {
    private _set: Set<T>;

    constructor(values?: readonly T[] | null) {
        this._set = new Set<T>(values);
    }

    /**
     * ....
     */
    public add(value: T): this {
        this._set.add(value);
        return this;
    }

    /**
     * ....
     */
    public has(value: T): boolean {
        return this._set.has(value);
    }

    /**
     * ....
     */
    public clear(): void {
        this._set.clear();
    }

    /**
     * ....
     */
    public size(): number {
        return this._set.size;
    }

    /**
     * ....
     */
    public delete(value: T): boolean {
        return this._set.delete(value);
    }

    /**
     * 对Set对象中的每个值按插入顺序执行一次所提供的函数。
     */
    public forEach(callbackFunc: CallBackFuncType<T>, thisArg?: any): void {
        this._set.forEach(callbackFunc, thisArg);
    }

    /**
     * @example
     * const values = letters.values();
     * let text = "";
     * for (const entry of values) {
     *      text += entry;
     * }
     */
    public values(): IterableIterator<T> {
        return this._set.values();
    }

    /**
     * entries() 方法返回的是 [value,value] 值值对
     */
    public entries(): IterableIterator<[T, T]> {
        return this._set.entries();
    }

    /**
     * 联合,改变本实例
     */
    public union(inSet: BPSet<T>) {
        inSet.forEach((v) => {
            this.add(v);
        });
        
        return this;
    }

    /**
     * 相交,改变本实例
     */
    public intersection(inSet: BPSet<T>) {
        let longSet: BPSet<T> = this;
        let shortSet: BPSet<T> = inSet;
        if (this.size() - inSet.size() < 0) {
            longSet = inSet;
            shortSet = this;
        }

        let temp = new Set<T>();
        shortSet.forEach(v => {
            if (longSet.has(v)) {
                temp.add(v);
            }
        });

        this._set.clear();
        this._set = temp;
        return this;
    }

    /**
     * 相差,改变本实例
     */
    public difference(inSet: BPSet<T>) {
        // TODO
        return this;
    }

    /**
     * 子集
     */
    public isSubsetOf(inSet: BPSet<T>) {
        // TODO
        return this;
    }

}
