import { BPDecorator as BPDec } from "../../util/BPDecorator";
import { BPComponentBase } from "../BPComponentBase";

/**
 * 
 */
@BPDec.ccclass
@BPDec.disallowMultiple
export abstract class BPListCellBase<T> extends BPComponentBase {
    // 数据索引
    protected _index: number = 0;
    public get index(): number { return this._index; }
    public set index(value: number) { this._index = value; }

    // 标签
    protected _tag: any = 0;
    public get tag(): any { return this._tag; }
    public set tag(value: any) { this._tag = value; }

    protected abstract _updateCell(data: T, ...arg: any[]): void;

    public updateCell(data: T, ...arg: any[]): void {
        this._updateCell(data, ...arg);
    };
}
