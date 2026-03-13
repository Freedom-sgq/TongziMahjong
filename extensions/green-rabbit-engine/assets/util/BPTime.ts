import * as cc from 'cc';
import { BPLog } from "./BPLog";

/**
 *  @description 时间相关类
 *  @author Tinker
 */
export class BPTime {
    // date 对象
    private static _date = new Date();

    // 客户端，游戏启动时间
    private static _lastClientTime = Date.now();
    // 服务器，游戏启动时间
    private static _lastServerTime = 0;
    // 时间差
    private static _deltaTime = 0;

    /**获取客户端服务器时间差 */
    public static get deltaTime(): number {
        return this._deltaTime;
    }

    /**
     * 启动的时候对齐一下时间
     */
    public static syncTime(serverTime: number) {
        if (!serverTime) {
            BPLog.error("为获取到服务器下发时间...")
            serverTime = Date.now();
        }

        this._lastServerTime = serverTime;
        this._lastClientTime = Date.now();

        // 此刻同步时的时间差
        this._deltaTime = this._lastServerTime - this._localTime();
    }

    /**
     * 本地时间参考..
     * 用于校准
     */
    private static _localTime() {
        return Math.floor(this._lastClientTime + cc.director.getTotalTime());
    }

    public static get lastClientTime(): number {
        return this._lastClientTime;
    }

    /**
     *  当前时间戳
     *  校准过的，单位ms
     */
    public static now(): number {
        return this._localTime() + this._deltaTime;
    }

    /**
     * 将毫秒转换为秒
     */
    public static ms2s(ms: number): number {
        return Math.floor((ms || 0) * 0.001);
    }

    /**
     * 将秒转换为毫秒
     */
    public static s2ms(s: number): number {
        return (s || 0) * 1000;
    }

    /**
     * 获取时间
     * @param timestamp 时间戳 (ms)
     * @returns 时间
     */
    public static getTime(timestamp?: number): { year: number, month: number, day: number, hour: number, minute: number, second: number } {
        this._date.setTime(timestamp || BPTime.now());
        return {
            year: this._date.getFullYear(),
            month: this._date.getMonth() + 1,
            day: this._date.getDate(),
            hour: this._date.getHours(),
            minute: this._date.getMinutes(),
            second: this._date.getSeconds()
        };
    }

    /**
     * 获取年份
     * @param timestamp 时间戳 (ms)
     * @returns 年份
     */
    public static getYear(timestamp?: number): number {
        this._date.setTime(timestamp || BPTime.now());
        return this._date.getFullYear();
    }

    /**
     * 获取月份
     * @param timestamp 时间戳 (ms)
     * @returns 月份
     */
    public static getMonth(timestamp?: number): number {
        this._date.setTime(timestamp || BPTime.now());
        return this._date.getMonth() + 1;
    }

    /**
     * 获取日期
     * @param timestamp 时间戳 (ms)
     * @returns 日期
     */
    public static getDay(timestamp?: number): number {
        this._date.setTime(timestamp || BPTime.now());
        return this._date.getDate();
    }

    /**
     * 获取小时
     * @param timestamp 时间戳 (ms)
     * @returns 小时
     */
    public static getHour(timestamp?: number): number {
        this._date.setTime(timestamp || BPTime.now());
        return this._date.getHours();
    }

    /**
     * 获取分钟
     * @param timestamp 时间戳 (ms)
     * @returns 分钟
     */
    public static getMinute(timestamp?: number): number {
        this._date.setTime(timestamp || BPTime.now());
        return this._date.getMinutes();
    }

    /**
     * 获取秒
     * @param timestamp 时间戳 (ms)
     * @returns 秒
     */
    public static getSecond(timestamp?: number): number {
        this._date.setTime(timestamp || BPTime.now());
        return this._date.getSeconds();
    }

    /**
     * 获取当天开始时间
     * @param timestamp 时间戳 (ms)
     * @returns 时间戳 (ms)
     */
    public static getDayStartTime(timestamp?: number): number {
        this._date.setTime(timestamp || BPTime.now());
        this._date.setHours(0, 0, 0, 0);
        return this._date.getTime();
    }

