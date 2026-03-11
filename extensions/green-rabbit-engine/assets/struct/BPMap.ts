/**
 * @author Tinker
 * @date
 * @description
 * 
 */
type KeyType = string | number | symbol;
export class BPMap<
    T1,
    T2 = undefined,
    Key extends KeyType = T2 extends undefined ? string : T1 & KeyType,
    Value = T2 extends undefined ? T1 : T2> {

    protected _map: Record<Key, Value>;
    protected _size: number;

    /**
    * @example 
    * let map = new BPMap<KeyType, ValueType>;
    * let map = new BPMap<ValueType> 默认是string为key;
    */
    constructor(map?: Record<Key, Value>) {
        if (map) {
            this._map = map;
            this._size = Object.keys(map).length;
        }
        else {
            this._map = cc.js.createMap(true);
            this._size = 0;
        }
    }

    /**
     * ....
     */
    public size(): number {
        return this._size;
    }

    /**
     * ....
     */
    public set(key: Key, val: Value): Value {
        if (!(key in this._map)) {
            this._size++;
        }
        return this._map[key] = val;
    }

    /**
     * ....
     */
    public get(key: Key): Value {
        return this._map[key];
    }

    /**
     * ....
     */
    public has(key: Key): boolean {
        return key in this._map;
    }

    /**
     * ....
     */
    public delete(key: Key): Value {
        let out = this._map[key];
        if (key in this._map) {
            delete this._map[key];
            this._size--;
        }
        return out;
    }

    /**
     * ....
     */
    public clear(): void {
        if (this._size != 0) {
            this._map = cc.js.createMap(true);
            this._size = 0;
        }
    }

    /**
     * @description 遍历
     * @example
     * cache.forEach((key, value) => console.log(key));
     */
    public forEach(backInvoke: (key: Key, value: Value) => void) {
        for (const key in this._map) {
            backInvoke(key, this._map[key]);
        }
    }

    /**
     * @description 通过match函数，返回第一个满足条件的元素
     * @example
     * let val = cache.find((key, value) => key == "name");
     */
    public find(match: (key: Key, value: Value) => boolean) {
        for (const key in this._map) {
            if (match(key, this._map[key])) {
                return this._map[key];
            }
        }
        return null;
    }

    /**
     * ....
     */
    public destroy(): void {
        this._map = null;
    }
}
