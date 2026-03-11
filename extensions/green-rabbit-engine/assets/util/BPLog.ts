/**
 * @author Tinker
 * @date
 * @description
 */
export enum LogType {
    None, // 0
    Engine = 1 << 0, //1
    Logic = 1 << 1, //2
    Net = 1 << 2,   //4
    All = Net | Logic | Engine  //7
}

const TypeColor: { [key in keyof typeof LogType]: string } = {
    None: "color:gray;",
    Logic: "color:green;",
    Net: "color:blue;",
    Engine: "color:violet;",
    All: "color:gray;",
}

let makeDateString = function (): string {
    let date = new Date();
    let str = date.getHours().toString();
    let _dealStr = function (s: string) {
        return (s.length == 1 ? "0" + s : s) + ":";
    }

    let timeStr = "";
    timeStr += _dealStr(str);

    str = date.getMinutes().toString();
    timeStr += _dealStr(str);

    str = date.getSeconds().toString();
    timeStr += _dealStr(str);

    str = date.getMilliseconds().toString();
    if (str.length == 1) str = "00" + str;
    if (str.length == 2) str = "0" + str;
    timeStr += str;

    return timeStr;
}

let makeLogPrefix = function (type: LogType) {
    let typeKey = LogType[type];
    let title = `[${typeKey}]`;
    let titleColor = "";
    if (!cc.sys.isNative) {
        title = "%c" + title;
        titleColor = TypeColor[typeKey];
    }
    return [title, titleColor];
}


/**
 * ....
 */
export class BPLog {
    private static _logType: number = LogType.All;

    /**
     * ....
     * @param desc
     * @example
     */
    public static setType(logType: LogType): void {
        BPLog._logType |= logType;
        this.updateLogBinding();
    }

    public static disableNet() {
        BPLog._logType &= ~LogType.Net;
        this.updateLogBinding();
    }

    public static enableNet() {
        BPLog._logType |= LogType.Net;
        this.updateLogBinding();
    }

    /**
     * ....
     * @param desc
     * @example
     */
    public static timeStart(desc: string = "time"): void {
        console.time(desc);
    }

    /**
     * ....
     * @param desc
     * @example
     */
    public static timeEnd(desc: string = "time"): void {
        console.time(desc);
    }

    public static engine = (...args: any[]) => { };
    public static logic = (...args: any[]) => { };
    public static net = (...args: any[]) => { };
    public static warn = (...args: any[]) => { };
    public static error = (...args: any[]) => { };

    public static updateLogBinding() {
        this.engine = BPLog._canLog(LogType.Engine) ? cc.log.bind(this, ...makeLogPrefix(LogType.Engine)) : () => { };
        this.logic = BPLog._canLog(LogType.Logic) ? cc.log.bind(this, ...makeLogPrefix(LogType.Logic)) : () => { };
        this.net = BPLog._canLog(LogType.Net) ? cc.log.bind(this, ...makeLogPrefix(LogType.Net)) : () => { };
        this.warn = cc.warn.bind(this);
        this.error = cc.error.bind(this)
    }

    /**
     * 
     * @param logType 
     * @returns 
     */
    private static _canLog(logType: LogType): boolean {
        return !!(BPLog._logType & logType);
    }

    /**
     * 
     * @param depth 
     * @returns 
     */
    private static _stack(depth: number = 3): string {
        let result: Array<any> = [];

        let lines: Array<string> = new Error().stack!.split("\n");
        const begin = 2;
        lines = lines.splice(begin, depth);
        lines.forEach((line) => {
            let tokens = line.trim().split(" ");
            if (tokens.length > 1) {
                result.push(tokens[1]);
            }
        });

        let ret: string = "";
        for (let i = 0; i < result.length; ++i) {
            ret = ret + "[" + result[i] + "]";
            if (i <= result.length - 1) {
                ret = ret + "\n";
            }
        }

        return ret;
    }


}