    /** 
     * 获取当天的结束时间
     * @param timestamp 时间戳 (ms)
     * @returns 时间戳 (ms)
     */
    public static getDayEndTime(timestamp?: number): number {
        return this.getDayStartTime(timestamp) + 86400000;
    }

    /**
     * 获取传入时间是周几
     * @param {number} [time] (ms)
     * @returns {number}
     */
    public static getWeekDay(time?: number): number {
        this._date.setTime(time || BPTime.now());
        return this._date.getDay() || 7;
    }

    /**
     * 获取当前周的开始时间
     * @param timestamp 时间戳 (ms)
     * @returns 时间戳 (ms)
     */
    public static getWeekStartTime(timestamp?: number): number {
        return this.getDayStartTime(timestamp) - (this.getWeekDay(timestamp) - 1) * 86400000;
    }

    public static getWeekEndTime(timestamp?: number): number {
        return this.getWeekStartTime(timestamp) + 86400000 * 7;
    }

    /**
     * 获取时间戳对应周的周几的开始结束时间
     * @param dayOfWeek 周几
     * @param timestamp 时间戳(ms)
     */
    public static getWeekDayTime(dayOfWeek: number, timestamp?: number) {
        let startTime = this.getWeekStartTime(timestamp) + (dayOfWeek - 1) * 86400000;
        let endTime = startTime + 86400000;
        return { startTime, endTime };
    }

    /**
     * 获取当前月开始时间
     * @param timestamp 时间戳 (ms)
     * @returns 时间戳 (ms)
     */
    public static getMonthStartTime(timestamp?: number): number {
        this._date.setTime(timestamp || BPTime.now());
        this._date.setDate(1);
        this._date.setHours(0, 0, 0, 0);
        return this._date.getTime();
    }

    /**
     * 获取当前月结束时间
     * @param timestamp 时间戳 (ms)
     * @returns 时间戳 (ms)
     */
    public static getMonthEndTime(timestamp?: number): number {
        this._date.setTime(timestamp || BPTime.now());
        this._date.setDate(1);
        this._date.setHours(0, 0, 0, 0);
        this._date.setMonth(this._date.getMonth() + 1);
        return this._date.getTime();
    }

    /**
     * 获取当前年份开始时间
     * @param timestamp 时间戳 (ms)
     * @returns 时间戳 (ms)
     */
    public static getYearStartTime(timestamp?: number): number {
        this._date.setTime(timestamp || BPTime.now());
        this._date.setMonth(0);
        this._date.setDate(1);
        this._date.setHours(0, 0, 0, 0);
        return this._date.getTime();
    }

    /**
     * 获取当前年份结束时间
     * @param timestamp 时间戳 (ms)
     * @returns 时间戳 (ms)
     */
    public static getYearEndTime(timestamp?: number): number {
        this._date.setTime(timestamp || BPTime.now());
        this._date.setMonth(0);
        this._date.setDate(1);
        this._date.setHours(0, 0, 0, 0);
        this._date.setFullYear(this._date.getFullYear() + 1);
        return this._date.getTime();
    }

    /**
     * 获取当前月的天数
     * @param timestamp 时间戳 (ms)
     * @returns 天数
     */
    public static getMonthDays(timestamp?: number): number {
        const monthEndTime = this.getMonthEndTime(timestamp);
        const monthStartTime = this.getMonthStartTime(timestamp);
        return Math.round((monthEndTime - monthStartTime) / 86400000);
    }

    /** 
     * 是否是同一天
     * @param timestamp1 时间戳1 (ms)
     * @param now 时间戳2 (ms) 如果不传，则和当前时间比较
     * @returns 是否是同一天
     */
    public static isSameDay(timestamp1: number, now?: number): boolean {
        now = now || BPTime.now();
        if (now - timestamp1 > 86400000) {
            return false;
        }
        return this.getDayStartTime(timestamp1) === this.getDayStartTime(now);
    }

