import { BPString } from "./BPString";

/**
 * @description 非函数类型的可选属性类型的联合类型
 */
export type BPOmitFunctionsOptional<T> = OmitType<T, Function>;

/**
 * @description 获取键的联合类型, 不能接受枚举类型
 */
export type BPObjectKeyUnion<T extends { [key: string]: string | number }> = keyof T;

/**
 * @description 获取值的联合类型, 不能接受枚举类型
 */
export type BPObjectValueUnion<T extends { [key: string]: string | number }> = T[keyof T];

/**
 * @description 获取枚举类型的值的联合类型
 */
export type BPEnumValueUnion<T> = T extends `${infer R extends string | number}` ? `${R}` : T;

/**
 * 
 */
export type BPOmitProps<T, K> = {
    [P in keyof T as P extends K ? never : P]: T[P];
};

/**
 * @description 函数类型
 */
export type BPFunc<T extends any[], R> = (...args: T) => R;

/**
 * @description 类类型
 */
export type BPClassType<T> = new (...args: any[]) => T;

export type BPNonEnumKeys<T> = {
  [K in keyof T]: T[K] extends new (...args: any[]) => any ? K : never
}[keyof T];

/**
 * 
 */
type BPOmitFunctions<T> = { [P in keyof Pick<T, { [K in keyof T]: T[K] extends Function ? never : K }[keyof T]>]: T[P] };
type FlagExcludedType<Base, Type> = { [Key in keyof Base]: Base[Key] extends Type ? never : Key };
type AllowedNames<Base, Type> = FlagExcludedType<Base, Type>[keyof Base];
type KeyPartial<T, K extends keyof T> = { [P in K]?: T[P] };
type OmitType<Base, Type> = KeyPartial<Base, AllowedNames<Base, Type>>;


/**
 * @description 复杂对象类型推导
 */
type BPProp<T, P extends string> = string extends P
    ? unknown
    : P extends keyof T
    ? T[P]
    : P extends `${infer R}.${infer U}`
    ? R extends keyof T
    ? BPProp<T[R], U>
    : unknown
    : unknown;

/**
 * @description
 */
type BPProxy<T> = {
    get(): T;
    set(value: T): void;
};

/**
 * @description
 */
type BPProxify<T> = {
    [P in keyof T]: BPProxy<T[P]>;
};

/**
 * @author Tinker
 * @date
 * @description 工具类型类
 */
export class BPType {
    /**
     * 判断指定的值是否为对象
     * @param value 值
     */
    public static isObject(value: any): boolean {
        return Object.prototype.toString.call(value) === '[object Object]';
    }

    /**
     * @description 从复杂对象中返回子对象，且推导出对应类型
     * @param target 目标对象
     * @param path 路径
     * @returns 值
     * @example 
     *  const obj = {a: {b: {c: 123, d: "123"}}};
        let a = BPType.getPropValue(obj, "a");
     */
    public static getPropValue<T, P extends string>(target: T, path: P): BPProp<T, P> {
        let outProp: BPProp<T, P>;
        let subs = BPString.split(path, ".");
        for (let i = 0; i < subs.length; ++i) {
            let sub = subs[i];
            outProp = (outProp != null) ? outProp[sub[i]] : target[sub[i]];
        }

        return outProp;
    }

    /**
     * @description
     * @example 
     *  let proxyProps = proxify({ name: "tk", age: 0 });
     *  proxyProps.name.get();
     *  proxyProps.age.get();
     */
    public static proxify<T>(target: T): BPProxify<T> {
        const result = {} as BPProxify<T>;

        for (const key in target) {
            let value = target[key];

            result[key] = {
                get() {
                    return value;
                },

                set(newValue: T[Extract<keyof T, string>]) {
                    value = newValue;
                }
            };
        }

        return result;
    }
}




