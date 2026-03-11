import { BPEvent } from "../event/BPEvent";
import { BPLog } from "./BPLog";
import { BPMap } from "../struct/BPMap";
import { BPSingletonBase } from "../struct/BPSingletonBase";
import { BPPolyglot } from "./BPPolyglot";
import { BPString } from "./BPString";
import { BPEnumValueUnion } from "./BPType";

enum Languages {
    ZH = "zh",
    TW = "tw",
    KO = "ko",
    JA = "ja",
    EN = "en",
    AR = "ar",
    VN = "vn",
}

export interface BPLangTextConfigType {
    readonly local: BPEnumValueUnion<Languages>;
    readonly phases: Record<string, any>;
}

export interface BPLangSpriteConfigType {
    readonly key: string;
    readonly path: string;
}

/**
 * @author
 * @date
 * @description
 */
export class BPLang extends BPSingletonBase {
    public static readonly OnBPLanguageSwitch = "OnBPLanguageSwitch";

    private _phasesMap: BPMap<BPLangTextConfigType["phases"]> = null;
    private _pathMap: BPMap<BPLangSpriteConfigType["path"]> = null;

    private _language: BPEnumValueUnion<Languages>;
    private _useRuntimeSwitch: boolean = false;
    private _poly: BPPolyglot = null;

    /**
     * 
     */
    protected constructor() {
        super();
        this._phasesMap = new BPMap<BPLangTextConfigType["phases"]>();
        this._pathMap = new BPMap<BPLangSpriteConfigType["path"]>();
        this._language = Languages.ZH;
        this._useRuntimeSwitch = false;
    }

    /**
     * 
     */
    public init(textList: Array<BPLangTextConfigType>, pathList: Array<BPLangSpriteConfigType>, op?: Record<string, any>): void {
        for (let i = 0; i < textList.length; ++i) {
            let config = textList[i];
            this._phasesMap.set(config.local, config.phases);
        }

        for (let i = 0; i < pathList.length; ++i) {
            let config = pathList[i];
            this._pathMap.set(config.key, config.path);
        }

        this._poly = new BPPolyglot(op);
        this._replacePloyLocal();
    }

    /**
     * @example
     * let str = lang.getText("nav.hello");
     * let str1 = lang.getText("nav.hello_name", {name: "Spike"});
     */
    public getText(textKey: string, options?: Record<string, any>): string {
        return this._poly.t(textKey, options);
    }

    /**
     *  2 => 二
     *  11 => 十一
     */
    public num2Lang(num: number) {
        const lang = this._language;
        if (lang == Languages.ZH) {
            return this._num2Zh(num);
        }
        else {
            return num.toString();
        }
    }

    private _num2Zh(n: number) {
        const units = ['', '十', '百', '千', '万', '十', '百', '千'];
        const nums = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];

        if (n === 0) { return nums[0]; }

        let result = "";
        let zero = false;
        let unitPos = 0;
        while (n > 0) {
            const digit = n % 10;
            if (digit === 0) {
                if (!zero && result !== '') {
                    result = nums[0] + result;
                    zero = true;
                }
            } else {
                zero = false;
                result = nums[digit] + units[unitPos] + result;
            }
            unitPos++;
            n = Math.floor(n / 10);
        }

        result = result.replace(/^一十/g, units[1]);
        result = result.replace(/零+/g, nums[0]);
        if (result.endsWith(nums[0])) {
            result = result.slice(0, -1);
        }

        return result;
    }

    public num2LangUp(num: number) {
        const lang = this._language;
        if (lang == Languages.ZH) {
            return this._num2ZhUpper(num);
        }
        else {
            return num.toString();
        }
    }

    private _num2ZhUpper(n: number) {

        const units = ['', '拾', '佰', '仟', '萬', '億', '百', '千'];
        const nums = ['零', '壹', '貳', '叁', '肆', '伍', '陸', '柒', '捌', '玖'];

        if (n === 0) { return nums[0]; }

        let result = "";
        let zero = false;
        let unitPos = 0;
        while (n > 0) {
            const digit = n % 10;
            if (digit === 0) {
                if (!zero && result !== '') {
                    result = nums[0] + result;
                    zero = true;
                }
            } else {
                zero = false;
                result = nums[digit] + units[unitPos] + result;
            }
            unitPos++;
            n = Math.floor(n / 10);
        }

        result = result.replace(/^壹拾/g, units[1]);
        result = result.replace(/零+/g, nums[0]);
        if (result.endsWith(nums[0])) {
            result = result.slice(0, -1);
        }

        return result;
    }

    /**
     * @description 获取多语言资源路径
     * @example
     * let url = lang.getResUrl("pathKey:lang.png");
     * => "GameBundle:texture/zh/lang.png"
     */
    public getResUrl(pathKey: string): string {
        let outUrl = "";

        let splits = BPString.split(pathKey, ":");
        if (splits.length != 2 && splits.length != 3) {
            BPLog.error(`BPLang.getResUrl()'s param ${pathKey} is not valid!`);
            return outUrl;
        }

        let path = this._pathMap.get(splits[0]);
        if (path == null) {
            BPLog.error(`pathMap has no key of ${splits[0]} ...`);
            return outUrl;
        }

        let realPath = splits[1].replace(/\.(\w*)/g, "");
        outUrl = `${path}/${this._language}/${realPath}`;

        let subKey = splits[2];
        if (subKey != null) {
            outUrl = outUrl + `:${subKey}`;
        }

        return outUrl;
    }

    /**
     * @description 获取编辑器下多语言资源路径不含("db://assets/")
     * 
     */
    public getResUrlEditor(langKey: string): string {
        let outUrl = "";

        let splits = BPString.split(langKey, ":");
        if (splits.length != 2 && splits.length != 3) {
            BPLog.error(`BPLang.getResUrl()'s param ${langKey} is not valid!`);
            return outUrl;
        }

        let path = this._pathMap.get(splits[0]);
        if (path == null) {
            BPLog.error(`pathMap has no key of ${splits[0]} ...`);
            return outUrl;
        }

        let realPath = splits[1];
        outUrl = `${path}/${this._language}/${realPath}`.replace(":", "/");

        let subKey = splits[2];
        if (subKey != null) {
            outUrl = outUrl + `:${subKey}`;
        }
        else {
            outUrl = outUrl + `/` + realPath.match(/[^/]+(?=\.)/g)[0];
        }

        return outUrl;
    }

    /**
     * 切换语言
     */
    public switch(language: BPEnumValueUnion<Languages>): void {
        if (this._language == language) { return; }
        this._language = language;

        this._replacePloyLocal();

        if (this._useRuntimeSwitch == true) {
            this._pushEventRuntime();
        }
    }

    /**
     * 当前语言, 返回当前语言的字符串..
     */
    public local(): BPEnumValueUnion<Languages> {
        return this._language;
    }

    /**
     * 
     */
    private _replacePloyLocal() {
        let phases = this._phasesMap.get(this._language);
        if (phases == null) {
            BPLog.error(`no phases found for language ${this._language} ...`);
            return;
        }
        this._poly.replace(phases);
    }

    /**
     * 推事件，通知onLoad的组件更新...运行时刷新
     */
    private _pushEventRuntime(): void {
        BPEvent.getInstance().emit(BPLang.OnBPLanguageSwitch, this._language);
    }

    /**
     * 
     */
    public destroy(): void {
        super.destroy();
        this._phasesMap.clear();
        this._pathMap.clear();
    }
}