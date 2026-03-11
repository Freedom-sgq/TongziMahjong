import { BPString } from "../util/BPString";
import { BPModelDataType } from "./BPModelBase";
import { IBPDataParser } from "./IBPDataParser";

export class BPJsonParse implements IBPDataParser {
    /**
     * json数据处理成原始数据
     */
    parseData(json: any): Array<BPModelDataType> {
        return json;
    }    
}