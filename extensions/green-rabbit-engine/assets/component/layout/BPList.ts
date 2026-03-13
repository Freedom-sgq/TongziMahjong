import { BPDecorator as BPDec } from "../../util/BPDecorator";
import { BPListCellBase } from "./BPListCellBase";
import { BPComponentBase } from "../BPComponentBase";
import { BPMath } from "../../util/BPMath";
import { BPTransformScale } from "../anim/BPTransformScale";

/** 
 * Cell类型 
 */
enum CellType {
    Prefab,
    Node
}

/** 
 * 布局模式
 */
enum LayoutMode {
    Horizontal,
    Vertical,
    Grid,
}

/** 
 *  方向
 */
enum LayoutDirection {
    /**正常方向，即：纵向（上->下），横向（左->右），网格（向下延伸） */
    Normal,

    /**特殊方向，即：纵向（下->上），横向（右->左），网格（向右延伸） */
    Special,
}

@BPDec.ccclass
@BPDec.disallowMultiple
//@BPDec.executeInEditMode
@BPDec.requireComponent(cc.ScrollView)
@BPDec.menu("BPComponents/BPList")
export class BPList extends BPComponentBase {
    /**
     * 相关事件
     */
    public static readonly OnCalcCellSize = "OnCalcCellSize";
    public static readonly OnCellUpdate = "OnCellUpdate";
    public static readonly OnCellCreate = "OnCellCreate";
    public static readonly OnCellClick = "OnCellClick";
    public static readonly OnScrollToBottom = "OnScrollToBottom";

    /**
     * cell类型
     */
    @BPDec.property
    private _cellType: CellType = CellType.Prefab;

    @BPDec.property({ type: cc.Enum(CellType) })
    public get cellType(): CellType {
        return this._cellType;
    }

    public set cellType(inType: CellType) {
        if (this._cellType == inType) {
            return;
        }

        this._cellType = inType;
        this._cellSrc = null;
    }

    /**
     * cell模版源
     */
    @BPDec.property
    private _cellSrc: cc.Prefab | cc.Node = null;

    @BPDec.property({ type: cc.Prefab, visible() { return this._cellType == CellType.Prefab; } })
    public get cellPrefab(): cc.Prefab {
        return this._cellSrc as cc.Prefab;
    }

    public set cellPrefab(prefab: cc.Prefab) {
        if (this._cellSrc === prefab) {
            return;
        }

        this._cellSrc = prefab;
    }

    @BPDec.property({ type: cc.Node, visible() { return this._cellType == CellType.Node; } })
    public get cellNode(): cc.Node {
        return this._cellSrc as cc.Node;
    }

    public set cellNode(node: cc.Node) {
        if (this._cellSrc === node) {
            return;
        }

        this._cellSrc = node;
    }

    /** 
     * 布局模式
     */
    @BPDec.property
    private _mode: LayoutMode = LayoutMode.Vertical

    @BPDec.property({ type: cc.Enum(LayoutMode) })
    public get mode(): LayoutMode {
        return this._mode;
    }

    public set mode(mode: LayoutMode) {
        if (this._mode == mode) {
            return;
        }
        this._mode = mode;

        if (mode == LayoutMode.Vertical) {
            this._scrollView.vertical = true;
            this._scrollView.horizontal = false;
        }
        else if (mode == LayoutMode.Horizontal) {
            this._scrollView.vertical = false;
            this._scrollView.horizontal = true;
        }
        else if (mode == LayoutMode.Grid) {
            this._scrollView.vertical = this.direction == LayoutDirection.Normal;
            this._scrollView.horizontal = this.direction == LayoutDirection.Special;
        }
    }

    /**
     *  方向
     */
    @BPDec.property
    private _direction: LayoutDirection = LayoutDirection.Normal

    @BPDec.property({
        type: cc.Enum(LayoutDirection),
        tooltip: CC_DEV && "Normal: T2B, L2R, WidthFixed; Special: B2T, R2L, HeightFixed;"
    })
    public get direction(): LayoutDirection {
        return this._direction;
    }

    public set direction(direction: LayoutDirection) {
        if (this._direction == direction) {
            return;
        }

        this._direction = direction;

        this._scrollView.vertical = this.direction == LayoutDirection.Normal;
        this._scrollView.horizontal = this.direction == LayoutDirection.Special;
    }

