import { BPDecorator as BPDec } from "../../util/BPDecorator";
import { BPTrackBase } from "./BPTrackBase";

/**
 * @author Tinker
 * @date
 * @description
 */
@BPDec.ccclass("BPTrackEllipseEx")
export class BPTrackEllipseEx extends BPTrackBase {
    @BPDec.property({ tooltip: CC_DEV && "长轴" })
    public axisA = 0;

    @BPDec.property({ tooltip: CC_DEV && "短轴" })
    public axisB = 0;

    @BPDec.property({ tooltip: CC_DEV && "最小缩放" })
    public scaleMin = 0.5;

    @BPDec.property({ tooltip: CC_DEV && "轨迹旋转角度" })
    public rotAngle = 0;

    @BPDec.property({ tooltip: CC_DEV && "初始角度" })
    public initAngle = 90;

    protected _interval: number = 360;

    // 预计算弧长查找表相关缓存
    private _arcTable: number[] | null = null; // 累积弧长表，长度为采样点数
    private _angleTable: number[] | null = null; // 与弧长对应的参数 t（0..2π）表
    private _totalArcLength: number = 0; // 总弧长
    private _cacheA: number = -1;
    private _cacheB: number = -1;

    /**
     * 构建或刷新椭圆弧长查表（参数化：x=a cos t, y=b sin t, t∈[0,2π]）
     */
    private _buildArcTable(): void {
        const a = this.axisA;
        const b = this.axisB;
        if (a <= 0 || b <= 0) {
            this._arcTable = [0];
            this._angleTable = [0];
            this._totalArcLength = 0;
            this._cacheA = a;
            this._cacheB = b;
            return;
        }

        // 若轴未变化且表已存在，跳过重建
        if (this._arcTable && this._angleTable && this._cacheA === a && this._cacheB === b && this._totalArcLength > 0) {
            return;
        }

        const samples = 2048; // 采样数，越大越精细
        const arcTable: number[] = new Array(samples + 1);
        const angleTable: number[] = new Array(samples + 1);

        let cumulative = 0;
        arcTable[0] = 0;
        angleTable[0] = 0;

        // 弧长微分：ds = sqrt((dx/dt)^2 + (dy/dt)^2) dt = sqrt(a^2 sin^2 t + b^2 cos^2 t) dt
        for (let i = 1; i <= samples; i++) {
            const tPrev = (Math.PI * 2) * (i - 1) / samples;
            const tCurr = (Math.PI * 2) * i / samples;
            // 使用中点近似提高精度
            const tMid = (tPrev + tCurr) * 0.5;
            const ds = Math.sqrt(a * a * Math.sin(tMid) * Math.sin(tMid) + b * b * Math.cos(tMid) * Math.cos(tMid)) * (tCurr - tPrev);
            cumulative += ds;
            arcTable[i] = cumulative;
            angleTable[i] = tCurr;
        }

        this._arcTable = arcTable;
        this._angleTable = angleTable;
        this._totalArcLength = cumulative;
        this._cacheA = a;
        this._cacheB = b;
    }

    /**
     * 	椭圆方程
     */
    public getPoint(value: number): cc.Vec2 {
        // 将输入值视为弧长比例（而非角度），按总弧长平均分布
        this._buildArcTable();
        const a = this.axisA;
        const b = this.axisB;
        if (a <= 0 || b <= 0 || !this._arcTable || !this._angleTable || this._totalArcLength <= 0) {
            return cc.v2(0, 0);
        }

        let cull = this._cullValue(value + this.initAngle);
        if (cull < 0) {
            cull = cull + this._interval;
        }
        const ratio = cull / this._interval; // [0,1)
        const targetS = ratio * this._totalArcLength;

        // 二分查找 targetS 所在的区间
        const arcTable = this._arcTable;
        const angleTable = this._angleTable;
        let left = 0;
        let right = arcTable.length - 1;
        while (left < right) {
            const mid = (left + right) >> 1;
            if (arcTable[mid] < targetS) {
                left = mid + 1;
            } else {
                right = mid;
            }
        }

        const idx = Math.max(1, left);
        const s1 = arcTable[idx - 1];
        const s2 = arcTable[idx];
        const t1 = angleTable[idx - 1];
        const t2 = angleTable[idx];
        const span = s2 - s1 > 0 ? s2 - s1 : 1e-6;
        const alpha = (targetS - s1) / span;
        const t = t1 + (t2 - t1) * alpha;

        const x = a * Math.cos(t);
        const y = b * Math.sin(t);

        // 按 rotAngle 旋转
        const rad = cc.misc.degreesToRadians(this.rotAngle || 0);
        const cosR = Math.cos(rad);
        const sinR = Math.sin(rad);
        const xr = x * cosR - y * sinR;
        const yr = x * sinR + y * cosR;
        return cc.v2(xr, yr);
    }

    getScale(pos: cc.Vec2): number {
        const b = this.axisB;
        if (b <= 0) {
            return 1;
        }
        // 线性映射：y∈[-b, b] -> norm∈[0, 1]，顶点 y=b 为 1
        const clampedY = Math.max(-b, Math.min(b, pos.y));
        const norm = (clampedY + b) / (2 * b);
        const sMin = Math.max(0, Math.min(1, this.scaleMin));
        const scale = sMin + norm * (1 - sMin);
        return Math.max(sMin, Math.min(1, scale));
    }

    /**
     * 
     */
    onAfterUpdatePos(cell: cc.Node): void {
        cell.zIndex = -cell.y;
    }

}