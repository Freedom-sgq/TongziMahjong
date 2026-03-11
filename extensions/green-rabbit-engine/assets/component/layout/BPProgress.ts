import { BPDecorator as BPDec } from "../../util/BPDecorator";
import { BPLog } from "../../util/BPLog";
import { BPComponentBase } from "../BPComponentBase";

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
@BPDec.menu("BPComponents/BPProgress")
export class BPProgress extends BPComponentBase {
    public static readonly OnCellProgressUpdate = "OnCellProgressUpdate";


    @BPDec.property({ type: cc.Enum(DragDirectionType), displayName: "拖拽方向" })
    public dragDirectionType: DragDirectionType = DragDirectionType.Horizontal;

    /**
     * 格子占比
     */
    @BPDec.property({ tooltip: CC_DEV && "格子占比" })
    public cellProgress = 0.1;

    /**
     * 修正偏移量
     */
    @BPDec.property({ tooltip: CC_DEV && "修正偏移量" })
    public fixedModel = 0;

    private _content: cc.Node = null;
    protected _cells: Array<cc.Node> = [];

    private _lastPosition: cc.Vec2 = null;

    private _progress = 0;

    private _currentTween: cc.Tween = null;

    protected override onLoad(): void {
        this._content = this.node.getChildByName("content");
        if (this._content == null) {
            BPLog.error("BPLoopListView no content...");
            return;
        }


        this._cacheChildren();
        this._registerTouchEnvents();
    }

    public getContent() {
        return this._content;
    }

    public resetCells() {
        this._cacheChildren();
    }

    public setCellOffset(count: number) {
        this._progress = -this.cellProgress * count;
        this._updateCells();
    }

    public getCellProgress(index: number) {
        return this._progress + index * this.cellProgress;
    }

    public getCellIndxByProgress(progress: number) {
        return Math.floor((progress - this._progress) / this.cellProgress);
    }

    private _cacheChildren() {
        // 操作_cells比操作children安全
        this._cells = [];
        for (let i = 0; i < this._content.children.length; i++) {
            this._cells.push(this._content.children[i]);
        }

        this._updateCells();
    }

    private _registerTouchEnvents() {
        this.node.on(cc.Node.EventType.TOUCH_START, this._cellTouchStart, this, true);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this._cellTouchMove, this, true);
        this.node.on(cc.Node.EventType.TOUCH_END, this._cellTouchFinish, this, true);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this._cellTouchFinish, this, true);
    }

    private _cellTouchStart(event: cc.Event.EventTouch) {
        this._lastPosition = event.touch.getLocation();
    }

    private _cellTouchMove(event: cc.Event.EventTouch) {
        let maxChange = this.cellProgress * (this._cells.length - 1);
        if (this.dragDirectionType == DragDirectionType.Horizontal) {
            let offsetX = event.touch.getLocation().x - this._lastPosition.x;
            this._progress += offsetX / this.node.width;
        } else if (this.dragDirectionType == DragDirectionType.Vertical) {
            let offsetY = event.touch.getLocation().y - this._lastPosition.y;
            this._progress += offsetY / this.node.height;
        }

        if (this._progress <= -maxChange) {
            this._progress = -maxChange;
        } else if (this._progress >= 0) {
            this._progress = 0;
        }

        this._lastPosition = event.touch.getLocation();
        this._updateCells();
    }

    private _cellTouchFinish(event: cc.Event.EventTouch) {
        this._lastPosition = null;

        if (this.fixedModel > 0) {
            let targetProgress = Math.round(this._progress / this.fixedModel) * this.fixedModel;
            this._startSmoothTransition(this._progress, targetProgress);
        }
    }

    private _startSmoothTransition(from: number, to: number) {
        // 停止上一次的 tween
        if (this._currentTween) {
            this._currentTween.stop();
        }

        this._currentTween = cc.tween(this)
            .to(0.25, { _progress: to }, { onUpdate: () => this._updateCells() })
        .start();
    }

    private _updateCells() {
        for (let i = 0; i < this._cells.length; ++i) {
            let child = this._cells[i];
            let progress = this._progress + i * this.cellProgress;
            this.node.emit(BPProgress.OnCellProgressUpdate, child, progress);
        }
    }
}
