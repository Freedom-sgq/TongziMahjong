import * as cc from 'cc';

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

export class BPLog {
    private static _logType: number = LogType.All;

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

    public static timeStart(desc: string = "time"): void {
        console.time(desc);
    }

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

    private static _canLog(logType: LogType): boolean {
        return !!(BPLog._logType & logType);
    }
}