    /** 
     * 外边距
     */
    @BPDec.property({ tooltip: CC_DEV && "外边距(水平, 垂直)" })
    public margin = new cc.Vec2(0.0, 0.0);

    /** 
     * 间隔
     */
    @BPDec.property({ tooltip: CC_DEV && "间隔(水平, 垂直)" })
    public spacing = new cc.Vec2(0.0, 0.0);

    /**
     * 格子缩放
     */
    @BPDec.property({ tooltip: CC_DEV && "格子缩放" })
    public cellScale = 1;

    /**
 * 格子缩放
 */
    @BPDec.property({ tooltip: CC_DEV && "Cell是否播放缩放动画" })
    public useCellAnim = false;

    /**
     * 
     */
    @BPDec.property({ tooltip: CC_DEV && "是否默认填充满", visible() { return this._mode == LayoutMode.Grid; } })
    public usePreFilled = false;

    @BPDec.property({ type: cc.Node })
    public nodeNullContentTip: cc.Node = null;

    /** 
     * 私有属性
     */
    private _bInited = false;
    private _sizeDirty: boolean = false;
    private _cellsDirty: boolean = false;
    private _eventIntercept: boolean = false;
    private _dataCount: number = 0;
    // 充满一屏需要得节点数
    private _filledCount: number = 0;
    // 动画延迟占比
    private _spawnedCells: Array<cc.Node> = [];

    private _scrollView: cc.ScrollView;
    private _content: cc.Node;

    private _viewRect: cc.Rect;

    /**
     *  如果有数据结构变化调用，重新渲染当前列表
     */
    public updateView(dataCount: number) {
        this._init();
        this._dataCount = this._makeDataCount(dataCount);
        this.pack();
    }

    public forceUpdateView(dataCount: number) {
        this._bInited = false;
        this._init();
        this._dataCount = this._makeDataCount(dataCount);
        this.pack();
    }

    public getDataCount() {
        return this._dataCount;
    }

    /**
     *  推入一个新节点, 下一帧更新
     */
    public push() {
        this._dataCount = this._makeDataCount(this._dataCount + 1);
        this.pack();
    }

    /**
     *  弹出一个节点, 下一帧更新
     */
    public pop() {
        if (this._dataCount == 0) return;
        this._dataCount = this._makeDataCount(this._dataCount - 1);
        this.pack();
    }

    /**
     *  轻量级推入，不会更新其他节点
     */
    public pushLite() {
        this._dataCount = this._makeDataCount(this._dataCount + 1);
        this._udpateContentSize(true);
        this._updateSpawnedCells(this._dataCount - 1, 1);

        this._sizeDirty = true;
        this._cellsDirty = true;
    }

    /**
     *  轻量级弹出，不会更新其他节点
     */
    public popLite() {
        if (this._dataCount == 0) return;

        this._updateSpawnedCells(this._dataCount - 1, -1);
        this._dataCount = this._makeDataCount(this._dataCount - 1);
        this._udpateContentSize(true);

        if (this._dataCount == 0) {
            this.pack();
        }
        else {
            this._sizeDirty = true;
            this._cellsDirty = true;
        }
    }

    /**
     *  更新当前可见节点,重排会重新计算位置大小，非重排只更新数据
     * @param {boolean} bPack true 是否重排
     */
    public updateCells(bPack: boolean = false) {
        if (bPack == true) {
            this.pack();
        }
        else {
            this._dealWithSpawnedCells((cell, cpCell, dataIndex) => {
                this.node.emit(BPList.OnCellUpdate, cpCell, dataIndex);
            });
        }
    }

    /**
     *  重排, 立即更新位置，下次update更新显示
     */
    public pack() {
        this._resetAllSpawnedCells();
        this._udpateContentSize(true);
        this._cellsDirty = true;
    }

    /**
     * ...
     */
    public scrollToTop(timeInSecond: number = 0, attenuated: boolean = true): void {
        this._scrollView.scrollToTop(timeInSecond, attenuated);
    }

