import { BPConst } from "./BPConst";
import { BPLog } from "./BPLog";

const PixelFormat = cc.Texture2D.PixelFormat;

const BPTexturePanelName = "BPTexturePanel";
const BPBlockPanelName = "BPBlockPanel";

const ViewHeight = 600;
const UnitBytes = 1024;

/**
 * 
 */
interface BlockData {
    // 距首桩时间
    pastTime: number;

    // 桩dc
    drawcall: number;
}

/**
 * 
 */
interface BlockRecord {
    // 块名称
    blockName: string;

    // 首桩时间戳
    startTime: number;

    // 插桩数据
    blockDataList: Array<BlockData>;
}

/**
 * 
 */
enum TextureSortType {
    // 升序
    SizeUpper = -2,
    MemoryUpper = -1,
    None = 0,
    // 降序
    MemoryLower = 1,
    SizeLower = 2,
}

/**
 * @author
 * @date
 * @description
 */
export class BPProfiler {

    private static _blockCache = new Map<string, BlockRecord>;

    private static _currentSortType: TextureSortType = TextureSortType.None;

    /**
     * @description 展示动态图集
     * @param status 状态
     */
    public static showDynamicAtlas(status: boolean = true): cc.Node {
        return cc.dynamicAtlasManager.showDebug(status);
    }

    /**
     * @description 展示左下角的统计面板
     * @param status 状态
     */
    public static showStats(status: boolean = true): void {
        cc.debug.setDisplayStats(status);
    }

    /**
     * @description 更改统计面板的文本颜色
     * @param font 文本颜色
     */
    public static setStatsColor(
        font: cc.Color = cc.Color.WHITE,
        background: cc.Color = cc.color(0, 0, 0, 150)) {
        const profiler = cc.find('PROFILER-NODE');
        if (!profiler) return BPLog.warn('cocos profiler node not found...');

        // 文字
        profiler.children.forEach(node => node.color = font);

        // 背景
        let node = profiler.getChildByName('BACKGROUND');
        if (!node) {
            node = new cc.Node('BACKGROUND');
            profiler.addChild(node, cc.macro.MIN_ZINDEX);
            node.setContentSize(profiler.getBoundingBoxToWorld());
            node.setPosition(0, 0);
        }

        const graphics = node.getComponent(cc.Graphics) || node.addComponent(cc.Graphics);
        graphics.clear();
        graphics.rect(-5, 12.5, node.width + 10, node.height - 10);
        graphics.fillColor = background;
        graphics.fill();
    }

    /**
     * @description 桩数据打点
     * @param bResetStartTime 是否更新首桩时间
     * @example
     * // 首桩
     * BPProfiler.recordBlock("TestViewName", true);
     * 
     * // 插桩
     * BPProfiler.recordBlock("TestViewName");
     */
    public static recordBlock(blockName: string, bResetStartTime: boolean = false) {
        // 没有记录创建记录
        let record = BPProfiler._blockCache.get(blockName);
        if (record == null) {
            record = {
                blockName: blockName,
                startTime: Date.now(),
                blockDataList: new Array<BlockData>
            };
            BPProfiler._blockCache.set(blockName, record);
        }

        // 是否更新首桩
        if (bResetStartTime) {
            record.startTime = Date.now();
        }

        // 插桩
        record.blockDataList.push({
            pastTime: Date.now() - record.startTime,
            drawcall: cc.renderer.drawCalls
        });
    }

    /**
     * @description 清理桩数据
     */
    public static resetBlock() {
        BPProfiler._blockCache.clear();
    }

    /**
     * @description
     * @example 
     * BPProfiler.upLoadBlock()
     */
    public static upLoadBlock() {
        let info = BPProfiler._getBlockInfo();
        // TODO: upLoad...
    }

    /**
     * @description
     * @example 
     * BPProfiler.dumpBlock()
     */
    public static dumpBlock() {
        let info = BPProfiler._getBlockInfo();
        cc.log(info);
    }

