/**
 * @author
 * @date
 * @description
 */
export class BPMath {

    /** 
     * 收紧函数，如果没传min max则默认收紧在[0, 1]之间
     * @param value 需要收紧的值
     * @param min 左边界
     * @param max 右边界
     */
    public static clamp(value: number, min?: number, max?: number): number {
        if (min != null && max != null) {
            return value < min ? min : value > max ? max : value;
        }

        return value < 0 ? 0 : value > 1 ? 1 : value
    }

    /** 
     * 周期裁剪
     * @param value 分布
     * @param interval 周期
     */
    public static mod(value: number, interval: number) {
        let out = value % interval;
        return out;
    }

    /**
     * 线性插值
     * @param s 起始值
     * @param e 目标值
     * @param r ratio 0-1
     * @param min 最小间隔值
     */
    public static lerp(s: number, e: number, r: number, min: number = 0): number {
        min = Math.abs(min);
        let c = e - s;
        let d = c * r;
        d = d < 0 ? Math.min(d, -min) : Math.max(d, min);
        if (Math.abs(d) > Math.abs(c)) {
            d = c;
        }
        return s + d;
    }

    /**
     * 获得自身坐标系下的包围盒
     * @param node 
     * @returns 
     */
    public static makeNodeRect(node: cc.Node): cc.Rect {
        let rect = cc.rect(
            -node.width * node.anchorX,
            -node.height * node.anchorY,
            node.width,
            node.height
        );

        return rect;
    }

    /**
     * 节点自身坐标系下的某点是否在节点内
     * @param node 
     * @param pos 世界坐标
     * @returns
     */
    public static containPos(node: cc.Node, pos: cc.Vec2): Boolean {
        let rect = BPMath.makeNodeRect(node);
        let inNodePos = node.convertToNodeSpaceAR(pos);
        return rect.contains(inNodePos);
    }

    /**
     * 快速幂
     * @param num 底数
     * @param p 幂,非负整数
     * @example
     * pow(2, 2); //4
     */
    public static pow(num: number, p: number) {
        if (!Number.isInteger(p)) {
            return num;
        }

        let out = 1;
        while (p > 0) {
            if (p & 1) { out = out * num; }
            num = num * num;
            p >>= 1;
        }

        return out;
    }

    /**
     *  获取当前节点某个锚点方位局部坐标
     *  若想获取当前节点【左下角】的局部坐标 anchorPos(node, cc.v2(0, 0))
     */
    public static anchorPos(node: cc.Node, anchor: cc.Vec2 = cc.v2(0, 0)) {
        let anchorPoint = node.getAnchorPoint();
        let contentSize = node.getContentSize();
    
        let x = (anchor.x - anchorPoint.x) * contentSize.width;
        let y = (anchor.y - anchorPoint.y) * contentSize.height;
        return cc.v2(x, y);
    }

    /**
     *  获取当前节点某个锚点方位的在父节点的坐标
     *  若想获取当前节点【左下角】在父节点的坐标 anchorPosParent(node, cc.v2(0, 0))
     */
    public static anchorPosParent(node: cc.Node, anchor: cc.Vec2 = cc.v2(0, 0)) {
        const pos = BPMath.anchorPos(node, anchor);
        const y = node.y + pos.y;
        const x = node.x + pos.x;
        return cc.v2(x, y);
    }

    /**
     * 将src下局部坐标转化到dst下的局部坐标
     */
    public static posInOtherNode(src: cc.Node, dst: cc.Node, pos: cc.Vec2 = cc.v2(0, 0)) {
        let wp = src.convertToWorldSpaceAR(pos);
        return dst.convertToNodeSpaceAR(wp);
    }

    /**
     *
     * @param min
     * @param max
     */
    public static random(min: number, max: number): number {
        if (max < min) {
            [min, max] = [max, min];
        }
        return Math.floor(min + Math.random() * (max - min + 1));
    }
}
