
import * as cc from 'cc';

export class BPRandom {
    /**
     * 随机数生成器的种子 实际是取当前时间毫秒数
     */
    public static _seed: number = new Date().getTime();

    /**
     * @description 返回一个随机数，在0.0～1.0之间
     */
    public static value(): number {
        return BPRandom._range(0, 1);
    }

    /**
     * @description 返回一个在[0,max)之间的整数
     * @param max 
     */
    public static randInt(max: number): number {
        return Math.floor(BPRandom._range(0, max));
    }

    /**
     * @description 返回一个在[min,max)之间的整数
     * @param min 
     * @param max 
     */
    public static randIntBetween(min: number, max?: number) {
        return Math.floor(BPRandom._range(min, max));
    }

    /**
     * @description 返回一个在[0，max)之间的浮点数
     * @param max 最大数
     */
    public static randFloat(max: number): number {
        return BPRandom._range(0, max);
    }

    /**
     * @description 返回一个在[min,max)之间的浮点数
     * @param min 
     * @param max 
     */
    public static randFloatBetween(min: number, max?: number): number {
        return BPRandom._range(min, max);
    }

    /**
     * @description 随机字符串
     */
    public static randString(): string {
        return Math.random().toString(36).substring(2);
    }

    /**
     * @description 返回半径为1的圆内的一个随机点
     */
    public static insideUnitCircle(): cc.Vec2 {
        let randAngle: number = BPRandom._range(0, 360);
        let randDis: number = BPRandom._range(0, 1);
        let randX: number = randDis * Math.cos(randAngle * Math.PI / 180);
        let randY: number = randDis * Math.sin(randAngle * Math.PI / 180);
        return cc.v2(randX, randY);
    }

    /**
     * @description 返回半径为1的圆边的一个随机点
     */
    public static onUnitCircle(): cc.Vec2 {
        let randAngle: number = BPRandom._range(0, 360);
        let randX: number = Math.cos(randAngle * Math.PI / 180);
        let randY: number = Math.sin(randAngle * Math.PI / 180);
        return cc.v2(randX, randY);
    }

    /**
     * 返回一个在min和max之间的随机浮点数
     * Simple (bad) Psuedo Random Number Generator (Sic)
     * The low bit typically just toggles between calls.
     * random() {
     *    seed = ( seed * mulitiplier + increment ) % modulus;
     *    return seed;
     * }
     * Table of Good values
     *    Multiplier    Increment     Modulus
     *       25173         13849        65536
     *        9301         49297       233280
     */
    private static _range(min: number, max: number): number {
        min = min ?? 0;
        max = max ?? 1;

        this._seed = (this._seed * 9301 + 49297) % 233280;
        let rand = this._seed / 233280.0;
        return min + rand * (max - min);
    }

}