import { BPDecorator as BPDec } from "../../util/BPDecorator";
import { BPComponentBase } from "../BPComponentBase";

/**
 * @author Tinker
 * @date
 * @description 
 */
@BPDec.ccclass
@BPDec.menu("BPComponents/BPGradiantComponent")
@BPDec.executeInEditMode
export class BPGradiantComponent extends BPComponentBase {
    // 左下
    @BPDec.property
    private _leftBottom: cc.Color = cc.Color.WHITE;

    @BPDec.property()
    public get leftBottom(): cc.Color {
        return this._leftBottom;
    }

    public set leftBottom(inColor: cc.Color) {
        this._leftBottom = inColor;
        this.node['_renderFlag'] |= cc['RenderFlow'].FLAG_COLOR;
    }

    // 右下
    @BPDec.property
    private _rightBottom: cc.Color = cc.Color.WHITE;

    @BPDec.property()
    public get rightBottom(): cc.Color {
        return this._rightBottom;
    }

    public set rightBottom(inColor: cc.Color) {
        this._rightBottom = inColor;
        this.node['_renderFlag'] |= cc['RenderFlow'].FLAG_COLOR;
    }

    // 左上
    @BPDec.property
    private _leftTop: cc.Color = cc.Color.WHITE;

    @BPDec.property()
    public get leftTop(): cc.Color {
        return this._leftTop;
    }

    public set leftTop(inColor: cc.Color) {
        this._leftTop = inColor;
        this.node['_renderFlag'] |= cc['RenderFlow'].FLAG_COLOR;
    }

    // 右上
    @BPDec.property
    private _rightTop: cc.Color = cc.Color.WHITE;

    @BPDec.property()
    public get rightTop(): cc.Color {
        return this._rightTop;
    }

    public set rightTop(inColor: cc.Color) {
        this._rightTop = inColor;
        this.node['_renderFlag'] |= cc['RenderFlow'].FLAG_COLOR;
    }

    protected onPreload() {
        cc.director.once(cc.Director.EVENT_AFTER_DRAW, this._hackUpdateColor, this);
    }

    protected onDestroy() {
        cc.director.off(cc.Director.EVENT_AFTER_DRAW, this._hackUpdateColor, this);
    }

    private _hackUpdateColor(): void {
        const compRender = this.getComponent(cc.RenderComponent);
        if (!compRender) return;

        const _assembler = compRender['_assembler'];
        if (!(_assembler instanceof cc['Assembler2D'])) return;

        const updateColor = _assembler["updateColor"];
        if (updateColor) {
            const self = this;
            _assembler["updateColor"] = function (comp, color) {
                updateColor.call(this, comp, color);

                const uintVerts = this._renderData?.uintVDatas[0];
                if (!uintVerts) return;

                const floatsPerVert = this.floatsPerVert;
                const colorOffset = this.colorOffset;

                uintVerts[colorOffset] = ((uintVerts[colorOffset] & 0xff000000) >>> 0 | self.leftBottom['_val'] & 0x00ffffff) >>> 0;
                uintVerts[colorOffset + 1 * floatsPerVert] = ((uintVerts[colorOffset + 1 * floatsPerVert] & 0xff000000) >>> 0 | self.rightBottom['_val'] & 0x00ffffff) >>> 0;
                uintVerts[colorOffset + 2 * floatsPerVert] = ((uintVerts[colorOffset + 2 * floatsPerVert] & 0xff000000) >>> 0 | self.leftTop['_val'] & 0x00ffffff) >>> 0;
                uintVerts[colorOffset + 3 * floatsPerVert] = ((uintVerts[colorOffset + 3 * floatsPerVert] & 0xff000000) >>> 0 | self.rightTop['_val'] & 0x00ffffff) >>> 0;
            }
            this.node['_renderFlag'] |= cc['RenderFlow'].FLAG_COLOR;
        }
    }
}