    /**
     * @description 显示或者隐藏block信息
     * @example BPProfiler.switchBlockDatas()
     */
    public static showBlock() {
        let [panel, content, nodeTitle] = BPProfiler._showOrHideScrollPanel(BPBlockPanelName);
        if (panel == null) {
            return;
        }

        let info = BPProfiler._getBlockInfo();
        info.forEach((subInfo, index) => {
            let nodeItem = new cc.Node();
            let itemLayout = nodeItem.addComponent(cc.Layout);
            itemLayout.type = cc.Layout.Type.VERTICAL;
            itemLayout.resizeMode = cc.Layout.ResizeMode.CONTAINER;
            itemLayout.spacingY = 5;

            let nodeName = new cc.Node();
            let label = nodeName.addComponent(cc.Label);
            label.fontSize = 30;
            label.lineHeight = label.fontSize;
            label.string = `name: ${subInfo.blockName}`;
            nodeName.height = label.lineHeight;
            nodeName.parent = nodeItem;

            let nodeList = new cc.Node();
            let lblInfo = nodeList.addComponent(cc.Label);
            lblInfo.fontSize = 24;
            lblInfo.lineHeight = label.fontSize;

            let infoStr = "";
            subInfo.blockDataList.forEach((data, index) => {
                const suffix = index == subInfo.blockDataList.length - 1 ? "" : "\n";
                infoStr = infoStr + `index: ${index}  pastTime: ${data.pastTime}  drawcall: ${data.drawcall}${suffix}`
            })
            lblInfo.string = infoStr;
            nodeList.parent = nodeItem;

            let partition = Math.floor(index / 5);
            content.getComponent(cc.Layout).scheduleOnce(() => {
                content.addChild(nodeItem);
            }, 0.3 * partition);
        });

        nodeTitle.getChildByName("NodeTitleInfo").getComponent(cc.Label).string = `(点击关闭)\nBlockInfo count: ${info.length}`;
    }

    /**
     * @description 打印纹理缓存
     */
    public static dumpTexture(): void {
        let count = 0;
        let totalBytes = 0;

        const list = BPProfiler._getTextureList();
        list.forEach((obj, index) => {
            const asset = obj.asset;
            const uuid = obj.uuid;

            let pixelFormat = asset.getPixelFormat();
            let bpp = this._bitsPerPixelForFormat(pixelFormat);
            let bytes = asset.width * asset.height * bpp / 8;

            totalBytes = totalBytes + bytes;
            count = count + 1;

            cc.log("uuid: \"%s\" \n[refCount]=%d [size]=%dx%d [bpp]=%d => %fKB",
                uuid,
                asset.refCount,
                asset.width,
                asset.height,
                bpp,
                (bytes / UnitBytes).toFixed(2));
        });

        cc.log("【Texture Cache Dump】:textures count: %d, for %f KB (%f MB)",
            count,
            (totalBytes / UnitBytes).toFixed(2),
            (totalBytes / (UnitBytes * UnitBytes)).toFixed(2));
    }

    /**
     * @description 显示或隐藏纹理缓存
     * @example BPProfiler.showTexture()
     */
    public static showTexture() {
        let [panel, content, nodeTitle] = BPProfiler._showOrHideScrollPanel(BPTexturePanelName);
        if (panel == null) {
            return;
        }

        let nodeSortContainer = new cc.Node();
        let layoutSortContainer = nodeSortContainer.addComponent(cc.Layout);
        layoutSortContainer.type = cc.Layout.Type.HORIZONTAL;
        layoutSortContainer.resizeMode = cc.Layout.ResizeMode.CONTAINER;
        layoutSortContainer.spacingX = 100;

        const sortFontSize = 35;
        let nodeSortMemory = new cc.Node();
        let lblSortMemory = nodeSortMemory.addComponent(cc.Label);
        lblSortMemory.fontSize = sortFontSize;
        lblSortMemory.lineHeight = lblSortMemory.fontSize;
        lblSortMemory.string = "内存排序";
        lblSortMemory.enableUnderline = true;
        nodeSortMemory.parent = nodeSortContainer;
        nodeSortMemory.on(cc.Node.EventType.TOUCH_END, () => {
            if (Math.sign(BPProfiler._currentSortType) != 0) {
                BPProfiler._currentSortType = - BPProfiler._currentSortType;
            }
            else {
                BPProfiler._currentSortType = TextureSortType.MemoryLower;
            }

            BPProfiler._updateTextureContent(content, nodeTitle);
        }, panel)

        let nodeSortSize = new cc.Node();
        let lblSortSize = nodeSortSize.addComponent(cc.Label);
        lblSortSize.fontSize = sortFontSize;
        lblSortSize.lineHeight = lblSortSize.fontSize;
        lblSortSize.string = "尺寸排序";
        lblSortSize.enableUnderline = true;
        nodeSortSize.parent = nodeSortContainer;
        nodeSortSize.on(cc.Node.EventType.TOUCH_END, () => {
            if (Math.sign(BPProfiler._currentSortType) != 0) {
                BPProfiler._currentSortType = - BPProfiler._currentSortType;
            }
            else {
                BPProfiler._currentSortType = TextureSortType.SizeLower;
            }

            BPProfiler._updateTextureContent(content, nodeTitle);
        }, panel);

        nodeSortContainer.height = sortFontSize + 10;
        nodeTitle.addChild(nodeSortContainer);

        BPProfiler._updateTextureContent(content, nodeTitle);
    }

