/**
 * @author Tinker
 * @date
 * @description 抽象工厂的泛型实现类
 */

import { BPEntityBase } from "./BPEntityBase";
import { BPSystemBase } from "./BPSystemBase";
import { IBPDelegateFactory } from "./IBPDelegateFactory";

type SystemClassType<T extends BPSystemBase> = new (...args: any) => T;
type EntityClassType<T extends BPEntityBase> = new (...args: any) => T;

export class BPDelegateFactory<T1 extends BPSystemBase, T2 extends BPEntityBase> implements IBPDelegateFactory {
    private _SystemClass: SystemClassType<T1>;
    private _PannelClass: EntityClassType<T2>;

    constructor(inSystemClass: SystemClassType<T1>, inEntityClass: EntityClassType<T2>) {
        this._SystemClass = inSystemClass;
        this._PannelClass = inEntityClass;
    }

    createSystem(...args: any[]): T1 {
        if (this._SystemClass) {
            return new this._SystemClass(...args);
        }

        return null;
    }

    createEntity(...args: any[]): T2 {
        if (this._PannelClass) {
            return new this._PannelClass(...args);
        }

        return null;
    }
}