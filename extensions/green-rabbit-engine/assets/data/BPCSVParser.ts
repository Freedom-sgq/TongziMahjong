import { BPString } from "../util/BPString";
import { BPModelDataType } from "./BPModelBase";

import { IBPDataParser } from "./IBPDataParser";

export class BPCSVParser implements IBPDataParser {

    parseData(text: string): Array<BPModelDataType> {
        text = BPString.removeSpace(text);

        let outDatas = [] as Array<BPModelDataType>;
        
        const lines = BPString.splitMultiLine(text);
        const keys = BPString.split(lines[1], ",");
        const types = BPString.split(lines[2], ",");

        for (let i = 3; i < lines.length; ++i) {
            let line = lines[i];
            let values = BPString.split(line, ",");

            let data = {};
            for (let j = 0; j < keys.length; ++j) {
                let key = keys[j];
                let type = types[j];
                if (!key || !type) continue;

                let value = values[j];
                data[key] = (typeof type == "number") ? Number(value) : value;
            }
            outDatas.push(data);
        }

        return outDatas;
    }

    
}