    /**
     * @description
     */
    private static _updateTextureContent(content: cc.Node, nodeTitle: cc.Node) {
        content.removeAllChildren();

        let count = 0;
        let totalBytes = 0;
        const list = BPProfiler._getTextureList();
        list.forEach((obj, index) => {
            const asset = obj.asset;
            const uuid = obj.uuid;

            let pixelFormat = asset.getPixelFormat();
            let bpp = this._bitsPerPixelForFormat(pixelFormat);
            let bytes = asset.width * asset.height * bpp / 8;
            totalBytes = totalBytes + bytes;
            count = count + 1;

            cc.log("uuid: \"%s\" \n[refCount]=%d [size]=%dx%d [bpp]=%d => %fKB",
                uuid,
                asset.refCount,
                asset.width,
                asset.height,
                bpp,
                (bytes / UnitBytes).toFixed(2));

            //
            let item = new cc.Node();
            item.width = content.width;
            let itemLayout = item.addComponent(cc.Layout);
            itemLayout.type = cc.Layout.Type.GRID;
            itemLayout.resizeMode = cc.Layout.ResizeMode.CONTAINER;

            //
            let nodeSptContainer = new cc.Node();
            let nodeSprite = new cc.Node();
            let sprite = nodeSprite.addComponent(cc.Sprite);
            sprite.spriteFrame = new cc.SpriteFrame(asset);
            sprite.type = cc.Sprite.Type.SIMPLE;
            sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
            let scalar = asset.width > 256 ? 256 / asset.width : 1;
            nodeSprite.setContentSize(asset.width * scalar, asset.height * scalar);

            nodeSptContainer.width = content.width * 0.7;
            nodeSptContainer.height = nodeSprite.height;
            nodeSprite.parent = nodeSptContainer;
            nodeSptContainer.parent = item;

            //
            let nodeLblContainer = new cc.Node();
            let nodeLabel = new cc.Node();
            nodeLabel.width = 300;
            let label = nodeLabel.addComponent(cc.Label);
            label.fontSize = 24;
            label.horizontalAlign = cc.Label.HorizontalAlign.LEFT;
            label.lineHeight = label.fontSize;
            label.overflow = cc.Label.Overflow.RESIZE_HEIGHT;
            label.string = `bytes: ${(bytes / UnitBytes / UnitBytes).toFixed(2)}MB\n`;
            label.string += `refCount: ${asset.refCount}\n`;
            label.string += `size: ${asset.width} x ${asset.height}\n`;
            label.string += `nbpp: ${bpp}bits`;

            nodeLblContainer.width = content.width * 0.3;
            nodeLblContainer.height = label.lineHeight * 4;
            nodeLabel.parent = nodeLblContainer;
            nodeLblContainer.parent = item;

            //
            let partition = Math.floor(count / 5);
            content.getComponent(cc.Layout).scheduleOnce(() => {
                content.addChild(item);
            }, 0.5 * partition);

        });

        let kb = (totalBytes / UnitBytes).toFixed(2);
        let mb = (totalBytes / (UnitBytes * UnitBytes)).toFixed(2);
        cc.log("【Texture Cache Dump】:textures count: %d, for %f KB (%f MB)", count, kb, mb);
        nodeTitle.getChildByName("NodeTitleInfo").getComponent(cc.Label).string = `(点击关闭)\nTextures count: ${count} \nMemory: ${kb}KB (${mb}MB)`;
    }

