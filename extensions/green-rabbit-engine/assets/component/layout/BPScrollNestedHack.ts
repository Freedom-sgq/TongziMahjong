import { BPDecorator as BPDec } from "../../util/BPDecorator";
import { BPComponentBase } from "../BPComponentBase";

enum MoveDirection {
    Horizontal = 0,
    Vertical = 1,
    Unknow = 99,
};

const DirectionToScrollOritation = {
    [MoveDirection.Horizontal]: "horizontal",
    [MoveDirection.Vertical]: "vertical",
}

/**
 * @author Tinker
 * @description 目前支持嵌套穿透拖动，给捕获阶段需要穿透父节点挂载即可...
 */
@BPDec.ccclass
@BPDec.disallowMultiple
export class BPScrollNestedHack extends BPComponentBase {

    private _ccScrollView: cc.ScrollView = null;
    private _moveDirection: MoveDirection = MoveDirection.Unknow;

    protected override onLoad(): void {
        this._ccScrollView = this.getComponent(cc.ScrollView);
        this._hackScrollViewProps();
    }

    private _hackScrollViewProps() {
        let hasNestedViewGroup = this._ccScrollView["hasNestedViewGroup"].bind(this._ccScrollView);
        //@ts-ignore
        this._ccScrollView["hasNestedViewGroup"] = (event: cc.Event.EventTouch, captureListeners: Array<cc.Node>): boolean => {
            if (this._moveDirection == MoveDirection.Unknow) {
                return false;
            }

            let ccScrollOritation = DirectionToScrollOritation[this._moveDirection];
            if (this._ccScrollView[ccScrollOritation] == true) {
                return false;
            }

            return hasNestedViewGroup(event, captureListeners);
        }

        //
        let _onTouchBegan = this._ccScrollView["_onTouchBegan"].bind(this._ccScrollView);
        this._ccScrollView["_onTouchBegan"] = (event: cc.Event.EventTouch, captureListeners: Array<cc.Node>) => {
            this._moveDirection = MoveDirection.Unknow;
            _onTouchBegan(event, captureListeners);
        }

        //
        let _onTouchMoved = this._ccScrollView["_onTouchMoved"].bind(this._ccScrollView);
        this._ccScrollView["_onTouchMoved"] = (event: cc.Event.EventTouch, captureListeners: Array<cc.Node>) => {
            let touch = event.touch;
            let delta_move = touch.getLocation().sub(touch.getStartLocation());
            if (delta_move.mag() < 15) {
                event.stopPropagation();
                return;
            }

            if (this._moveDirection == MoveDirection.Unknow) {
                const bHorizontal = Math.abs(delta_move.x) >= Math.abs(delta_move.y);
                this._moveDirection = bHorizontal ? MoveDirection.Horizontal : MoveDirection.Vertical;
            }

            _onTouchMoved(event, captureListeners);

            let ccScrollOritation = DirectionToScrollOritation[this._moveDirection];
            if (this._ccScrollView[ccScrollOritation] == true) {
                event.stopPropagation();
            }
        }

        //
        let _onTouchEnded = this._ccScrollView["_onTouchEnded"].bind(this._ccScrollView);
        this._ccScrollView["_onTouchEnded"] = (event: cc.Event.EventTouch, captureListeners: Array<cc.Node>) => {
            this._moveDirection = MoveDirection.Unknow;
            _onTouchEnded(event, captureListeners);
        }

        //
        let _onTouchCancelled = this._ccScrollView["_onTouchCancelled"];
        this._ccScrollView["_onTouchCancelled"] = (event: cc.Event.EventTouch, captureListeners: Array<cc.Node>) => {
            this._moveDirection = MoveDirection.Unknow;
            _onTouchCancelled(event, captureListeners);
        }
    }
}