    /**
     * ...
     */
    public scrollToBottom(timeInSecond: number = 0, attenuated: boolean = true): void {
        this._scrollView.scrollToBottom(timeInSecond, attenuated);
    }

    /**
     * ...
     */
    public scrollToLeft(timeInSecond: number = 0, attenuated: boolean = true): void {
        this._scrollView.scrollToLeft(timeInSecond, attenuated);
    }

    /**
     * ...
     */
    public scrollToRight(timeInSecond: number = 0, attenuated: boolean = true): void {
        this._scrollView.scrollToRight(timeInSecond, attenuated);
    }

    /**
     * 停止所有滚动
     */
    public stopAutoScroll() {
        this._scrollView.stopAutoScroll();
    }

    /**
     * 
     * @param {0 | 0.5 | 1} aligment 停靠位置,0即方向的起始方向,1是延展方向
     */
    public scrollToIndex(
        index: number,
        aligment: 0 | 0.5 | 1 = 0,
        timeInSecond: number = 0,
        attenuated: boolean = true): void {

        let offset = this._getOffsetByIndex(index, aligment);
        this._scrollView.scrollToOffset(offset, timeInSecond, attenuated);
    }

    /**
     * 刷新列表项并播放缩放动画
     * 动画流程：scale 1.0 -> 1.1 -> 1.0，总时长 0.1 秒
     */
    public refreshByAnimation(dataCount: number, aniTime: number = 0.1): void {
        if (this._spawnedCells.length <= 0) {
            this.updateView(dataCount);
            return;
        }
        const halfTime = aniTime / 2;
        // 动画执行前禁用滚动和事件截断
        this._eventIntercept = true;
        this._scrollView.enabled = false;
        this.updateView(dataCount);

        let complet = 0;

        for (let i = 0; i < this._spawnedCells.length; i++) {
            const cell = this._spawnedCells[i];
            cc.tween(cell)
                .delay(i * halfTime)
                .to(halfTime, { scale: 1.1 })
                .call(() => {
                    let cpCell = cell.getComponent(BPListCellBase);
                    if (cpCell) {
                        cpCell.index = i;
                        this.node.emit(BPList.OnCellUpdate, cpCell, i);
                    }
                })
                .to(halfTime, { scale: 1.0 })
                .call(() => {
                    complet++;
                    if (complet >= this._spawnedCells.length) {
                        this._eventIntercept = false;
                        this._scrollView.enabled = true;
                    }
                })
                .start();
        }
    }

    /**
     * 构造数据量
     * @param dataCount 
     * @returns 
     */
    private _makeDataCount(dataCount: number) {
        if (this.usePreFilled == false) {
            return dataCount;
        }

        return Math.max(this._filledCount, dataCount);
    }

    /**
     * 计算充满一屏需要的节点数
     */
    private _calcFilledCount() {
        let count = 0;
        if (this.mode == LayoutMode.Vertical) {
            let lastHeight = this.margin.y * 2 + this._calcCellSize(count).height;
            while (lastHeight < this._viewRect.height) {
                count = count + 1;
                lastHeight = lastHeight + this._calcCellSize(count).height + this.spacing.y;
            }
            count = count + 1;
        }
        else if (this.mode == LayoutMode.Horizontal) {
        }
        else if (this.mode == LayoutMode.Grid) {
            let targetSize = this._getCellSrcOriginSize();
            let row: number = 0;
            let col: number = 0;
            if (this.direction == LayoutDirection.Normal) {
                let per = (this._content.width - 2 * this.margin.x + this.spacing.x) / (targetSize.width + this.spacing.x);
                per = Math.max(Math.floor(per), 1);
                row = Math.ceil((this._viewRect.height - 2 * this.margin.y) / (targetSize.height + this.spacing.y));
                count = row * per;
            }
            else {
                let per = (this._content.height - 2 * this.margin.y + this.spacing.y) / (targetSize.height + this.spacing.y);
                per = Math.max(Math.floor(per), 1);
                col = Math.ceil((this._viewRect.width - 2 * this.margin.x) / (targetSize.width + this.spacing.x));
                count = col * per;
            }
        }

        this._filledCount = count;
    }

