import { BPLog } from "./BPLog";

export class BPObj {

    /**
     * 判断指定的值是否为对象
     * @param value 值
     */
    public static isObject(value: any): boolean {
        return Object.prototype.toString.call(value) === '[object Object]';
    }

    /**
     * 拷贝对象
     * @param target 目标
     */
    public static copy<T>(target: T): T {
        return JSON.parse(JSON.stringify(target)) as T;
    }

    /**
     * 深拷贝
     * @param target 目标
     */
    public static deepCopy(target: any): any {
        if (target == null || typeof target !== 'object') {
            return target;
        }

        if (target instanceof Array) {
            const result = [];
            for (let i = 0, length = target.length; i < length; i++) {
                result[i] = BPObj.deepCopy(target[i]);
            }
            return result;
        }

        if (target instanceof Object) {
            const result = {};
            for (const key in target) {
                if (target.hasOwnProperty(key)) {
                    result[key] = BPObj.deepCopy(target[key]);
                }
            }
            return result;
        }

        if (target instanceof Date) {
            return (new Date()).setTime(target.getTime());
        }

        BPLog.error(`该类型：${target}, 不支持深拷贝`);
        return null;
    }
}
