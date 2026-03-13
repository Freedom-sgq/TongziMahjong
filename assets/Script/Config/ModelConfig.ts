import { BPModule } from "BPEngine";

export const DefaultDictPath = "App:Dict/";

// 表配置信息
type ConfigGuard = BPModule.BPModelConfig;
export const ModelConfig = [
    // { dict: "DictMainland",               cls: Model.ModelMainland },
    // { dict: "DictMainlandCfg",            cls: Model.ModelMainlandCfg,           dir: "App:DictManual" },
] satisfies ConfigGuard;