    /**
     * ...
     */
    private _updateSpawnedCells(targetIndex: number, sign: 1 | -1) {
        if (this._dataCount == 0) { return; }

        let contentAnchor = this._content.getAnchorPoint();
        let base = this._direction == LayoutDirection.Normal ? 1 : 0;
        let targetSize = this._mode == LayoutMode.Grid ? this._getCellSrcOriginSize() : this._calcCellSize(targetIndex);

        let delta = 0;
        if (this._mode == LayoutMode.Vertical) {
            delta = (base - contentAnchor.y) * (targetSize.height + this.margin.y) * sign;
        }
        else if (this._mode == LayoutMode.Horizontal) {
            delta = (1 - base - contentAnchor.x) * (targetSize.width + this.margin.x) * sign;
        }
        else if (this._mode == LayoutMode.Grid) {
            if (this._direction == LayoutDirection.Normal) {
                delta = (base - contentAnchor.y) * (targetSize.height + this.margin.y) * sign;
            }
            else if (this._direction == LayoutDirection.Special) {
                delta = (base - contentAnchor.x) * (targetSize.width + this.margin.x) * sign;
            }
        }

        if (this._mode == LayoutMode.Grid) {
            if (this._direction == LayoutDirection.Normal) {
                let per = (this._content.width - 2 * this.margin.x + this.spacing.x) / (targetSize.width + this.spacing.x);
                per = Math.max(Math.floor(per), 1);

                this._dealWithSpawnedCells((cell, cellComp, dataIndex) => {
                    let row = Math.floor(dataIndex / per);
                    let targetRow = Math.floor(targetIndex / per);
                    let targetCol = targetIndex % per;
                    if (targetCol == 0 && row < targetRow) {
                        cell.y += delta;
                    }

                    if (dataIndex >= targetIndex) {
                        this._resetSpawnedCell(cell);
                    }
                });
            }
            else if (this._direction == LayoutDirection.Special) {
                let per = (this._content.height - 2 * this.margin.y + this.spacing.y) / (targetSize.height + this.spacing.y);
                per = Math.max(Math.floor(per), 1);

                this._dealWithSpawnedCells((cell, cellComp, dataIndex) => {
                    let col = Math.floor(dataIndex / per);
                    let targetCol = Math.floor(targetIndex / per);
                    let targetRow = targetIndex % per;
                    if (targetRow == 0 && col < targetCol) {
                        cell.x += delta;
                    }

                    if (dataIndex >= targetIndex) {
                        this._resetSpawnedCell(cell);
                    }
                });
            }
        }
        else {
            this._dealWithSpawnedCells((cell, cellComp, dataIndex) => {
                if (this._mode == LayoutMode.Vertical) {
                    if (dataIndex < targetIndex) {
                        cell.y += delta;
                    }
                }
                else if (this._mode == LayoutMode.Horizontal) {
                    if (dataIndex < targetIndex) {
                        cell.x += delta;
                    }
                }

                if (dataIndex >= targetIndex) {
                    this._resetSpawnedCell(cell);
                }
            });
        }
    }

    /** 
     * ...
     */
    private _updateComponent() {
        if (this._dataCount <= 0) {
            if (this.nodeNullContentTip &&
                this.nodeNullContentTip.active == false) {
                this.nodeNullContentTip.active = true;
            }
        }
        else {
            if (this.nodeNullContentTip &&
                this.nodeNullContentTip.active == true) {
                this.nodeNullContentTip.active = false;
            }

            this._udpateContentSize();
            this._updateContentCells();
        }
    }

    private _init() {
        if (this._bInited == true) return;

        this._scrollView = this.getComponent(cc.ScrollView);
        this._scrollView.node.on("scroll-to-bottom", this._onScrollToBottom, this);
        this._content = this._scrollView.content;
        this._content.parent.getComponent(cc.Widget)?.updateAlignment();
        this._viewRect = BPMath.makeNodeRect(this._content?.parent);
        this._calcFilledCount();
        this._bInited = true;
    }

    /**
     * ....
     */
    protected override onLoad(): void {
        this._init();
        this._content?.on(cc.Node.EventType.POSITION_CHANGED, this._onContentPosChanged, this);
    }

    /**
     * ...
     */
    protected override update(dt: number): void {
        this._updateComponent();
    }

