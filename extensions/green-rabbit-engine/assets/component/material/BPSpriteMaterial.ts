import { BPDecorator as BPDec } from "../../util/BPDecorator";
import { BPMaterialBase } from "./BPMaterialBase";

/**
 * @description 
 * 1. ccc2.x版本不支持多pass, 利用RT机制可支持多次着色
 * 2. 处理uv统一化
 */
@BPDec.ccclass
export class BPSpriteMaterial extends BPMaterialBase {
    /**
     * sprite组件
     */
    protected _sprite: cc.Sprite = null;

    private _rtCamera: cc.Camera = null;
    private _rtPair: [cc.RenderTexture, cc.RenderTexture] = null;

    @BPDec.property({
        tooltip: CC_DEV && "循环RT的次数, 一次相当于两个pass"
    })
    public rtRenderCount: number = 0;


    /**
     * 构造uvRect(起点x, y， uv宽度，uv高度)
     */
    public static makeUVRect(sprite: cc.Sprite) {
        let rect = new cc.Vec4(0.0, 0.0, 1.0, 1.0);
        let rotated = 0.0;
        if (sprite && sprite.spriteFrame) {
            const uv = sprite.spriteFrame.uv;
            if (sprite.spriteFrame.isRotated()) {
                rotated = 1.0 
            }
            rect.x = uv[0];
            rect.y = uv[3];
            rect.z = uv[6] - uv[0];
            rect.w = uv[5] - uv[3];
        }
        return [rect, rotated];
    }


    /**
     * ....
     */
    protected onLoad(): void {
        super.onLoad();

        this._sprite = this.getComponent(cc.Sprite);
        this._updateUVRect();
        this._injectSpriteFrame();
    }

    /**
     * ....
     */
    protected start(): void {
        if (this.rtRenderCount < 1) {
            return;
        }

        this._initRTPair();
        this._renderRTPair(this.rtRenderCount);
    }


    /**
     * 向_calculateUV方法注入_updateUVRect方法
     */
    private _injectSpriteFrame(): void {
        let sprite = this._sprite;
        if (!sprite) {
            return;
        }

        let _updateUVRect = () => {
            this._updateUVRect.bind(this)();
        };

        sprite.spriteFrame = new Proxy(sprite.spriteFrame, {
            get(target, property) {
                if (property == "_calculateUV") {
                    return function (...args: any[]) {
                        target[property].bind(target)(args);
                        _updateUVRect();
                    }
                }

                return target[property];
            }
        });
    }

    /**
     * ....
     */
    protected _updateUVRect(): void {
        if (!this._material.getProperty("uvRect", 0)) {
            return;
        }

        const [uvRect] = BPSpriteMaterial.makeUVRect(this._sprite);
        this._material.setProperty("uvRect", uvRect);
    }

    /**
     * ....
     */
    private _initRTPair(): void {
        if (!this._rtPair) {
            this._rtPair = [new cc.RenderTexture(), new cc.RenderTexture()];
        }

        let size = this.node.getContentSize()//this._sprite.spriteFrame.getOriginalSize();
        this._rtPair.forEach((rt) => {
            rt.initWithSize(size.width, size.height);
        });
    }

    /**
     * ....
     */
    private _renderRTPair(rtRenderCount: number) {
        this._rtCamera = this.node.addComponent(cc.Camera);
        this._rtCamera.clearFlags |= cc.Camera.ClearFlags.COLOR;
        this._rtCamera.backgroundColor = cc.color(0, 0, 0, 0);
        this._rtCamera.zoomRatio = cc.winSize.height / this.node.height;

        for (let i = 0; i < rtRenderCount; ++i) {
            this._rtPair.forEach((rt) => {
                this._rtCamera.targetTexture = rt;
                this._rtCamera.render(this.node);
                this._sprite.spriteFrame = new cc.SpriteFrame(rt);
            });
        }

        this._rtCamera.destroy();
    }

    /**
     * ....
     */
    private _destroyRTPair(): void {
        this._rtPair?.forEach((rt) => {
            rt.destroy();
        });
    }


    /**
     * ....
     */
    protected onDestroy(): void {
        super.onDestroy();
        this._destroyRTPair();
    }

    /**
     * ....
     */
    public updateMaterial(): void {
    };
}