    /**
     * @description
     */
    public static _getBlockInfo() {
        let info: Array<{ blockName: string, blockDataList: Array<BlockData> }> = [];
        BPProfiler._blockCache.forEach((record) => {
            info.push({
                blockName: record.blockName,
                blockDataList: record.blockDataList,
            });
        });

        return info;
    }

    /**
     * @description
     */
    private static _getTextureList() {
        const sortType = this._currentSortType;
        const assets = cc.assetManager.assets;

        let textureList: Array<{ uuid: string, asset: cc.Texture2D }> = [];
        assets.forEach((asset, uuid) => {
            if (asset instanceof cc.Texture2D) {
                textureList.push({ uuid: uuid, asset: asset });
            }
        });

        if (sortType == TextureSortType.MemoryLower
            || sortType == TextureSortType.MemoryUpper) {
            textureList.sort((a, b) => {
                let [_bppA, bytesA] = BPProfiler._getTextureMemoryInfo(a.asset);
                let [_bppB, bytesB] = BPProfiler._getTextureMemoryInfo(b.asset);
                return (bytesB - bytesA) * Math.sign(sortType);
            });
        }
        else if (sortType == TextureSortType.SizeLower
            || sortType == TextureSortType.SizeUpper) {
            textureList.sort((a, b) => {
                let sizeA = a.asset.width * a.asset.height;
                let sizeB = b.asset.width * b.asset.height;
                return (sizeB - sizeA) * Math.sign(sortType);
            });
        }

        return textureList;
    }

    /**
     * @description
     */
    private static _getTextureMemoryInfo(asset: cc.Texture2D) {
        let pixelFormat = asset.getPixelFormat();
        let bpp = this._bitsPerPixelForFormat(pixelFormat);
        let bytes = asset.width * asset.height * bpp / 8;

        return [bpp, bytes];
    }

    /**
     * @description
     * 返回scrollPanel和title两个节点的tuple..
     */
    private static _showOrHideScrollPanel(panelName: string) {
        let scene = cc.director.getScene();
        let curPanel = cc.director.getScene().getChildByName(panelName);
        if (curPanel) {
            curPanel.targetOff(curPanel);
            curPanel.destroy();
            return [null, null, null];
        }

        //
        const winSize = cc.winSize;
        let panel = new cc.Node();
        panel.name = panelName;
        panel.zIndex = BPConst.UIMaxZIndex;
        panel.setPosition(winSize.width * 0.5, winSize.height * 0.5);
        panel.setContentSize(winSize);

        let graphics = panel.addComponent(cc.Graphics);
        graphics.fillColor = cc.color(5, 5, 5, 200);
        graphics.fillRect(-panel.width * .5, -panel.height * .5, panel.width, panel.height);
        panel.parent = scene;

        //
        let nodeTitle = new cc.Node();
        nodeTitle.setAnchorPoint(0.5, 1);
        nodeTitle.width = panel.width;
        nodeTitle.parent = panel;

        let widgetTitle = nodeTitle.addComponent(cc.Widget);
        widgetTitle.isAlignTop = true;

        let layoutTitle = nodeTitle.addComponent(cc.Layout);
        layoutTitle.type = cc.Layout.Type.VERTICAL;
        layoutTitle.resizeMode = cc.Layout.ResizeMode.CONTAINER;
        layoutTitle.spacingY = 10;

        let nodeTitleInfo = new cc.Node("NodeTitleInfo");
        let lblTitleInfo = nodeTitleInfo.addComponent(cc.Label);
        lblTitleInfo.fontSize = 30;
        lblTitleInfo.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        lblTitleInfo.lineHeight = lblTitleInfo.fontSize;
        nodeTitleInfo.parent = nodeTitle;

        nodeTitleInfo.once(cc.Node.EventType.TOUCH_END, () => {
            panel.destroy();
        }, panel);

        //
        let view = new cc.Node();
        view.setContentSize(panel.width, ViewHeight);
        view.addComponent(cc.Mask).type = cc.Mask.Type.RECT;
        let scrollview = view.addComponent(cc.ScrollView);
        scrollview.horizontal = false;
        scrollview.vertical = true;
        view.parent = panel;

        //
        let content = new cc.Node();
        content.setAnchorPoint(0.5, 1);
        content.setContentSize(view.width, view.height);
        content.parent = view;

        let contentLayout = content.addComponent(cc.Layout);
        contentLayout.type = cc.Layout.Type.VERTICAL;
        contentLayout.resizeMode = cc.Layout.ResizeMode.CONTAINER;
        contentLayout.paddingTop = 5;
        contentLayout.paddingBottom = 5;
        contentLayout.spacingY = 20;

        scrollview.content = content;
        scrollview.scrollToTop();

        return [panel, content, nodeTitle];
    }

