import { BPLog } from "../../util/BPLog";
import { BPMath } from "../../util/BPMath";
import { BPDecorator as BPDec } from "../../util/BPDecorator";
import { BPComponentBase } from "../BPComponentBase";
import { BPTrackBase } from "./BPTrackBase";
import { BPTrackEllipse } from "./BPTrackEllipse";
import { BPTrackLine } from "./BPTrackLine";
import { BPTrackEllipseEx } from "./BPTrackEllipseEx";

const TouchMoveThreshold: number = 1;
const TouchFinishThreshold: number = 5;
const CancelInnerEventsThreshold: number = 7; // 取消内部事件的移动距离阈值

/**
 * 轨迹类型
 */
enum TrackType {
    /**水平线点阵 */
    HorizontalLine = 0,

    /**椭圆均匀角度点阵 */
    Ellipse = 1,

    /**椭圆均匀弧长点阵 */
    EllipseEx = 2,
    //...
}

/**
 * 拖拽方向
 */
enum DragDirectionType {
    Horizontal = 0,
    Vertical = 1,
}

/**
 * 
 */
@BPDec.ccclass
@BPDec.disallowMultiple
@BPDec.executeInEditMode
@BPDec.menu("BPComponents/BPLoop")
export class BPLoop extends BPComponentBase {
    /** 
     * 
     */
    @BPDec.property({ type: cc.Enum(TrackType) })
    private _trackType: TrackType = TrackType.Ellipse;

    @BPDec.property({ type: cc.Enum(DragDirectionType), displayName: "拖拽方向" })
    public dragDirectionType: DragDirectionType = DragDirectionType.Horizontal;

    @BPDec.property({ type: cc.Enum(cc.Float), displayName: "拖拽速率" })
    public moveSpeed = 1;

    /**
     * !#en If cancelInnerEvents is set to true, the scroll behavior will cancel touch events on inner content nodes
     * It's set to true by default.
     * !#zh 如果这个属性被设置为 true，那么滚动行为会取消子节点上注册的触摸事件，默认被设置为 true。
     * 注意，子节点上的 touchstart 事件仍然会触发，触点移动距离非常短的情况下 touchmove 和 touchend 也不会受影响。
     * @property {Boolean} cancelInnerEvents
     */
    @BPDec.property({ displayName: "取消内部事件", tooltip: CC_DEV && "如果这个属性被设置为 true，那么滚动行为会取消子节点上注册的触摸事件" })
    public cancelInnerEvents: boolean = true;

    @BPDec.property({ type: cc.Enum(TrackType), tooltip: CC_DEV && "分布轨迹" })
    public get trackType(): TrackType { return this._trackType; }
    private set trackType(type: TrackType) {
        if (type == this._trackType) {
            return;
        }

        this._trackType = type;

        // 轨迹实现
        if (this._trackType == TrackType.Ellipse) {
            this.trackImp = new BPTrackEllipse();
        }
        else if (this._trackType == TrackType.HorizontalLine) {
            this.trackImp = new BPTrackLine();
        }
        else if (this._trackType == TrackType.EllipseEx) {
            this.trackImp = new BPTrackEllipseEx();
        }
    }

    /** 
     * 
     */
    @BPDec.property({ type: BPTrackBase })
    private _trackImp: BPTrackBase = new BPTrackEllipse();

    @BPDec.property({ type: BPTrackBase })
    public get trackImp(): BPTrackBase { return this._trackImp; }
    private set trackImp(obj: BPTrackBase) {
        this._trackImp = obj;
    }

    /** 
     * 
     */
    private _content: cc.Node = null;
    private _isAtInertia: boolean = false;
    private _touchMoved: boolean = false; // 添加触摸移动标记

    /** 
     * 
     */
    public get curValue(): number { return this._curValue; }
    protected _curValue: number = 0;
    protected _tarValue: number = 0;

    protected _interval: number = 0;
    protected _stride: number = 0;
    protected _speed: number = 100;

    protected _moveDelta: number = 0;
    protected _cells: Array<cc.Node> = [];


    /** 
     * 
     */
    public locateToIndex(index: number, origin: number = 0): void {
        let delta = origin - index * this._stride;
        this._tarValue = BPMath.mod(delta, this._interval);
        this._isAtInertia = true;
    }

    /** 
     * 
     */
    protected override onLoad(): void {
        this._content = this.node.getChildByName("content");
        if (this._content == null) {
            BPLog.error("BPLoopListView no content...");
            return;
        }

        this._interval = this._trackImp.getInterval();
        let divide = this._content.childrenCount;
        this._stride = this._interval / divide;

        this._cacheChildren();
        this._registerTouchEnvents();
        this._updateCellsPos();
    }