    /** 
     * 是否是同一周
     * @param timestamp1 时间戳1 (ms)
     * @param now 时间戳2 (ms) 如果不传，则和当前时间比较
     * @returns 是否是同一周
     */
    public static isSameWeek(timestamp1: number, now?: number): boolean {
        now = now || BPTime.now();
        if (now - timestamp1 > 86400000 * 7) {
            return false;
        }
        return this.getWeekStartTime(timestamp1) === this.getWeekStartTime(now);
    }

    /** 
     * 是否是同一月
     * @param timestamp1 时间戳1 (ms)
     * @param now 时间戳2 (ms) 如果不传，则和当前时间比较
     * @returns 是否是同一月
     */
    public static isSameMonth(timestamp1: number, now?: number): boolean {
        now = now || BPTime.now();
        this._date.setTime(timestamp1);
        const month1 = this._date.getMonth();
        const year1 = this._date.getFullYear();
        this._date.setTime(now);
        const month2 = this._date.getMonth();
        const year2 = this._date.getFullYear();
        return month1 === month2 && year1 === year2;
    }

    /**
     * 是否是同一年
     * @param timestamp1 时间戳1 (ms)
     * @param now 时间戳2 (ms) 如果不传，则和当前时间比较
     * @returns 是否是同一年
     */
    public static isSameYear(timestamp1: number, now?: number): boolean {
        now = now || BPTime.now();
        // 直接比较年份，避免使用天数计算可能出现的边界错误
        this._date.setTime(timestamp1);
        const year1 = this._date.getFullYear();
        this._date.setTime(now);
        const year2 = this._date.getFullYear();
        return year1 === year2;
    }

    /**
     * 格式化时间 格式: xxxx-xx-xx HH:MM:SS
     * @param timestamp 时间戳 (ms)
     */
    public static formatTime(timestamp: number): string {
        this._date.setTime(timestamp);
        return `${this._date.getFullYear()}-${this._date.getMonth() + 1}-${this._date.getDate()} ${this._date.getHours()}:${this._date.getMinutes()}:${this._date.getSeconds()}`;
    }

    /**
     * 格式化时间 格式: xxxx年xx月xx日 HH:MM:SS
     * @param timestamp 时间戳 (ms)
     */
    public static formatTimeChinese(timestamp: number): string {
        this._date.setTime(timestamp);
        return `${this._date.getFullYear()}年${this._date.getMonth() + 1}月${this._date.getDate()}日 ${this._date.getHours()}:${this._date.getMinutes()}:${this._date.getSeconds()}`;
    }

    /**
     * 格式化时间 格式: xxxx-xx-xx hh:mm
     * @param timestamp 时间戳 (ms)
     */
    public static formatYMDHM(timestamp: number): string {
        this._date.setTime(timestamp);

        let hour = this._date.getHours();
        let minute = this._date.getMinutes();
        let hourStr = hour < 10 ? `0${hour}` : `${hour}`;
        let minuteStr = minute < 10 ? `0${minute}` : `${minute}`;
        return `${this._date.getFullYear()}-${this._date.getMonth() + 1}-${this._date.getDate()} ${hourStr}:${minuteStr}`;
    }

    /**
     * 格式化时间 格式: xxxx年xx月xx日 h时m分
     * @param timestamp 时间戳 (ms)
     */
    public static formatYMDHMChinese(timestamp: number): string {
        this._date.setTime(timestamp);
        return `${this._date.getFullYear()}年${this._date.getMonth() + 1}月${this._date.getDate()}日 ${this._date.getHours()}时${this._date.getMinutes()}分`;
    }

    /**
     * 格式化时间 格式: xxxx-xx-xx
     * @param timestamp 时间戳 (ms)
     */
    public static formatYMD(timestamp: number): string {
        this._date.setTime(timestamp);
        return `${this._date.getFullYear()}-${this._date.getMonth() + 1}-${this._date.getDate()}`;
    }

    /**
     * 格式化时间 格式: xxxx年xx月xx日
     * @param timestamp 时间戳 (ms)
     */
    public static formatYMDChinese(timestamp: number): string {
        this._date.setTime(timestamp);
        return `${this._date.getFullYear()}年${this._date.getMonth() + 1}月${this._date.getDate()}日`;
    }

