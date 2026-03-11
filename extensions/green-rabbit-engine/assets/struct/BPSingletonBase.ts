/**
 * @Author Tinker
 * @date
 * @description
 */
export abstract class BPSingletonBase {
    private static _instance = null;

    /**
     * 
     */
    protected constructor () {};

    /**
     * 
     */
    public static getInstance<T>(this: T): InstanceType<{ new(): never } & T> {
        const cls = this as any;
        if (!cls._instance) {
            cls._instance = new cls();
        }
 
        return cls._instance;
    }

    /**
     * @virtual
     */
    public init(...args: any[]): void {};

    /**
     * @virtual
     */
    public destroy(): void {

    };
}