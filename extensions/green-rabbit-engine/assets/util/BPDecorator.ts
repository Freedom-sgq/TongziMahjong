import { BPSystemBase } from '../gui/delegate/BPSystemBase';
import { BPViewBase } from '../component/controls/BPViewBase';


const CCDecorator = cc._decorator;

/**
 * 异步等待 - setTimeout
 * @param seconds 
 */
const wait = function (seconds: number): Promise<void> {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve();
        }, seconds * 1000);
    });
}

/**
 * @param target 
 */
export function clsName(name: string) {
    return function (target: new (...args: any[]) => any) {
        Object.defineProperty(target, 'name', {
            value: name,
            writable: true,
            configurable: true
        });
    };
}


/** 
 * @description 异步数据 
 */
type AsyncData = [
    (value: unknown) => void, (reason?: unknown) => void, unknown[]
];

/** 
 * @description 异步成员方法 
 */
interface AsyncProperty extends PropertyDescriptor {
    value?: (...args: unknown[]) => Promise<unknown>;
}

/**
 * @author Tinker
 * @date
 * @description
 */
export namespace BPDecorator {
    export const ccclass = CCDecorator.ccclass;
    export const property = CCDecorator.property;
    export const menu = CCDecorator.menu;
    export const requireComponent = CCDecorator.requireComponent;
    export const disallowMultiple = CCDecorator.disallowMultiple;
    export const executeInEditMode = CCDecorator.executeInEditMode;
    export const inspector = CCDecorator.inspector;

    /**
     *  @description 响应参数
     */
    interface ResponseOptionsParams {
        interval?: number;
        audioName?: string;
        blockFunc?: () => void;
    }

    /**
     * @description 针对BPSystem的响应装饰器，可以用于事件响应函数的操作注入
     * @param options 响应参数
     * @returns 
     */
    export function responseOptions(options: ResponseOptionsParams = {}) {
        return function (target: BPSystemBase, propertyKey: string, descriptor: PropertyDescriptor) {
            let bBlock: boolean = false;
            let tempFunc: Function = descriptor.value;
            descriptor.value = function (...args: any[]) {
                // 阻塞代理
                if (bBlock == true) {
                    options.blockFunc?.();
                    return;
                }
                bBlock = true;

                // TODO: play audio...

                // 响应间隔
                let interval = options.interval ?? 300;
                setTimeout(() => { bBlock = false; }, interval);
                tempFunc.apply(this, args);
            }

            return descriptor;
        }
    }

    /**
     *  绑定system
     */
    export function bindSystemThis(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const method = descriptor.value;
        descriptor.value = function (...args: any[]) {
            return method.apply(this.getSystem?.() ?? this, args);
        };
        return descriptor;
    }

    /**
     * @description 异步方法装饰器，多次调用时会按队列顺序依次执行
     * 对于非静态成员，每一个对象实例都存在一个独立的队列
     * 对于静态成员，仅存在一个队列
     */
    export function serial(target: any, propertyKey: string, descriptor: PropertyDescriptor): void {
        const method = descriptor.value;
        const pendingPromise = new WeakMap<object, Promise<any>>();

        descriptor.value = function (...args: any[]): Promise<any> {
            // 获取当前实例的 pending promise
            let currentPromise = pendingPromise.get(this);

            // 创建新的 promise，串接在之前的 promise 后面
            const newPromise = (currentPromise || Promise.resolve())
                .then(() => method.apply(this, args))
                .finally(() => {
                    // 如果当前 promise 完成，从 WeakMap 中移除
                    if (pendingPromise.get(this) === newPromise) {
                        pendingPromise.delete(this);
                    }
                });

            // 更新 pending promise
            pendingPromise.set(this, newPromise);

            return newPromise;
        };
    }

    /**
     * @description 方法装饰器，方法开始执行至执行完毕后锁定一段时间，期间忽略所有对该方法的调用
     * @param seconds 锁定的秒数
     */
    export function lock(seconds: number = 0): (target: unknown, funcName: string, desc: PropertyDescriptor) => void {
        return function (target: unknown, funcName: string, desc: PropertyDescriptor): void {
            let old = desc.value;
            let callingSet: Set<unknown> = new Set();
            desc.value = function (...args: unknown[]): unknown {
                if (callingSet.has(this)) {
                    return;
                }
                callingSet.add(this);
                let result = old.apply(this, args);
                if (result instanceof Promise) {
                    return new Promise((resolve, reject) => {
                        result.then((value: unknown) => {
                            wait(Math.max(seconds, 0)).then(() => { callingSet.delete(this); });
                            resolve(value);
                        }, (reason: unknown) => {
                            wait(Math.max(seconds, 0)).then(() => { callingSet.delete(this); });
                            reject(reason);
                        });
                    });
                } else {
                    wait(Math.max(seconds, 0)).then(() => { callingSet.delete(this); });
                    return result;
                }
            };
        };
    }

    /**
     * 防抖
     * @param wait 延迟时间（毫秒）
     * @param immediate 是否立即执行一次
     */
    export function debounce(wait: number, immediate: boolean = false) {
        return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
            const originalMethod = descriptor.value;
            const timerKey = Symbol(`__bp_debounce_timer_${propertyKey}`);

            descriptor.value = function (...args: any[]) {
                const context = this as any;
                const later = function () {
                    context[timerKey] = null;
                    if (!immediate) {
                        originalMethod.apply(context, args);
                    }
                };
                const callNow = immediate && !context[timerKey];

                if (context[timerKey]) {
                    clearTimeout(context[timerKey]);
                }
                context[timerKey] = setTimeout(later, wait);

                if (callNow) {
                    originalMethod.apply(context, args);
                }
            };
            return descriptor;
        };
    }

    /**
     * 结尾补偿节流
     * @param wait 间隔时间（毫秒）
     */
    export function Throttle(wait: number = 500) {
        return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
            const originalMethod = descriptor.value;
            let timer: ReturnType<typeof setTimeout> | null = null;
            let lastRun = 0;

            descriptor.value = function (...args: any[]) {
                const now = Date.now();
                const remaining = wait - (now - lastRun);
                if (remaining <= 0) {
                    if (timer) {
                        clearTimeout(timer);
                        timer = null;
                    }
                    lastRun = now;
                    return originalMethod.apply(this, args);
                }

                // 结尾补偿
                if (!timer) {
                    timer = setTimeout(() => {
                        lastRun = Date.now();
                        timer = null;
                        originalMethod.apply(this, args);
                    }, remaining);
                }
            };

            return descriptor;
        };
    }

}