    /**
     * 格式化时间 格式: xx-xx h:m:s
     * @param timestamp 时间戳 (ms)
     */
    public static formatMDHMS(timestamp: number): string {
        this._date.setTime(timestamp);
        return `${this._date.getMonth() + 1}-${this._date.getDate()} ${this._date.getHours()}:${this._date.getMinutes()}:${this._date.getSeconds()}`;
    }

    /**
     * 格式化时间 格式: xx月xx日 h时m分s秒
     * @param timestamp 时间戳 (ms)
     */
    public static formatMDHMSChinese(timestamp: number): string {
        this._date.setTime(timestamp);
        return `${this._date.getMonth() + 1}月${this._date.getDate()}日 ${this._date.getHours()}时${this._date.getMinutes()}分${this._date.getSeconds()}秒`;
    }

    /**
     * 格式化时间 格式: xx-xx
     * @param timestamp 时间戳 (ms)
     */
    public static formatMD(timestamp: number): string {
        this._date.setTime(timestamp);
        return `${this._date.getMonth() + 1}-${this._date.getDate()}`;
    }

    /**
     * 格式化时间 格式: xx月xx日
     * @param timestamp 时间戳 (ms)
     */
    public static formatMDChinese(timestamp: number): string {
        this._date.setTime(timestamp);
        return `${this._date.getMonth() + 1}月${this._date.getDate()}日`;
    }

    /**
     * 格式化时间 格式: hh:mm
     * @param timestamp 时间戳 (ms)
     */
    public static formatHM(timestamp: number): string {
        this._date.setTime(timestamp);
        return `${this._date.getHours()}:${this._date.getMinutes()}`;
    }

    /**
     * 格式化时间 格式: h时m分
     * @param timestamp 时间戳 (ms)
     */
    public static formatHMChinese(timestamp: number): string {
        this._date.setTime(timestamp);
        return `${this._date.getHours()}时${this._date.getMinutes()}分`;
    }

    /**
     * 格式化时间 格式: hh:mm:ss
     * @param timestamp 时间戳 (ms)
     */
    public static formatHMS(timestamp: number): string {
        this._date.setTime(timestamp);
        return `${this._date.getHours()}:${this._date.getMinutes()}:${this._date.getSeconds()}`;
    }

    /**
     * 格式化时间 格式: h时m分s秒
     * @param timestamp 时间戳 (ms)
     */
    public static formatHMSChinese(timestamp: number): string {
        this._date.setTime(timestamp);
        return `${this._date.getHours()}时${this._date.getMinutes()}分${this._date.getSeconds()}秒`;
    }

    /**
     * 智能格式化时间 格式 >1天(x天x小时x分x秒) >1小时(xx小时x分x秒) 1分钟(xx分x秒) 1秒(xx秒)
     * @param time 时间 (s)
     */
    public static formatSmart(time: number): string {
        const curTime = Math.floor(time < 0 ? 0 : time);
        const day = Math.floor(curTime / 86400);
        const hour = Math.floor((curTime % 86400) / 3600);
        const minute = Math.floor((curTime % 3600) / 60);
        const second = curTime % 60;
        if (day > 0) {
            return `${day}天${hour}小时${minute}分${second}秒`;
        } else if (hour > 0) {
            return `${hour}小时${minute}分${second}秒`;
        } else if (minute > 0) {
            return `${minute}分${second}秒`;
        } else {
            return `${second}秒`;
        }
    }

    /**
     * 智能格式化时间 格式 >1天(x天x小时) >1小时(xx小时xx分) 1分钟(xx分xx秒) 1秒(xx秒)
     * @param time 时间 (s)
     */
    public static formatSmartSimple(time: number): string {
        const curTime = Math.floor(time < 0 ? 0 : time);
        if (curTime > 86400) {
            const day = Math.floor(curTime / 86400);
            const hour = Math.floor((curTime % 86400) / 3600);
            return `${day}天${hour}小时`;
        } else if (curTime > 3600) {
            const hour = Math.floor(curTime / 3600);
            const minute = Math.floor((curTime % 3600) / 60);
            return `${hour}小时${minute}分`;
        } else if (curTime > 60) {
            const minute = Math.floor(curTime / 60);
            const second = Math.floor(curTime % 60);
            return `${minute}分${second}秒`;
        } else {
            return `${curTime}秒`;
        }
    }