    /**
     * ...
     */
    protected override onDestroy(): void {
        this._content?.off(cc.Node.EventType.POSITION_CHANGED, this._onContentPosChanged, this);
    }

    private _onScrollToBottom() {
        this.node.emit(BPList.OnScrollToBottom, this.node);
    }

    /**
     * ...
     */
    private _onContentPosChanged(): void {
        this._scrollView["_outOfBoundaryAmountDirty"] = true;
        this._cellsDirty = true;
    }

    /**
     * ...
     */
    private _dealWithSpawnedCells(dealFunction: (cell: cc.Node, cellComp: BPListCellBase<any>, dataIndex: number) => void) {
        if (!dealFunction) { return; }

        for (let i = 0; i < Math.min(this._spawnedCells.length, this._dataCount); i++) {
            let cell = this._spawnedCells[i];
            let cellComp = cell.getComponent(BPListCellBase);
            let dataIndex = cellComp.index;
            dealFunction(cell, cellComp, dataIndex);
        }
    }

    /**
     *  根据当前最大数据索引判断spawn出来的cell是否需要reset
     */
    private _checkAllSpawnedCell() {
        let maxDataIndex = this._dataCount - 1;
        this._dealWithSpawnedCells((cell, cellComp, dataIndex) => {
            if (dataIndex > maxDataIndex) {
                this._resetSpawnedCell(cell);
            }
        });
    }

    /** 
     * 计算contentSize...
     */
    private _udpateContentSize(bForce: boolean = false) {
        if (!bForce && !this._sizeDirty) {
            return;
        }
        this._sizeDirty = false;

        this._checkAllSpawnedCell();

        let final = 0;
        if (this.mode == LayoutMode.Vertical) {
            let count = this._dataCount > 0 ? this._dataCount - 1 : 0;
            final = this._dataCount > 0 ? 2 * this.margin.y + count * this.spacing.y : 0;
            for (let i = 0; i < this._dataCount; ++i) {
                let size = this._calcCellSize(i);
                final = final + size.height;
            }

            // 真实高度
            this._content.height = final;

            if (this.direction == LayoutDirection.Special) {
                if (this._content.height < this._getViewNode().height) {
                    this._scrollView.scrollToBottom();
                }
            }
        }
        else if (this.mode == LayoutMode.Horizontal) {
            let count = this._dataCount > 0 ? this._dataCount - 1 : 0;
            final = this._dataCount > 0 ? 2 * this.margin.x + count * this.spacing.x : 0;
            for (let i = 0; i < this._dataCount; ++i) {
                let size = this._calcCellSize(i);
                final = final + size.width;
            }

            // 真实宽度
            this._content.width = final;

            if (this.direction == LayoutDirection.Special) {
                if (this._content.width < this._getViewNode().width) {
                    this._scrollView.scrollToRight();
                }
            }
        }
        else if (this.mode == LayoutMode.Grid) {
            // grid 暂不处理动态变化的宽高
            let size = this._getCellSrcOriginSize();
            if (this.direction == LayoutDirection.Normal) {
                let per = (this._content.width - 2 * this.margin.x + this.spacing.x) / (size.width + this.spacing.x);
                per = Math.max(Math.floor(per), 1);

                let row = Math.ceil(this._dataCount / per);
                this._content.height = this.margin.y * 2 + (row - 1) * this.spacing.y + row * size.height;
            }
            else {
                let per = (this._content.height - 2 * this.margin.y + this.spacing.y) / (size.height + this.spacing.y);
                per = Math.max(Math.floor(per), 1);

                let col = Math.ceil(this._dataCount / per);
                this._content.width = this.margin.x * 2 + (col - 1) * this.spacing.x + col * size.width;
            }
        }
    }

