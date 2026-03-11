import { BPLang } from "./BPLang";
import { BPType } from "./BPType";

/**
 * @author
 * @date
 * @description
 */
export class BPString {
    /**
     * 分割
     */
    public static split(str: string, separator: string | RegExp = "_", limit?: number): string[] {
        if (!str) return [];
        return str.split(separator, limit);
    }

    /**
     * 无空格分割
     */
    public static splitTrim(str: string, separator: string | RegExp, limit?: number): string[] {
        if (!str) return [];
        return this.removeSpace(str).split(separator, limit);
    }

    /**
     * 多行分割
     */
    public static splitMultiLine(str: string): Array<string> {
        return this.split(str.trim(), /\r?\n|\r/g);
    }

    /**
     * 去空格
     */
    public static removeSpace(str: string): string {
        return str.replace(/ /g, "");
    }

    /**
     * 查找字符串中第一个匹配指定正则表达式的子字符串
     */
    public static matchFirst(str: string, regex: RegExp): string {
        const matches = str.match(regex);
        return matches ? matches[0] : "";
    }

    /**
     * 是否以某字符结尾
     */
    public static isEndOf(str: string, symbol: string): boolean {
        return (str[str.length - 1] === symbol);
    }

    /**
     * 返回末尾到某符号的中间字符串
     * @example
     * BPString.lastToEnd("a/b/c/d/e", "/"); ==> e
     */
    public static lastToEnd(str: string, symbol: string): string {
        const out = this.matchFirst(str, new RegExp(`[^${symbol}]*$`, "g"))
        return out == str ? "" : out;
    }

    /**
     * 返回末尾到某符号的中间字符串
     * @example
     * BPString.lastToStart("a/b/c/d/e", "/"); ==> a/b/c/d
     */
    public static lastToStart(str: string, symbol: string): string {
        return this.matchFirst(str, new RegExp(`.*(?=${symbol})`, "g"));
    }

    /**
     * 判断字符串是否匹配指定的正则表达式
     */
    public static isMatch(str: string, regex: RegExp): boolean {
        return regex.test(str);
    }

    /**
     * @example 
     *  const arr1 = [1, 2, 5, 6, 7, 8];
     *  const arr2 = [2, 3, 4];
     *  const index = arr1.indexOf(2);
     *  console.log(index)
     *  console.log(insertArrayAt(arr1, arr2, index)); //[1, 2, 3, 4, 5, 6, 7, 8]
     */
    public static insertArrayAt(arr1: any[], arr2: any[], index: number) {
        Array.prototype.splice.apply(arr1, [index, 1].concat(arr2));
        return arr1;
    }

    /**
     * 首字母大小写
     */
    public static convertFirstLetter(str: string, isUpperCase = false): string {
        for (let i = 0; i < str.length; i++) {
            let char = str[i];

            if (/[a-zA-Z]/.test(char)) {
                if (isUpperCase == true) {
                    char = char.toUpperCase();
                }
                else {
                    char = char.toLowerCase();
                }
                return str.substring(0, i) + char + str.substring(i + 1);
            }
        }

        return str;
    }

    /**
     * 解析json..
     */
    public static parseJson(jsonStr: string): any {
        if (typeof jsonStr != 'string') {
            return jsonStr;
        }

        try {
            var obj = JSON.parse(jsonStr);
            if (typeof obj == 'object' && obj) {
                return obj;
            }
            return jsonStr;
        }
        catch (e) {
            return jsonStr;
        }
    }

    /**
     * 通用格式化字符串
     * @example
     * BPString.format("name is ${name}, age is ${age}", "tinker", 28);
     * BPString.format("name is ${name}, age is ${age}", {name: "tinker", age: 28});
     */
    public static format(inStr: string, ...args: [Record<string, string | number>] | Array<string | number>) {
        let outStr = inStr;

        if (args.length == 1 && BPType.isObject(args[0])) {
            const obj = args[0] as Record<string, string | number>;
            for (let key in obj) {
                let keyStr = `\\$` + `{${key}}`
                let reg = new RegExp(keyStr, "g");
                outStr = outStr.replace(reg, `${obj[key]}`);
            }
        } else {
            args.forEach((val: any) => {
                outStr = outStr.replace(/\$\{.*?\}/, `${val}`);
            });
        }

        return outStr;
    }

    /**
     * 通用格式化字符串
     * @example
     * BPString.formatAll("name is ${name}, age is ${age}", "tinker", 28);
     * BPString.formatAll("name is ${name}, age is ${age}", {name: "tinker", age: 28});
     */
    public static formatAll(inStr: string, ...args: [Record<string, string | number>] | Array<string | number>) {
        let outStr = inStr;

        if (args.length == 1 && BPType.isObject(args[0])) {
            const obj = args[0] as Record<string, string | number>;
            for (let key in obj) {
                let keyStr = `\\$` + `{${key}}`
                let reg = new RegExp(keyStr, "g");
                outStr = outStr.replace(reg, `${obj[key]}`);
            }
        } else {
            args.forEach((val: any) => {
                outStr = outStr.replace(/\$\{.*?\}/g, `${val}`);
            });
        }

        return outStr;
    }

