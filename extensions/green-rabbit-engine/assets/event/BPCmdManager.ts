import { BPCmdConfig } from "../data/BPConfigs";
import { BPMap } from "../struct/BPMap";
import { BPSingletonBase } from "../struct/BPSingletonBase";
import { BPCmdUnit } from "./BPCmdUnit";
import { BPEvent } from "./BPEvent";


type CmdCallBack = (cur: number, next: number) => void;

/**
 * @author
 * @date 
 * @description 指令集系统
 */
export class BPCmdManager extends BPSingletonBase {

    private _cmdUnits: BPMap<BPCmdUnit> = null;

    protected constructor() {
        super();
        this._cmdUnits = new BPMap<BPCmdUnit>();
    }

    /**
     * @description 构造注册指令
     * "cmd" = {
     *      onStart: () => {},
     *      onProcess: () => {},
     *      onEnd: () => {}
     * }
     */
    public override init(cmdConfigs: BPCmdConfig): void {
        for (let cmdName in cmdConfigs) {
            let config = cmdConfigs[cmdName];
            this._cmdUnits.set(cmdName, new BPCmdUnit(config));
        }
    }

    /**
     * 
     */
    public execute(cmdSetMap: Record<string, any>,
        begin: number,
        finishCallback: CmdCallBack,
        keyStepCallback?: CmdCallBack): void {
        this._execute(cmdSetMap, begin, finishCallback, keyStepCallback);
    }

    /**
     * @param cmdList 指令集配置参数
     * {
     *  0: {cmdCode: gpp1, params: a#b#c, isKey: 0},
     *  1: {cmdCode: gpp2, params: a#b#c, isKey: 1},
     *  ...
     * }
     * @param begin 起始步骤
     * @param finishCallback 指令链结束回调
     * @param keyStepCallback 关键步骤回调
     * 
     */
    private _execute(
        cmdList: Record<number, any>,
        begin: number,
        finishCallback: CmdCallBack,
        keyStepCallback?: CmdCallBack
    ): void {

        let len = Object.keys(cmdList).length;
        if (len == 0) {
            return;
        }

        const runningUnits = [];
        const _walk = (current: number) => {
            const data = cmdList[current];
            const params = data.params;
            const cmdCode = data.cmdCode;
            const isKeyStep = !!data.isKeyStep;

            const cmdUnit = this._cmdUnits.get(cmdCode);
            cmdUnit.do(params, (result) => {
                // 没有更多指令了，结束
                if (current >= len - 1) {
                    // 需求：某一步选择错误，跳转到了最后一步进行提示，但不认为是完成，next为负数，需要传到业务层
                    const next = result && !!result.next ? result.next : null;
                    isKeyStep && keyStepCallback?.(len - 1, next);
                    finishCallback(len - 1, next);
                    return;
                }

                // 默认是当前指令步骤 +1
                let bForceFinish = false;
                let next = current + 1;
                if (result && !!result.next) {
                    // 非负，跳转
                    next = result.next;
                    // 可能同在多选一的情况，比如最后四个选项，执行任意一个就算正常结束，为了方便配置，直接跳转到一个很大的步骤，来判断结束
                    if (next < 0 || next > len) {
                        // 负, 结束
                        bForceFinish = true;
                    }
                }

                // 关键步通知
                isKeyStep && keyStepCallback?.(current, next);

                // 结束退出
                if (bForceFinish) {
                    // 清理闭包中注册的BPEvent;
                    for (let i = 0; i < runningUnits.length; ++i) {
                        BPEvent.getInstance().off(runningUnits[i]);
                    }
                    finishCallback(current, result.next);
                    return;
                }

                _walk(next);
            });
            runningUnits.push(cmdUnit);
        }
        _walk(begin);
    }


    /**
     * 
     */
    public override destroy(): void {
        super.destroy();
        this._cmdUnits.clear();
    }

}