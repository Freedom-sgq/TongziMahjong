export class BPStack<T> {
    private _stack: T[] = new Array<T>();

    /**
     * @description 入栈
     */
    public push(inElement: T) {
        this._stack.push(inElement);
    }

    /**
     * @description 出栈，连续出栈会返回一个满足出栈顺序的数组
     */
    public pop(index: number): T[];
    public pop(): T;
    public pop(index?: number) {
        if (index == null) {
            return this._stack.pop();
        }

        if (index < 0) {
            return [];
        }

        return this._stack.splice(index).reverse();
    }

    /**
     * @description 查看
     */
    public peek(index: number): T[];
    public peek(): T;
    public peek(index?: number) {
        if (index == null) {
            return this._stack[this._stack.length - 1];
        }

        if (index < 0) {
            return [];
        }

        return this._stack.slice(index).reverse();
    }

    /**
     * ....
     */
    public isEmpty() {
        return this._stack.length === 0;
    }

    /**
     * ....
     */
    public size() {
        return this._stack.length;
    }

    /**
     * ....
     */
    public remove(inElement: T): boolean {
        for (let i = this._stack.length - 1; i >= 0; --i) {
            const element = this._stack[i];
            if (inElement === element) {
                this._stack.splice(i, 1);
                return true;
            }
        }
        return false;
    }

    /**
     * @description 查询
     */
    public find(match: (inElement: T) => boolean): T;
    public find(match: (inElement: T) => boolean, findAll: true): T[];
    public find(match: (inElement: T) => boolean, findAll?: true): T | T[] | null {
        if (findAll) {
            const results: T[] = [];
            for (let i = this._stack.length - 1; i >= 0; --i) {
                const element = this._stack[i];
                if (match(element)) {
                    results.push(element);
                }
            }
            return results;
        }

        for (let i = this._stack.length - 1; i >= 0; --i) {
            const element = this._stack[i];
            if (match(element)) {
                return element;
            }
        }
        return null;
    }

    /**
     * @description 查询返回索引
     */
    public findIndex(match: (inElement: T) => boolean): number {
        for (let i = this._stack.length - 1; i >= 0; --i) {
            const element = this._stack[i];
            if (match(element)) {
                return i;
            }
        }
        return -1;
    }

    /**
     * ....
     */
    public clear() {
        this._stack = [];
    }
}