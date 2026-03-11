import { BPModelDataType } from "./BPModelBase";

/**
 * @author Tinker
 * @date
 * @description 数据表解析器接口
 */
export interface IBPDataParser {
    parseData(text: string): Array<BPModelDataType>;
}