    /** 
     * 更新content中的cells
     */
    private _updateContentCells(bForce: boolean = false) {
        if (!bForce && !this._cellsDirty) {
            return;
        }
        this._cellsDirty = false;

        let params = this._parseCellsParams();
        let inners = params.inners;
        let outers = params.outers;

        let contentRect = BPMath.makeNodeRect(this._content);
        let xMax: number, xMin: number, yMax: number, yMin: number;
        let total: number = 0;

        if (this.mode == LayoutMode.Vertical) {
            for (let i = 0; i < this._dataCount; ++i) {
                let size = this._calcCellSize(i);
                total += size.height;

                if (this.direction == LayoutDirection.Normal) {
                    yMax = contentRect.yMax - (this.margin.y + i * this.spacing.y + (total - size.height));
                    yMin = yMax - size.height;

                    if (yMin + this._content.y > this._viewRect.yMax) {
                        continue;
                    }

                    if (yMax + this._content.y < this._viewRect.yMin) {
                        break;
                    }
                }
                else {
                    yMin = contentRect.yMin + (this.margin.y + i * this.spacing.y + (total - size.height));
                    yMax = yMin + size.height;

                    if (yMax + this._content.y < this._viewRect.yMin) {
                        continue;
                    }

                    if (yMin + this._content.y > this._viewRect.yMax) {
                        break;
                    }
                }

                if (params.min != null && params.max != null
                    && i >= params.min && i <= params.max) {
                    continue;
                }

                this._updateCell(i, outers, size, null, yMin);
            }
        }
        else if (this.mode == LayoutMode.Horizontal) {
            for (let i = 0; i < this._dataCount; ++i) {
                let size = this._calcCellSize(i);
                total += size.width;

                if (this.direction == LayoutDirection.Normal) {
                    xMin = contentRect.xMin + (this.margin.x + i * this.spacing.x + total - size.width);
                    xMax = xMin + size.width;

                    if (xMax + this._content.x < this._viewRect.xMin) {
                        continue;
                    }

                    if (xMin + this._content.x > this._viewRect.xMax) {
                        break;
                    }

                }
                else {
                    xMax = contentRect.xMax - (this.margin.x + i * this.spacing.x + total - size.width);
                    xMin = xMax - size.width;
                    if (xMin + this._content.x > this._viewRect.xMax) {
                        continue;
                    }

                    if (xMax + this._content.x < this._viewRect.xMin) {
                        break;
                    }
                }

                if (params.min != null && params.max != null
                    && i >= params.min && i <= params.max) {
                    continue;
                }

                this._updateCell(i, outers, size, xMin, null);
            }
        }
        else if (this.mode == LayoutMode.Grid) {
            let size = this._calcCellSize();

            for (let i = 0; i < this._dataCount; ++i) {
                let row: number = 0;
                let col: number = 0;

                if (this.direction == LayoutDirection.Normal) {
                    // 固定宽度，高度变化，自左向右，自上而下延展
                    let per = (this._content.width - 2 * this.margin.x + this.spacing.x) / (size.width + this.spacing.x);
                    per = Math.max(Math.floor(per), 1);

                    row = Math.floor(i / per);
                    col = i % per;

                    // 上->下
                    yMax = contentRect.yMax - (this.margin.y + row * (this.spacing.y + size.height));
                    yMin = yMax - size.height;

                    if (yMin + this._content.y > this._viewRect.yMax) {
                        continue;
                    }

                    if (yMax + this._content.y < this._viewRect.yMin) {
                        break;
                    }

                    // 左->右
                    xMin = contentRect.xMin + (this.margin.x + col * (size.width + this.spacing.x));
                    xMax = xMin + size.width;

                    if (xMax + this._content.x < this._viewRect.xMin
                        || xMin + this._content.x > this._viewRect.xMax) {
                        continue;
                    }
                }
                else {
                    // 固定高度，宽度变化，自上而下，自左向右延展
                    let per = (this._content.height - 2 * this.margin.y + this.spacing.y) / (size.height + this.spacing.y);
                    per = Math.max(Math.floor(per), 1);

                    col = Math.floor(i / per);
                    row = i % per;

                    // 左->右
                    xMin = contentRect.xMin + (this.margin.x + col * (this.spacing.x + size.width));
                    xMax = xMin + size.width;
                    if (xMax + this._content.x < this._viewRect.xMin) {
                        continue;
                    }

                    if (xMin + this._content.x > this._viewRect.xMax) {
                        break;
                    }

                    // 上->下
                    yMax = contentRect.yMax - (this.margin.y + row * (this.spacing.y + size.height));
                    yMin = yMax - size.height;

                    if (yMax + this._content.y < this._viewRect.yMin
                        || yMin + this._content.y > this._viewRect.yMax) {
                        continue;
                    }
                }

                if (params.min != null && params.max != null
                    && i >= params.min && i <= params.max) {
                    continue;
                }

                this._updateCell(i, outers, size, xMin, yMin);
            }
        }
    }