    /**
     * 通用格式化时间
     * @param timeStamp 时间戳(秒)
     * @param format 格式字符串
     * @example 
     * BPString.formatTime(3601);
     * BPString.formatTime(3601, "${hh}/${mm}/${ss}");
     * BPString.formatTime(86400 + 3601, "${dd}天 ${hh}小时-${mm}分-${ss}秒");
     */
    public static formatTime(timeStamp: number, format: string = "${hh}:${mm}:${ss}"): string {
        const isNegative = timeStamp < 0;

        let seconds: number = Math.floor(Math.abs(timeStamp));
        let minutes: number = Math.floor(seconds / 60);
        let hours: number = Math.floor(seconds / 3600);
        let days: number = Math.floor(seconds / 86400);

        let out = "";
        let level = 0b0000; //dhms
        if (/\$\{d+\}/.test(format)) {
            level |= (1 << 3);
        }

        if (/\$\{h+\}/.test(format)) {
            level |= (1 << 2);
            level & (1 << 3) && (hours %= 24);
        }

        if (/\$\{m+\}/.test(format)) {
            level |= (1 << 1);
            level & (1 << 2) && (minutes %= 60);
        }

        if (/\$\{s+\}/.test(format)) {
            level |= 1;
            level & (1 << 1) && (seconds %= 60);
        }

        // 没对应格式直接返回...
        if (level == 0) {
            return "" + timeStamp;
        }

        let _preZero = function (value: number, divisor: number = 10) {
            return value < divisor ? "0" + value : "" + value;
        }

        let valueObj = {
            dd: _preZero(days),
            d: `${days}`,
            hh: _preZero(hours),
            h: `${hours}`,
            mm: _preZero(minutes),
            m: `${minutes}`,
            ss: _preZero(seconds),
            s: `${seconds}`
        };

        out = BPString.format(format, valueObj);
        return isNegative ? "-" + out : out;
    }

    /**
     *  处理毫秒
     */
    public static formatTimeMilli(timeStamp: number, format: string = "${hh}:${mm}:${ss}"): string {
        return BPString.formatTime(timeStamp / 1000, format);
    }

    /**
     * 日期通用格式化
     * @param timestamp Date对象或Date时间戳
     * @param format 格式化字符串
     * @example
     */
    public static formatDate(timestamp: number, format: string = "${YYYY}-${MM}-${dd} ${hh}:${mm}:${ss}"): string {
        let date = new Date(timestamp);

        let year = date.getFullYear();
        let month = date.getMonth() + 1;
        let days = date.getDate();
        let hours = date.getHours();
        let minutes = date.getMinutes();
        let seconds = date.getSeconds();

        let _preZero = function (value: number, divisor: number = 10) {
            return value < divisor ? "0" + value : "" + value;
        }

        let valueObj = {
            YYYY: `${year}`,
            YY: _preZero(year % 100),
            MM: _preZero(month),
            M: `${month}`,
            dd: _preZero(days),
            d: `${days}`,
            hh: _preZero(hours),
            h: `${hours}`,
            mm: _preZero(minutes),
            m: `${minutes}`,
            ss: _preZero(seconds),
            s: `${seconds}`
        }

        let out = this.format(format, valueObj);
        return out;
    }

    /**
     * @description 将普通文本编码为UTF-8格式文本
     * @param str 
     */
    public static encodeUtf8(str: string) {
        str = str.replace(/\r\n/g, "\n");
        let utf8 = '';

        for (let i = 0; i < str.length; i++) {
            const c = str.charCodeAt(i);

            if (c < 128) {
                utf8 += String.fromCharCode(c);
            } else if ((c > 127) && (c < 2048)) {
                utf8 += String.fromCharCode((c >> 6) | 192);
                utf8 += String.fromCharCode((c & 63) | 128);
            } else {
                utf8 += String.fromCharCode((c >> 12) | 224);
                utf8 += String.fromCharCode(((c >> 6) & 63) | 128);
                utf8 += String.fromCharCode((c & 63) | 128);
            }
        }

        return utf8;
    }

