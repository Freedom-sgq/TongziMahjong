import { BPComponentBase } from "../BPComponentBase";
import { BPDecorator as BPDec } from "../../util/BPDecorator";
import { BPDecalEventParams, BPDecalManager } from "./BPDecalManager";
import { BPDecalUnitNotifyType } from "./BPDecalUnit";
import { BPEvent } from "../../event/BPEvent";
import { BPSpriteMaterial } from "../material/BPSpriteMaterial";

/** 
 * 贴花节点类型
 */
export enum DecalType {
    // prefab挂载显示和隐藏
    Prefab,
    // 指定节点的显示和隐藏
    Node,
    // 闪烁
    Blink,
    // 材质
    Material,
}

/**
 *  @author Tinker
 *  @description 贴花组组件，可以打包一组插槽挂到一个节点上
 */
@BPDec.ccclass
@BPDec.menu("BPComponents/BPDecalGroup")
export class BPDecalGroup extends BPComponentBase {
    /**
     *  贴花节点类型
     */
    @BPDec.property({ type: cc.Enum(DecalType) })
    public decalType = DecalType.Prefab;

    /**
     *  通知类型
     */
    @BPDec.property({ type: cc.Enum(BPDecalUnitNotifyType) })
    public notifyType = BPDecalUnitNotifyType.OnlyZero;

    /**
     * 单元路径名
     */
    @BPDec.property({ tooltip: CC_DEV && '路径名称, 以“.”分割, 不可重复。动态节点请不要填写，通过代码设置...' })
    public routeName: string = "";

    /**
     *  贴花预制体或者直接节点
     */
    @BPDec.property()
    public _decal: cc.Prefab | cc.Node = null;

    @BPDec.property({
        type: cc.Prefab,
        visible() {
            return this.decalType == DecalType.Prefab;
        }
    })
    public get decalPrefab(): cc.Prefab {
        return this._decal as cc.Prefab;
    }
    public set decalPrefab(prefab: cc.Prefab) {
        this._decal = prefab;
    }

    @BPDec.property({
        type: cc.Node,
        visible() {
            return this.decalType == DecalType.Node;
        }
    })
    public get decalNode(): cc.Node {
        return this._decal as cc.Node;
    }
    public set decalNode(node: cc.Node) {
        this._decal = node;
    }

    @BPDec.property()
    public _decalMaterial: cc.Material = null;

    @BPDec.property({
        type: cc.Material,
        visible() {
            return this.decalType == DecalType.Material;
        }
    })
    public get decalMaterial(): cc.Material {
        return this._decalMaterial as cc.Material;
    }
    public set decalMaterial(mt: cc.Material) {
        this._decalMaterial = mt;
    }

    /**
     * 贴花节点所在父节点方位坐标
     */
    @BPDec.property({
        visible() {
            return this.decalType == DecalType.Prefab;
        }
    })
    public pos = cc.v2(0, 0);

    // 自定义回调..
    private _customCallback: (decalNode: cc.Node, value: number) => void = null;

    // tween对象
    private _tween: cc.Tween = null;

    // 材质切换标记
    private _matIndex: 0 | 1 = 0;

    /**
     * 
     */
    protected onStart() {
        this.regDecals();
    }

    /**
     * 更新数据
     * @param params 数据 路由名 自定义回调
     */
    public updateParams(params: { routeName?: string, callback?: (node: cc.Node, value: number) => void }) {
        if (!params.routeName) {
            return;
        }

        // 原来已经注册了..
        if (this.routeName && this.routeName != params.routeName) {
            BPEvent.getInstance().off(this.routeName, this._onHandleDecalEvent, this);
        }

        if (params.routeName) {
            this.routeName = params.routeName;
            this._customCallback = params.callback;
            this.regDecals();
        }
    }

