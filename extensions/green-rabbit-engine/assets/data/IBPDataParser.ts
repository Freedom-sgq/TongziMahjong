import { BPModelDataType } from "./BPModelBase";

export interface IBPDataParser {
    parseData(text: string): Array<BPModelDataType>;
}