    /**
     * @description 将UTF-8格式文本解码为普通文本
     * @param utf8 
     */
    public static decodeUtf8(utf8: string) {
        let str = '';
        let i = 0;
        let c1 = 0, c2 = 0, c3 = 0;

        while (i < utf8.length) {
            c1 = utf8.charCodeAt(i);

            if (c1 < 128) {
                str += String.fromCharCode(c1);
                i++;
            } else if ((c1 > 191) && (c1 < 224)) {
                c2 = utf8.charCodeAt(i + 1);
                str += String.fromCharCode(((c1 & 31) << 6) | (c2 & 63));
                i += 2;
            } else {
                c2 = utf8.charCodeAt(i + 1);
                c3 = utf8.charCodeAt(i + 2);
                str += String.fromCharCode(((c1 & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                i += 3;
            }
        }

        return str;
    }

    public static encodeUtf8Bytes(str: string): Uint8Array {
        const utf8 = [];
        for (let i = 0; i < str.length; i++) {
            let charcode = str.charCodeAt(i);
            if (charcode < 0x80) utf8.push(charcode);
            else if (charcode < 0x800) {
                utf8.push(0xc0 | (charcode >> 6),
                    0x80 | (charcode & 0x3f));
            } else if (charcode < 0xd800 || charcode >= 0xe000) {
                utf8.push(0xe0 | (charcode >> 12),
                    0x80 | ((charcode >> 6) & 0x3f),
                    0x80 | (charcode & 0x3f));
            } else {
                i++;
                charcode = 0x10000 + (((charcode & 0x3ff) << 10)
                    | (str.charCodeAt(i) & 0x3ff));
                utf8.push(0xf0 | (charcode >> 18),
                    0x80 | ((charcode >> 12) & 0x3f),
                    0x80 | ((charcode >> 6) & 0x3f),
                    0x80 | (charcode & 0x3f));
            }
        }
        return new Uint8Array(utf8);
    }

    public static decodeUtf8Bytes(bytes: Uint8Array): string {
        let str = '';
        let i = 0;
        while (i < bytes.length) {
            const byte1 = bytes[i++];

            // 1字节序列 (0xxxxxxx)
            if ((byte1 & 0x80) === 0) {
                str += String.fromCharCode(byte1);
            }
            // 2字节序列 (110xxxxx 10xxxxxx)
            else if ((byte1 & 0xe0) === 0xc0) {
                const byte2 = bytes[i++] & 0x3f;
                const codePoint = ((byte1 & 0x1f) << 6) | byte2;
                str += String.fromCharCode(codePoint);
            }
            // 3字节序列 (1110xxxx 10xxxxxx 10xxxxxx)
            else if ((byte1 & 0xf0) === 0xe0) {
                const byte2 = bytes[i++] & 0x3f;
                const byte3 = bytes[i++] & 0x3f;
                const codePoint = ((byte1 & 0x0f) << 12) | (byte2 << 6) | byte3;
                str += String.fromCharCode(codePoint);
            }
            // 4字节序列 (11110xxx 10xxxxxx 10xxxxxx 10xxxxxx) - 代理对
            else if ((byte1 & 0xf8) === 0xf0) {
                const byte2 = bytes[i++] & 0x3f;
                const byte3 = bytes[i++] & 0x3f;
                const byte4 = bytes[i++] & 0x3f;
                const codePoint = ((byte1 & 0x07) << 18) | (byte2 << 12) | (byte3 << 6) | byte4;

                // 转换为代理对
                str += String.fromCharCode(
                    0xd800 + ((codePoint - 0x10000) >> 10),
                    0xdc00 + ((codePoint - 0x10000) & 0x3ff)
                );
            }
        }
        return str;
    }

    public static formatNumber(num: number | string, degree: number = 2, threshold?: number, useTail = false) {
        if (typeof num === "string") {
            num = parseInt(num);
        }

        const absNum = Math.abs(num);
        if (threshold && absNum < 10 ** threshold) {
            return num;
        }

        // 1兆 1亿，10万
        const units = ["math.z", "math.y", "math.w"];
        const unitThresholds = [12, 8, 4];
        for (let i = 0; i < unitThresholds.length; i++) {
            if (absNum >= 10 ** unitThresholds[i]) {
                const uv = 10 ** unitThresholds[i];
                const fixed = 10 ** degree;
                const fixedNum = Math.floor(absNum * fixed / uv) / fixed;
                const tail = useTail && (absNum > fixedNum * uv) ? "+" : "";
                const numStr = (num < 0 ? "-" : "") + fixedNum + BPLang.getInstance().getText(units[i]) + tail;
                return numStr;
            }
        }

        return num || 0;
    }

    public static byteLen(str: string): number {
        let byteLen = 0;
        const len = str.length;
        for (let i = 0; i < len; ++i) {
            const charCode = str.charCodeAt(i);
            if (charCode <= 0x7F) {
                byteLen += 1
            } else if (charCode <= 0x7FF) {
                byteLen += 2
            } else if (charCode <= 0x7FFF) {
                byteLen += 3
            } else {
                byteLen += 4
            }
        }
        return byteLen;
    }
}