    /** 
     * 
     */
    protected override update(dt: number): void {
        if (this._isAtInertia == false) {
            return;
        }

        if (this._tarValue == this._curValue) {
            this._isAtInertia = false;
            return;
        }

        let delta = this._tarValue - this._curValue;
        let sign = Math.sign(delta);

        let curValue = this._curValue;
        let toBeValue = this._curValue;
        toBeValue = toBeValue + dt * this._speed * sign;

        // 结束条件
        if ((curValue < this._tarValue && toBeValue > this._tarValue)
            || (curValue > this._tarValue && toBeValue < this._tarValue)) {

            toBeValue = this._tarValue;
            this._isAtInertia = false;
        }

        this._updateCurValue(toBeValue);
    }

    /**
     * 
     */
    private _updateCurValue(value: number) {
        this._curValue = value;
        this._updateCellsPos();
    }

    /**
     * 
     */
    public updateCurValue(value: number) {
        this._updateCurValue(value);
    }

    /**
     * 
     */
    private _cacheChildren() {
        // 操作_cells比操作children安全
        for (let i = 0; i < this._content.children.length; i++) {
            this._cells.push(this._content.children[i]);
        }
    }

    /** 
     * 
     */
    private _registerTouchEnvents() {
        this.node.on(cc.Node.EventType.TOUCH_START, this._cellTouchStart, this, true);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this._cellTouchMove, this, true);
        this.node.on(cc.Node.EventType.TOUCH_END, this._cellTouchFinish, this, true);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this._cellTouchFinish, this, true);
    }

    /** 
     * 
     */
    private _cellTouchStart(event: cc.Event.EventTouch) {
        this._touchMoved = false;
        this._stopPropagationIfTargetIsMe(event);
    }

    /** 
     * 
     */
    private _cellTouchMove(event: cc.Event.EventTouch) {
        this._stopInertia();

        let dx = 0;
        if (this.dragDirectionType == DragDirectionType.Horizontal) {
            dx = event.touch.getDelta().x;
        }
        else {
            dx = -event.touch.getDelta().y;
        }
        dx = dx * this.moveSpeed;
        let absDx = Math.abs(dx);
        if (absDx < TouchMoveThreshold) {
            return;
        }

        this._moveDelta = dx;
        this._updateCurValue(this._curValue + dx);

        // 实现cancelInnerEvents机制
        if (this.cancelInnerEvents) {
            let deltaMove = event.touch.getLocation().sub(event.touch.getStartLocation());
            if (deltaMove.mag() > CancelInnerEventsThreshold) {
                if (!this._touchMoved && event.target !== this.node) {
                    // 模拟触摸取消事件给目标节点
                    let cancelEvent = new cc.Event.EventTouch(event.getTouches(), event.bubbles);
                    cancelEvent.type = cc.Node.EventType.TOUCH_CANCEL;
                    cancelEvent.touch = event.touch;
                    (cancelEvent as any).simulate = true;
                    event.target.dispatchEvent(cancelEvent);
                    this._touchMoved = true;
                }
            }
        }

        this._stopPropagationIfTargetIsMe(event);
    }

    /** 
     * 
     */
    private _cellTouchFinish(event: cc.Event.EventTouch) {
        // 过滤掉自己发送的模拟取消事件
        if ((event as any).simulate) {
            this._stopPropagationIfTargetIsMe(event);
            return;
        }

        let absDx = Math.abs(this._moveDelta);
        if (absDx < TouchFinishThreshold) {
            return;
        }

        this._startInertia();
        this._moveDelta = 0;

        if (this._touchMoved) {
            event.stopPropagation();
        } else {
            this._stopPropagationIfTargetIsMe(event);
        }
    }

    /**
     * 停止事件传播如果目标是当前节点
     */
    private _stopPropagationIfTargetIsMe(event: cc.Event.EventTouch) {
        if (event.eventPhase === cc.Event.AT_TARGET && event.target === this.node) {
            event.stopPropagation();
        }
    }

    /** 
     * 
     */
    private _updateCellsPos(): void {
        for (let i = 0; i < this._cells.length; ++i) {
            let child = this._cells[i];
            let value = this._curValue + i * this._stride;
            let pos = this._trackImp.getPoint(value);
            child.setPosition(pos);
            let scale = this.trackImp.getScale(pos);
            child.setScale(scale);
            this._trackImp.onAfterUpdatePos(child);
        }
    }

    /** 
     *  开始惯性移动
     */
    private _startInertia() {
        this._isAtInertia = true;

        let modValue = BPMath.mod(this._curValue, this._interval);
        this._updateCurValue(modValue);
        this._tarValue = this._curValue + this._moveDelta * 5;
    }

    /** 
     *  停止惯性移动
     */
    public stopInertia() {
        this._stopInertia();
    }
    private _stopInertia() {
        if (this._isAtInertia == false) {
            return;
        }

        this._tarValue = this._curValue;
    }
}
