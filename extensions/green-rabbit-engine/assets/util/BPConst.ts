/**
 * 常用常量声明
 */

// 数学常量
const Numeric = {
    // 精度值
    Epsilon5: 1e-5,
    Epsilon6: 1e-6,

    // 最大值
    MaxInt: Number.MAX_SAFE_INTEGER,

    // 最大zIndex
    MaxZIndex: cc.macro.MAX_ZINDEX,
    UIMaxZIndex: cc.macro.MAX_ZINDEX - 10,
    // 最小zIndex
    MinZIndex: cc.macro.MIN_ZINDEX,
}

//
const Color = {

}

export const BPConst = Object.assign(Numeric, Color)


