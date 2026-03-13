export class BPArray<T> {
    protected _array: Array<T>;

    /**
     * @example 
     * let array = new BPArray<T>();
     * let array = new BPArray<T>([1, 2, 3]);
     */
    constructor(array?: Array<T>) {
        this._array = array ? array.slice() : [];
    }

    /**
     * 获取数组长度
     */
    public get length(): number {
        return this._array.length;
    }

    /**
     * 获取数组副本
     */
    public toArray(): Array<T> {
        return this._array.slice();
    }

    /**
     * 添加元素
     */
    public push(element: T): number {
        return this._array.push(element);
    }

    /**
     * 弹出最后一个元素
     */
    public pop(): T | undefined {
        return this._array.pop();
    }

    /**
     * 获取指定索引的元素
     */
    public get(index: number): T | undefined {
        return this._array[index];
    }

    /**
     * 设置指定索引的元素
     */
    public set(index: number, element: T): void {
        this._array[index] = element;
    }

    /**
     * 检查是否包含某个元素
     */
    public has(element: T): boolean {
        return this._array.indexOf(element) !== -1;
    }

    /**
     * 乱序, 改变数组
     */
    public shuffle(): BPArray<T> {
        for (let i = this._array.length - 1; i >= 0; i--) {
            let rand = Math.floor(Math.random() * (i + 1));
            [this._array[rand], this._array[i]] = [this._array[i], this._array[rand]];
        }
        return this;
    }

    /**
     * 乱序，不改变数组
     */
    public obfuscate(): BPArray<T> {
        let result = this._array.slice().sort(() => Math.random() - .5);
        return new BPArray<T>(result);
    }

    /**
     * 数组扁平化
     */
    public flat(): BPArray<any> {
        let array = this._array.slice();
        for (; array.some(v => Array.isArray(v));) {
            //array 中是否有数组
            array = [].concat.apply([], array);
        }
        return new BPArray<any>(array);
    }

    /**
     * 合并数组
     * @param other 另一个BPArray实例或普通数组
     */
    public combine(other: BPArray<T> | Array<T>): BPArray<T> {
        const otherArray = other instanceof BPArray ? other.toArray() : other;
        let newArray = [...this._array, ...otherArray];
        return new BPArray<T>(newArray);
    }

    /**
     * 获取随机数组成员
     */
    public randElement(): T | undefined {
        if (this._array.length === 0) return undefined;
        let element = this._array[Math.floor(Math.random() * this._array.length)];
        return element;
    }

    /**
     * 找出并弹出
     */
    public findAndPop(condition: (element: T) => boolean): T | null {
        const index = this._array.findIndex(condition);
        if (index !== -1) {
            return this._array.splice(index, 1)[0];
        }
        return null;
    }

    /**
     * 遍历数组
     * @example
     * array.forEach((element, index) => console.log(element));
     */
    public forEach(callback: (element: T, index: number) => void): void {
        this._array.forEach(callback);
    }

    /**
     * 查找第一个满足条件的元素
     * @example
     * let val = array.find((element, index) => element > 5);
     */
    public find(predicate: (element: T, index: number) => boolean): T {
        return this._array.find(predicate);
    }

    /**
     * 过滤数组元素
     */
    public filter(predicate: (element: T, index: number) => boolean): BPArray<T> {
        return new BPArray<T>(this._array.filter(predicate));
    }

    /**
     * 映射数组元素
     */
    public map<U>(callback: (element: T, index: number) => U): BPArray<U> {
        return new BPArray<U>(this._array.map(callback));
    }

    /**
     * 删除指定索引的元素
     */
    public removeAt(index: number): T {
        if (index >= 0 && index < this._array.length) {
            return this._array.splice(index, 1)[0];
        }
        return null;
    }

    /**
     * 删除指定元素
     */
    public remove(element: T): boolean {
        const index = this._array.indexOf(element);
        if (index !== -1) {
            this._array.splice(index, 1);
            return true;
        }
        return false;
    }

    /**
     * 清空数组
     */
    public clear(): void {
        this._array.length = 0;
    }

    /**
     * 销毁实例
     */
    public destroy(): void {
        this._array = null;
    }
}