import { BPLog } from "../util/BPLog";
import { BPCSVParser } from "./BPCSVParser";
import { BPDataBase } from "./BPDataBase";
import { BPJsonParse } from "./BPJsonParser";
import { IBPDataParser } from "./IBPDataParser";
import { IBPModel } from "./IBPModel";

/**
 * 限定值类型为string或number
 */
export interface BPModelDataType {
    [key: string]: string | number;
}

/**
 * 类型构造工具
 */
export type MakeModelDataType<T extends BPModelDataType> = {
    [P in keyof T]: T[P];
}

/**
 * @author Tinker
 * @date
 * @description
 */
export abstract class BPModelBase<T extends BPModelDataType = any> extends BPDataBase implements IBPModel {
    private _csvParser: IBPDataParser = null;
    private _jsonParser: IBPDataParser = null;
    protected _datas = {} as Record<string | number, T>;

    /**
     * 
     */
    constructor() {
        super();
        this._csvParser = new BPCSVParser();
        this._jsonParser = new BPJsonParse();
    }

    /**
     * 通过解析器，解析文本
     */
    public parseData(data: any): void {
        let parser: IBPDataParser = null;
        if (typeof data === "string") {
            parser = this._csvParser;
        }
        else {
            parser = this._jsonParser;
        }
        const outDatas = parser.parseData(data);
        this._process(outDatas as Array<T>);
    };

    /**
     * 子类可以重写...
     * @param inDatas 
     */
    protected _process(inDatas: Array<T>): void {
        this._preProcess(inDatas);
    };

    /**
     * 默认实现找id或者key作为key
     * @param inDatas 
     */
    private _preProcess(inDatas: Array<T>): void {
        const len = inDatas.length;
        for (let i = 0; i < len; ++i) {
            let inData = inDatas[i];
            const key = inData.id ?? inData.key ?? inData.level;
            this._datas[key.toString()] = inData;
        }
    }

    /**
     * 默认数据容器
     * @returns 
     */
    public getDatas(): Record<string, T> {
        return this._datas;
    }

    /**
     * 从默认容器获取具体配置
     * @param key 
     * @returns 
     */
    public getData(key: string | number): T {
        return this._datas[key.toString()];
    }
}