    /**
     * 智能格式化时间 格式 >1天(x天) >1小时(xx小时) 1分钟(xx分) 1秒(xx秒)
     * @param time 时间 (s)
     */
    public static formatSmartSimple2(time: number): string {
        const curTime = Math.floor(time < 0 ? 0 : time);
        if (curTime > 86400) {
            const day = Math.floor(curTime / 86400);
            return `${day}天`;
        } else if (curTime > 3600) {
            const hour = Math.floor(curTime / 3600);
            return `${hour}小时`;
        } else if (curTime > 60) {
            const minute = Math.floor(curTime / 60);
            return `${minute}分`;
        } else {
            return `${curTime}秒`;
        }
    }

    /**
     * 格式化倒计时 格式: xx:xx:xx
     * @param time 时间 (s)
     */
    public static formatToHour(time: number): string {
        const curTime = time < 0 ? 0 : time;
        const timeNum = Math.floor(curTime);
        const hour = Math.floor(timeNum / 3600);
        const minute = Math.floor((timeNum % 3600) / 60);
        const seconds = timeNum % 60;
        const hourStr = hour < 10 ? `0${hour}` : `${hour}`;
        const minuteStr = minute < 10 ? `0${minute}` : `${minute}`;
        const secondsStr = seconds < 10 ? `0${seconds}` : `${seconds}`;
        return `${hourStr}:${minuteStr}:${secondsStr}`;
    }

    /**
     * 格式化倒计时 格式: x天 xx:xx:xx
     * @param time 时间 (s)
     */
    public static formatToHourWithDay(time: number): string {
        const curTime = time < 0 ? 0 : time;
        const timeNum = Math.floor(curTime);
        const day = Math.floor(curTime / 86400);
        const hour = Math.ceil((curTime % 86400) / 3600);
        const minute = Math.floor((timeNum % 3600) / 60);
        const seconds = timeNum % 60;
        const hourStr = hour < 10 ? `0${hour}` : `${hour}`;
        const minuteStr = minute < 10 ? `0${minute}` : `${minute}`;
        const secondsStr = seconds < 10 ? `0${seconds}` : `${seconds}`;

        if (day > 0) {
            return `${day}天 ${hourStr}:${minuteStr}:${secondsStr}`;
        }

        return `${hourStr}:${minuteStr}:${secondsStr}`;
    }

    /**
     * 格式化倒计时 格式: xx小时xx分xx秒
     * @param time 时间 (s)
     */
    public static formatToHourChinese(time: number): string {
        const curTime = time < 0 ? 0 : time;
        const timeNum = Math.floor(curTime);
        const hour = Math.floor(timeNum / 3600);
        const minute = Math.floor((timeNum % 3600) / 60);
        const seconds = timeNum % 60;
        return `${hour}小时${minute}分${seconds}秒`;
    }

    /**
     * 格式化倒计时 格式: xx:xx
     * @param time 时间 (s)
     */
    public static formatToMinute(time: number): string {
        const curTime = time < 0 ? 0 : time;
        const timeNum = Math.floor(curTime);
        const minute = Math.floor(timeNum / 60);
        const seconds = timeNum % 60;
        const minuteStr = minute < 10 ? `0${minute}` : `${minute}`;
        const secondsStr = seconds < 10 ? `0${seconds}` : `${seconds}`;
        return `${minuteStr}:${secondsStr}`;
    }

    /**
     * 格式化倒计时 格式: xx分xx秒
     * @param time 时间 (s)
     */
    public static formatToMinuteChinese(time: number): string {
        return this.formatToMinute(time).replace(/:/g, "分") + "秒";
    }
}