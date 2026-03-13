import * as cc from 'cc';
import { BPMath } from "../../util/BPMath";
import { BPDecorator as BPDec } from "../../util/BPDecorator";
import { BPComponentBase } from "../BPComponentBase";

enum DragType {
    /**跟随 */
    follow,

    /**虚影 */
    ghost,
}

export interface BPTouchElements {
    ghostNode: cc.Node,
    followNode: cc.Node,
    scrollView: cc.ScrollView,
}

/**
 * @author Tinker
 * @date
 * @description 支持拖拽，长按
 */
@BPDec.ccclass
@BPDec.disallowMultiple
export class BPTouch extends BPComponentBase {
    /**OnHold 是个连续推送的事件 hold模式*/
    public static readonly OnHolding = "OnHold";

    /**触摸开始监听 Drag模式 */
    public static readonly OnDragStart = "OnDragStart";
    /**拖拽中监听  Drag模式*/
    public static readonly OnDragging = "OnDragging";
    /**拖拽结束  Drag模式*/
    public static readonly OnDragFinish = "OnDragFinish";

    @BPDec.property
    useDrag: boolean = false;

    @BPDec.property
    useHold: boolean = false;

    @BPDec.property({ type: cc.Enum(DragType), visible() { return this.useDrag == true; } })
    dragType: DragType = DragType.follow;

    @BPDec.property({ visible() { return this.useDrag == true; } })
    disableScrollWhileDragging: boolean = true;

    /** 
     * 
     */
    private _holdWeight = 0;
    private _isHolding = false;
    private _isDragged = false;

    private _touchElements: BPTouchElements = {
        ghostNode: null,
        followNode: null,
        scrollView: null,
    }

    /** 
     * 
     */
    protected override onLoad(): void {
        this.node.on(cc.Node.EventType.TOUCH_START, this._onTouchStart, this, true);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this._onTouchMove, this, true);
        this.node.on(cc.Node.EventType.TOUCH_END, this._onTouchEnd, this, true);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this._onTouchCancel, this, true);
    }

    /** 
     * 
     */
    private _onTouchStart(event: cc.EventTouch): boolean {
        this._onDragStart(event);
        this._onHoldStart(event);
        return true;
    }

    /**
     * 
     */
    private _tryEnableParentScrollView(enable: boolean) {
        if (!this.disableScrollWhileDragging) {
            return;
        }

        let scrollView = this._touchElements.scrollView;
        if (scrollView == null) {
            // 没有就向上找3层
            let count = 0;
            let node = this.node;
            while (!scrollView) {
                count = count + 1;
                node = node.getParent();
                if (count > 3 || !node) return;
                scrollView = node.getComponent(cc.ScrollView)
            }
        }

        if (scrollView) {
            this._touchElements.scrollView = scrollView;
            scrollView.enabled = enable;
        }
    }

    /** 
     * 
     */
    private _onDragStart(event: cc.EventTouch) {
        if (this.useDrag == false) { return; }
    }

    /** 
     * 
     */
    private _onHoldStart(event: cc.EventTouch) {
        if (this.useHold == false) { return; }

        if (this._isHolding == true) { return; }

        let location = event.getLocation();
        this._isHolding = this.node.getComponent(cc.UITransform).getBoundingBoxToWorld().contains(location);
        if (this._isHolding == false) { return; }

        this.schedule(this._tickHold, 0.3);
    }

    /** 
     * 
     */
    private _onTouchMove(event: cc.EventTouch): void {
        this._onHoldMove(event);
        this._onDragMove(event);
    }

    /** 
     * 
     */
    private _onHoldMove(event: cc.EventTouch) {
        if (this.useHold == false) { return; }

        if (this._isHolding == false) { return; }

        let location = event.getLocation();
        let inside = BPMath.containPos(this.node, location);
        if (inside == false) {
            this._isHolding = false;
        }
    }

    /** 
     * 
     */
    private _onDragMove(event: cc.EventTouch) {
        if (this.useDrag == false) { return; }

        let delta = event.getDelta();
        if (this._isDragged == false && delta.length() > 0.1) {
            this._isDragged = true;

            this.node.emit(BPTouch.OnDragStart, this._touchElements);
            this.schedule(this._tickDrag, 0.3);

            this._tryEnableParentScrollView(false);

            if (this.dragType == DragType.ghost) {
                if (!this._touchElements.ghostNode) {
                    this._touchElements.ghostNode = cc.instantiate(this.node);
                }

                let UIOpacity = this._touchElements.ghostNode.getComponent(cc.UIOpacity) ? this._touchElements.ghostNode.getComponent(cc.UIOpacity) : this._touchElements.ghostNode.addComponent(cc.UIOpacity);
                UIOpacity.opacity = 150;
                this.node.parent.insertChild(this._touchElements.ghostNode, 10);
            }
            else if (this.dragType == DragType.follow) {
                if (!this._touchElements.followNode) {
                    this._touchElements.followNode = this.node;
                }
            }
        }

        let dragNode = null;
        if (this.dragType == DragType.ghost) {
            dragNode = this._touchElements.ghostNode;
        }
        else if (this.dragType == DragType.follow) {
            dragNode = this._touchElements.followNode;
        }

        if (dragNode) {
            let pre = dragNode.getPosition();
            let next = pre.add(delta);
            dragNode.setPosition(next);
        }
    }

    /** 
     * 
     */
    private _onTouchEnd(event: cc.EventTouch): void {
        this._onHoldFinish(event);
        this._onDragFinish(event);
    }

    /** 
     * 
     */
    private _onTouchCancel(event: cc.EventTouch): void {
        this._onHoldFinish(event);
        this._onDragFinish(event);
    }

    /** 
     * 
     */
    private _onHoldFinish(event?: cc.EventTouch): void {
        if (this.useHold == false) { return; }

        this._isHolding = false;
        this._tickHold();
    }

    /** 
     * 
     */
    private _onDragFinish(event: cc.EventTouch): void {
        if (this.useDrag == false) { return; }

        if (this._isDragged) {
            event.propagationImmediateStopped = true;
            this._isDragged = false;
            this._tryEnableParentScrollView(true);

            let location = event.getLocation();
            this.node.emit(BPTouch.OnDragFinish, location);

            this._tickDrag();
        }

        if (this.dragType == DragType.ghost) {
            this._touchElements.ghostNode?.destroy();
            this._touchElements.ghostNode = null;
        }
    }

    /** 
     * 
     */
    private _tickHold(): void {
        if (this._isHolding == true) {
            this._holdWeight = Math.ceil(this._holdWeight * 1.5 + 1);
            this.node.emit(BPTouch.OnHolding, this._holdWeight);
        }
        else {
            this._holdWeight = 0;
            this.unschedule(this._tickHold);
        }
    }
    /** 
     * 
     */
    private _tickDrag(): void {
        if (this._isDragged == true) {
            this.node.emit(BPTouch.OnDragging);
        }
        else {
            this.unschedule(this._tickDrag);
        }
    }
}