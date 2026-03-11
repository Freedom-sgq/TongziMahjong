import { BPDecorator } from "../../util/BPDecorator";
import { BPModule, bp } from "BPEngine";

const BPDec = BPDecorator;
/**
 * 
 */
@BPDec.ccclass
@BPDec.inspector("packages://bp-engine/editor/inspectors/button.js")
@BPDec.menu("BPComponents/BPButton")
export class BPButton extends cc.Button {
    @BPDec.property({
        tooltip: CC_DEV && "音效"
    })
    public audioClickKey: string = "";

    @BPDec.property({
        tooltip: "按钮延迟响应时间"
    })
    interactiveInterval: number = 0.1;

    /**
     * 
     */
    private _nextStamp: number = 0;

    /**
     * 
     */
    protected _onTouchEnded(event) {
        const now = Date.now();
        if (this._nextStamp && this._nextStamp > now) {
            // @ts-ignore
            this._onTouchCancel(event);
            return;
        }
        this._nextStamp = now + this.interactiveInterval * 1000;
        //@ts-ignore
        super._onTouchEnded(event);

        if (this.audioClickKey) {
            const path = "App:Audio/Effect/" + this.audioClickKey;
            bp.audio.playEffect(path, 1);
        }
    }
}