    /**
     * @description 像素占用内存, 单位bit..
     */
    private static _bitsPerPixelForFormat(inPixelFormat: cc.Texture2D.PixelFormat): number {
        // default is RGBA8888...
        let ret: number = 0;

        switch (inPixelFormat) {
            case PixelFormat.RGB_PVRTC_2BPPV1:
            case PixelFormat.RGBA_PVRTC_2BPPV1:
            case PixelFormat.RGB_A_PVRTC_2BPPV1:
                ret = 2;
                break;

            case PixelFormat.RGB_PVRTC_4BPPV1:
            case PixelFormat.RGBA_PVRTC_4BPPV1:
            case PixelFormat.RGB_A_PVRTC_4BPPV1:
            // 8bytes * 8bits / 16chunks = 4bits;
            case PixelFormat.RGB_ETC1:
            case PixelFormat.RGB_ETC2:
                ret = 4;
                break;

            // (8bytes + 8bytes) * 8bits / 16chunks = 8bits;
            case PixelFormat.RGBA_ETC1:
            // RGBA32bits is 8bpp, RGB888A1 is 4bpp;
            case PixelFormat.RGBA_ETC2:
            case PixelFormat.A8:
            case PixelFormat.I8:
                ret = 8;
                break;

            case PixelFormat.RGB565:
            case PixelFormat.RGB5A1:
            case PixelFormat.RGBA4444:
            case PixelFormat.AI88:
                ret = 16;
                break;

            case PixelFormat.RGB888:
                ret = 24;
                break;

            case PixelFormat.RGBA8888:
            case PixelFormat.RGBA32F:
                ret = 32;
                break;

            //=========ASTC specific begin===========
            case PixelFormat.RGBA_ASTC_4x4:
                ret = 8;
            case PixelFormat.RGBA_ASTC_5x4:
                ret = 6.4;
            case PixelFormat.RGBA_ASTC_5x5:
                ret = 5.12;
            case PixelFormat.RGBA_ASTC_6x5:
                ret = 4.27;
            case PixelFormat.RGBA_ASTC_6x6:
                ret = 3.56;
            case PixelFormat.RGBA_ASTC_8x5:
                ret = 3.20;
            case PixelFormat.RGBA_ASTC_8x6:
                ret = 2.67;
            case PixelFormat.RGBA_ASTC_8x8:
                ret = 2;
            case PixelFormat.RGBA_ASTC_10x5:
                ret = 2.56;
            case PixelFormat.RGBA_ASTC_10x6:
                ret = 2.13;
            case PixelFormat.RGBA_ASTC_10x8:
                ret = 1.6;
            case PixelFormat.RGBA_ASTC_10x10:
                ret = 1.28;
            case PixelFormat.RGBA_ASTC_12x10:
                ret = 1.07;
            case PixelFormat.RGBA_ASTC_12x12:
                ret = 0.89;
            //=========ASTC specific end===========
            default:
                ret = 32;
                cc.log(`unrecognised pixel format: ${inPixelFormat}, give result as RGBA8888 32bpp...`);
                break;
        }

        return ret;
    }

}

window["BPProfiler"] = window["BPProfiler"] || BPProfiler;