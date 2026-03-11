import { BPCmdCallback, BPCmdInfo } from "../data/BPConfigs";
import { BPString } from "../util/BPString";
import { BPEvent } from "./BPEvent";

/**
 * @author
 * @date 
 * @description 指令系统
 * 配置中配置包含若干函数数组，数组下标对应阶段，默认按下标顺序执行
 * 如实现了某个阶段的方法，则会接管执行流程;通过调用回调函数传参, 定制流程;
 */
export class BPCmdUnit {
    /**
     * 
     */
    private _config: BPCmdInfo;

    /**
     * 
     */
    constructor(config: BPCmdInfo) {
        this._config = config;
    }

    /**
     * 
     */
    public do(paramStr: string, finishCallback: BPCmdCallback): void {
        let paramList = BPString.split(paramStr, "#");

        const stageCount = this._config.length;
        let _entryStage = (stage: number) => {
            const nextStage = stage + 1;
            const stageFunction = this._config[stage];
            if (stageFunction) {
                const stageParamList = BPString.split(paramList[stage], ",");
                stageFunction(this, (result) => {
                    // 指定next step, 结束指令
                    if (result && !!result.next) {
                        finishCallback?.(result);
                        return;
                    }

                    if (nextStage == stageCount) {
                        // 没有后续阶段了
                        finishCallback?.(result);
                    }
                    else {
                        // 下一阶段
                        _entryStage(nextStage);
                    }
                }, ...stageParamList);
            }
            else {
                // 指令结束
                if (stage >= stageCount) {
                    return;
                }

                // 没实现, 且有下一阶段，继续
                _entryStage(nextStage);
            }
        }
        _entryStage(0);
    }


}