    /** 
     * ...
     */
    private _updateCell(dataIndex: number, outers: number[], size: cc.Size, baseX: number, baseY: number) {
        let cell: cc.Node = null;

        let spawnedIndex = outers.shift();
        if (spawnedIndex != null) {
            cell = this._spawnedCells[spawnedIndex];
            //BPLog.engine("复用: ", dataIndex);
        }
        else {
            cell = this._addCell(dataIndex);
            //BPLog.engine("新增: ", dataIndex);
        }

        cell.setContentSize(size);
        cell.opacity = 255;

        let xPos = baseX == null ? 0 : baseX + cell.anchorX * size.width;
        let yPos = baseY == null ? 0 : baseY + cell.anchorY * size.height;
        cell.setPosition(cc.v3(xPos, yPos));

        let cpCell = cell.getComponent(BPListCellBase);
        if (cpCell && !this._eventIntercept) {
            cpCell.index = dataIndex;
            this.node.emit(BPList.OnCellUpdate, cpCell, dataIndex);
        }
    }

    /**
     * ...
     */
    private _addCell(index: number): cc.Node {
        let cell = cc.instantiate(this._cellSrc) as cc.Node;
        cell.opacity = 255;

        this._spawnedCells.push(cell);
        const cpCell = cell.getComponent(BPListCellBase)
        cpCell.index = index;
        this._content.addChild(cell);

        // 动画
        if (this.useCellAnim && index < this._filledCount) {
            const cpScale = cell.addComponent(BPTransformScale)
            cpScale.fromTo.from = 0;
            cpScale.fromTo.to = this.cellScale;
            cpScale.delayRate = index * 0.02;
            cpScale.play();
        }

        // 点击
        const cpButton = cpCell.getComponent(cc.Button);
        if (cpButton) {
            cpButton.node.on("click", this._onCellClicked, this);
        }

        this.node.emit(BPList.OnCellCreate, this.node, cpCell);
        return cell;
    }

    /**
     * 点击
     */
    private _onCellClicked(button: cc.Button) {
        this.node.emit(BPList.OnCellClick, this.node, button.getComponent(BPListCellBase));
    }

    /**
     * ...
     */
    private _parseCellsParams(): { inners: number[], outers: number[], min: number, max: number } {
        let inners: number[] = [];
        let outers: number[] = [];
        let max: number = null;
        let min: number = null;

        for (let i = 0; i < this._spawnedCells.length; ++i) {
            let cell = this._spawnedCells[i];
            let box = cell.getBoundingBox();

            let bCheck = false;
            if (this.mode == LayoutMode.Vertical) {
                bCheck = box.yMin + this._content.y <= this._viewRect.yMax &&
                    box.yMax + this._content.y >= this._viewRect.yMin;
            }
            else if (this.mode == LayoutMode.Horizontal) {
                bCheck = box.xMin + this._content.x <= this._viewRect.xMax &&
                    box.xMax + this._content.x >= this._viewRect.xMin;
            }
            else if (this.mode == LayoutMode.Grid) {
                bCheck = box.xMin + this._content.x <= this._viewRect.xMax &&
                    box.xMax + this._content.x >= this._viewRect.xMin &&
                    box.yMin + this._content.y <= this._viewRect.yMax &&
                    box.yMax + this._content.y >= this._viewRect.yMin;
            }

            if (bCheck == true) {
                let cellComp = cell.getComponent(BPListCellBase);
                let dataIndex = cellComp.index;

                if (max == null) max = dataIndex;
                if (min == null) min = dataIndex;
                max = Math.max(dataIndex, max);
                min = Math.min(dataIndex, min);

                inners.push(i);
                cell.opacity = 255;
            }
            else {
                outers.push(i);
                cell.opacity = 0;
            }
        }

        return { inners: inners, outers: outers, min: min, max: max };
    }