    /**
     * 
     */
    public clear() {
        if (this.routeName) {
            BPEvent.getInstance().off(this.routeName, this._onHandleDecalEvent, this);
        }

        const routeName = this.routeName;

        let decalNode: cc.Node = null;
        if (this.decalType == DecalType.Prefab) {
            // 预制体模式
            if (this._decal) {
                decalNode = this.node.getChildByName(routeName);
            }

            // 显示隐藏
            if (decalNode) {
                decalNode.active = false;
            }
        }
        else if (this.decalType == DecalType.Node) {
            if (this._decal) {
                decalNode = this._decal as cc.Node;
            }

            // 显示隐藏
            if (decalNode) {
                decalNode.active = false;
            }
        }
        else if (this.decalType == DecalType.Blink) {
            // 基础变换模式
            decalNode = this.node;
            decalNode.opacity = 255;
            this._tween && this._tween.stop();
            this._tween = null;
        }
        else if (this.decalType == DecalType.Material) {
            // 材质模式
            decalNode = this.node;
            if (this._decalMaterial) {
                const needSwitch = (this._matIndex == 1);
                if (needSwitch) {
                    const cpRender = this.node.getComponent(cc.RenderComponent);
                    const material = (this._matIndex == 0) ? this._decalMaterial : cc.Material.getBuiltinMaterial("2d-sprite");
                    const mt = cpRender?.setMaterial(0, material);
                    const [rect, rotated] = BPSpriteMaterial.makeUVRect(decalNode.getComponent(cc.Sprite));
                    if (mt?.getProperty("uvRect", 0)) {
                        mt.setProperty("uvRect", rect);
                    }

                    if (mt?.getProperty("uvRotated", 0)) {
                        mt.setProperty("uvRotated", rotated);
                    }

                    this._matIndex ^= 1;
                }
            }
        }

        this.routeName = "";
        this._customCallback = null;
    }

    /**
     *  @description.
     */
    public regDecals() {
        const routeName = this.routeName;
        if (routeName == "") { return; }

        BPDecalManager.getInstance().register(routeName, this._onHandleDecalEvent,
            this, this.notifyType,
        );
    }

    /**
     *  @description 事件处理
     */
    private _onHandleDecalEvent(data: BPDecalEventParams) {
        const routeName = data?.routeName;

        let decalNode: cc.Node = null;
        if (this.decalType == DecalType.Prefab) {
            // 预制体模式
            if (this._decal) {
                decalNode = this.node.getChildByName(routeName);
                if (decalNode == null) {
                    // 没查到, 就创建
                    decalNode = cc.instantiate(this._decal) as cc.Node;
                    decalNode.setPosition(this.pos);
                    decalNode.parent = this.node;
                }
                decalNode.name = routeName;
            }

            // 显示隐藏
            if (decalNode) {
                decalNode.active = data.value > 0;
            }
        }
        else if (this.decalType == DecalType.Node) {
            if (this._decal) {
                decalNode = this._decal as cc.Node;
            }

            // 显示隐藏
            if (decalNode) {
                decalNode.active = data.value > 0;
            }
        }
        else if (this.decalType == DecalType.Blink) {
            // 基础变换模式
            decalNode = this.node;

            if (data.value > 0) {
                if (this._tween == null) {
                    const action = cc.tween(decalNode)
                        .to(0.75, { opacity: 80 })
                        .to(0.75, { opacity: 255 });
                    this._tween = cc.tween(decalNode).repeatForever(action).start();
                }
            }
            else {
                decalNode.opacity = 255;
                this._tween && this._tween.stop();
                this._tween = null;
            }
        }
        else if (this.decalType == DecalType.Material) {
            // 材质模式
            decalNode = this.node;
            if (this._decalMaterial) {
                const needSwitch = (data.value > 0) !== (this._matIndex == 1);
                if (needSwitch) {
                    const cpRender = this.node.getComponent(cc.RenderComponent);
                    const material = (this._matIndex == 0) ? this._decalMaterial : cc.Material.getBuiltinMaterial("2d-sprite");
                    const mt = cpRender?.setMaterial(0, material);
                    const [rect, rotated] = BPSpriteMaterial.makeUVRect(decalNode.getComponent(cc.Sprite));
                    if (mt?.getProperty("uvRect", 0)) {
                        mt.setProperty("uvRect", rect);
                    }

                    if (mt?.getProperty("uvRotated", 0)) {
                        mt.setProperty("uvRotated", rotated);
                    }

                    this._matIndex ^= 1;
                }
            }
        }

        decalNode && this._customCallback?.(decalNode, data.value);
    }

    /**
     * 
     */
    protected onDestroy(): void {
        super.onDestroy();
    }
}