    /**
     * ...
     */
    private _resetSpawnedCell(cell: cc.Node): void {
        //let contentRect = BPMath.makeNodeRect(this._content);
        //let anchorPoint = cell.getAnchorPoint();
        //cell.setPosition(contentRect.xMin - (anchorPoint.x * cell.width) - 1,contentRect.yMax + (anchorPoint.y) * cell.height + 1);
        //cell.opacity = 0;
        cell.setPosition(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER);
        cell.opacity = 0;
    }

    /**
     * ...
     */
    private _resetAllSpawnedCells() {
        for (let i = 0; i < this._spawnedCells.length; ++i) {
            let cell = this._spawnedCells[i];
            this._resetSpawnedCell(cell);
        }
    }

    /**
     * @param {number} aligment 定位后的位置
     */
    private _getOffsetByIndex(index: number, aligment: number): cc.Vec2 {
        let offset = cc.v2(0, 0);

        if (this._mode == LayoutMode.Vertical) {
            let targetSize = this._calcCellSize(index);
            let total: number = this.margin.y + index * this.spacing.y;
            for (let i = 0; i < index; ++i) {
                let size = this._calcCellSize(i);
                total += size.height;
            }

            offset.x = this._content.x;
            if (this.direction == LayoutDirection.Normal) {
                offset.y = total - (aligment) * this._viewRect.height + (aligment) * targetSize.height;
            }
            else {
                offset.y = - total - (1 - aligment) * this._viewRect.height - (aligment) * targetSize.height + this._content.height;
            }
        }
        else if (this._mode == LayoutMode.Horizontal) {
            let targetSize = this._calcCellSize(index);
            let total: number = this.margin.x + index * this.spacing.x;
            for (let i = 0; i < index; ++i) {
                let size = this._calcCellSize(i);
                total += size.width;
            }

            if (this.direction == LayoutDirection.Normal) {
                offset.x = total - (aligment) * this._viewRect.width + (aligment) * targetSize.width;
            }
            else {
                offset.x = - total - (1 - aligment) * this._viewRect.width - (aligment) * targetSize.width + this._content.width;
            }
            offset.y = this._content.y;
        }
        else if (this._mode == LayoutMode.Grid) {
            let targetSize = this._getCellSrcOriginSize();

            let row: number = 0;
            let col: number = 0;
            if (this.direction == LayoutDirection.Normal) {
                let per = (this._content.width - 2 * this.margin.x + this.spacing.x) / (targetSize.width + this.spacing.x);
                per = Math.max(Math.floor(per), 1);

                row = Math.floor(index / per);
                let totalY = this.margin.y + row * this.spacing.y + targetSize.height * row;

                offset.x = this._content.x;
                offset.y = totalY - (aligment) * this._viewRect.height + (aligment) * targetSize.height;
            }
            else {
                let per = (this._content.height - 2 * this.margin.y + this.spacing.y) / (targetSize.height + this.spacing.y);
                per = Math.max(Math.floor(per), 1);

                col = Math.floor(index / per);
                let totalX = this.margin.x + col * this.spacing.x + targetSize.width * col;

                offset.x = totalX - (aligment) * this._viewRect.width + (aligment) * targetSize.width;
                offset.y = this._content.y;
            }
        }

        return offset;
    }

    /**
     * ....
     */
    private _getCellSrcOriginSize(): cc.Size {
        let outSize = cc.Size.ZERO;
        let contentSize: cc.Size = null;
        if (this._cellSrc instanceof cc.Prefab) {
            contentSize = this._cellSrc.data.getContentSize();
        }
        else if (this._cellSrc instanceof cc.Node) {
            contentSize = this._cellSrc.getContentSize();
        }

        if (contentSize) {
            outSize.width = contentSize.width;
            outSize.height = contentSize.height;
        }

        return outSize;
    }

    /**
     * ....
     */
    private _calcCellSize(dataIndex?: number): cc.Size {
        let size = this._getCellSrcOriginSize();
        if (dataIndex != null) {
            this.node.emit(BPList.OnCalcCellSize, dataIndex, size);
        }
        return size;
    }

    /**
     * ....
     */
    private _getViewNode(): cc.Node {
        return this._content?.parent;
    }
}