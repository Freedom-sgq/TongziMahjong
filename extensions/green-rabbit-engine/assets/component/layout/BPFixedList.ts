import { BPMath } from "../../util/BPMath";

/**
 * 
 */
const CCDecorator = cc._decorator;

/**
 * 定位index
 */
function locateIndex(list: number[], target: number): number {
    let left = 0;
    let right = list.length - 1;

    while (left <= right) {
        let mid = Math.floor((left + right) / 2);
        if (list[mid] == target) {
            return mid;
        }
        else if (list[mid] < target) {
            left = mid + 1;
        }
        else {
            right = mid - 1;
        }
    }

    return left;
}

/**
 * 获取cell信息
 */
function getCellInfo(cell: cc.Node) {
    let [tag, index] = cell.name.split("_");
    return [parseInt(tag), parseInt(index)];
}

/**
 * @class BPFixedListViewCellPool
 */
class BPFixedListCellPool {
    private _prefabs = null;
    private _fixedCell: cc.Node = null;
    private _mapCells = new Map<string, cc.Node[]>();

    constructor(prefabs: cc.Prefab[]) {
        this._prefabs = prefabs;
        for (let i = 0; i < prefabs.length; i++) {
            this._mapCells.set(i.toString(), new Array<cc.Node>());
        }
    }

    /**
     * 
     */
    public getFixedCell() {
        return this._fixedCell;
    }

    /**
     * 
     */
    public fix(cell: cc.Node) {
        if (!cell) return;
        this._fixedCell = cell;
    }

    /**
     * 
     */
    public unfix() {
        this._fixedCell = null;
    }

    /**
     * 
     */
    public put(cell: cc.Node) {
        if (!cell) return;

        cell.setPosition(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER);
        cell.opacity = 0;

        let [cellTag] = cell.name.split("_");
        let cells = this._getCellsByTag(parseInt(cellTag));
        cells.push(cell);
    }

    /**
     * 
     */
    public get(cellTag: number = 0, cellIndex: number = 0) {
        let cells = this._getCellsByTag(cellTag);
        let outCell = cells.pop();
        if (!outCell) {
            outCell = cc.instantiate(this._prefabs[cellTag]);
        }

        outCell.name = cellTag + "_" + cellIndex;
        outCell.opacity = 255;

        return outCell;
    }

    /**
     * 
     */
    private _getCellsByTag(cellTag: number): cc.Node[] {
        return this._mapCells.get(cellTag.toString());
    }
}


/**
 * @description Cell所需要的参数类型
 */
export interface BPFixedListDataParams {
    tag: number,
}

/**
 * @description BPFixedListView相关事件枚举
 */
export enum BPFixedListViewEvent {
    /**
     * 同步Cell参数事件 
    */
    OnSyncDataParams = "OnSyncDataParams",

    /**
     * 更新Cell事件 
    */
    OnCellUpdate = "OnCellUpdate",
}


/**
 * @class BPFixedList
 * @author Tinker
 * @description 可支持顶部节点固定和动态替换
 */
@CCDecorator.ccclass
@CCDecorator.disallowMultiple
@CCDecorator.requireComponent(cc.ScrollView)
export class BPFixedList extends cc.Component {
    /**
     * 
     */
    @CCDecorator.property({ tooltip: "可以被固定的Tag, 对应Prefabs引用的下标, 默认-1无固定节点" })
    public fixedTag = -1;

    /** 
     * 
     */
    @CCDecorator.property({ type: [cc.Prefab], tooltip: "Cell实例的预制体" })
    public prefabs = new Array<cc.Prefab>();

    /**
     * 
     */
    @CCDecorator.property({ tooltip: "Cell距离Content顶部和底部的边距, W目前无用" })
    public margin = new cc.Size(0.0, 0.0);

    /** 
     * 
     */
    @CCDecorator.property({ tooltip: "Cell之间的距离, W目前无用" })
    public spacing = new cc.Size(0.0, 5.0);

    /**
     * 
     */
    private _view: cc.Node = null;
    private _content: cc.Node = null;
    private _compScrollView: cc.ScrollView = null;

    /**
     * 
     */
    private _pool: BPFixedListCellPool = null;
    private _gapCache: Array<number> = null;
    private _canFixedIndexCache: Array<number> = null;

    /**
     * 
     */
    private _maxCount = 0;
    private _lastPosY: number = null;
    private _cells: Array<cc.Node> = new Array<cc.Node>();

    /**
     * 
     */
    protected override onLoad(): void {
        this._compScrollView = this.getComponent(cc.ScrollView);
        this._content = this._compScrollView.content;
        this._view = this._content.getParent();

        this._gapCache = new Array<number>();
        this._canFixedIndexCache = new Array<number>();
        this._pool = new BPFixedListCellPool(this.prefabs);

        this._content.on(cc.Node.EventType.POSITION_CHANGED, this._onContentPosChanged, this);
        cc.director.once(cc.Director.EVENT_BEFORE_DRAW, this._pack, this);
    }

    /**
     * @description 刷新view
     * @param maxCount 最大Cell数量，由数据驱动
     * @example
     * 
     * start() {
     *   listView.updateComponent(this._datas.length);
     * }
     */
    public updateComponent(maxCount: number) {
        this._maxCount = maxCount;
        this._updateContentSize();
        this._pack();
    }

    /**
     * ...
     */
    private _onContentPosChanged(): void {
        this._compScrollView["_outOfBoundaryAmountDirty"] = true;
        this._updateCellsPos();
    }

    /**
     * 
     */
    private _pack(): void {
        this._lastPosY = this._content.y;

        let [vltc, vrbc] = this._getViewBoundaryInContent();

        let cmt = BPMath.anchorPos(this._content, cc.v2(0.5, 1));
        let sIndex = locateIndex(this._gapCache, Math.abs(vltc.y - cmt.y));
        let eIndex = locateIndex(this._gapCache, Math.abs(vrbc.y - cmt.y)) + 1;

        sIndex = Math.max(sIndex, 0);
        eIndex = Math.min(eIndex, this._maxCount - 1);

        for (let index = sIndex; index < eIndex; ++index) {
            this._useCell(index);
        }
    }

    /**
     * ...
     */
    protected override onDestroy(): void {
        this._content.off(cc.Node.EventType.POSITION_CHANGED, this._onContentPosChanged, this);
    }

    /**
     * ...
     */
    private _updateContentSize(): void {
        this._gapCache = [];
        this._canFixedIndexCache = [];

        let total = 0;
        let spacingCount = Math.max(0, this._maxCount - 1);

        total = total + this.margin.height;
        for (let index = 0; index < this._maxCount; ++index) {
            let params = this._getParams(index);

            let size = this.prefabs[params.tag].data.getContentSize();
            total = total + size.height;
            total = total + (index < spacingCount ? this.spacing.height : 0);

            if (params.tag == this.fixedTag) {
                this._canFixedIndexCache.push(index);
            }

            this._gapCache.push(total);
        }
        total = total + this.margin.height;

        this._content.height = Math.max(total, this._content.height);
    }

    /**
     * 更新cell位置..
     */
    private _updateCellsPos() {
        if (this._cells.length == 0) {
            return;
        }

        if (this._content.y > this._lastPosY) {
            this._dealFixUp();
            this._dealUp();
            return;
        }

        if (this._content.y < this._lastPosY) {
            this._dealFixDown();
            this._dealDown();
            return;
        }
    }

    /**
     * 
     */
    private _getParams(index: number) {
        let params: BPFixedListDataParams = {
            tag: 0,
        };

        this.node.emit(BPFixedListViewEvent.OnSyncDataParams, index, params);
        return params;
    }

    /**
     * 获取view边界在当前content坐标系下的坐标
     */
    private _getViewBoundaryInContent() {
        let vlt = BPMath.anchorPos(this._view, cc.v2(0, 1));
        let vrb = BPMath.anchorPos(this._view, cc.v2(1, 0));

        let lt = this._vp2cp(vlt);
        let rb = this._vp2cp(vrb);

        // 有固定节点的时候边界下移固定节点的高度
        let fixedCell = this._pool.getFixedCell();
        if (fixedCell) {
            lt.y = lt.y - fixedCell.height;
        }

        return [lt, rb];
    }

    /**
     * ...
     */
    private _vp2cp(vp: cc.Vec2) {
        let wp = this._view.convertToWorldSpaceAR(vp);
        return this._content.convertToNodeSpaceAR(wp);
    }

    /**
     * ...
     */
    private _cp2vp(cp: cc.Vec2) {
        let wp = this._content.convertToWorldSpaceAR(cp);
        return this._view.convertToNodeSpaceAR(wp);
    }

    /**
     * ...
     */
    private _dealUp() {
        this._lastPosY = this._content.y;

        let [lt, rb] = this._getViewBoundaryInContent();
        let startCell = this._cells[0];
        let endCell = this._cells[this._cells.length - 1];

        // up
        let startBottom = startCell.y - startCell.anchorY * startCell.height;
        let endBottom = endCell.y - endCell.anchorY * endCell.height;

        if (startBottom > lt.y + this.spacing.height) {
            this._recycleCell("top");
        }

        if (endBottom > rb.y + this.spacing.height) {
            this._useNeighborCell(endCell, 1);
        }
    }

    /**
     * ..
     */
    private _dealDown() {
        this._lastPosY = this._content.y;

        let [lt, rb] = this._getViewBoundaryInContent();
        let startCell = this._cells[0];
        let endCell = this._cells[this._cells.length - 1];

        // down
        let startTop = startCell.y + startCell.anchorY * startCell.height;
        let endTop = endCell.y + endCell.anchorY * endCell.height;

        if (startTop < lt.y - this.spacing.height) {
            this._useNeighborCell(startCell, -1);
        }

        if (endTop < rb.y - this.spacing.height) {
            this._recycleCell("bottom");
        }
    }

    /**
     * ...
     */
    private _dealFixUp() {
        let topCell = this._cells[0];
        let [tag] = getCellInfo(topCell);

        if (tag != this.fixedTag) { return; }

        let topY = this._cp2vp(cc.v2(0, topCell.y + (1 - topCell.anchorY) * topCell.height)).y;
        let viewTopY = BPMath.anchorPos(this._view, cc.v2(0, 1)).y;

        // 
        let fixedCell = this._pool.getFixedCell();
        if (fixedCell) {
            if (topY > viewTopY - topCell.height - this.spacing.height) {
                this._switchParent(fixedCell, true);
                fixedCell.x = topCell.x;
                fixedCell.y = topCell.y + topCell.height + this.spacing.height;

                this._pool.unfix();
                this._cells.unshift(fixedCell);
            }
        }
        else {
            // 连续可固定节点不处理topCell
            let topCellNext = this._cells[1];
            if (topCellNext) {
                let [tag] = getCellInfo(topCellNext);
                if (tag == this.fixedTag) { return; }
            }

            if (topY > viewTopY) {
                this._switchParent(topCell);

                this._cells.shift();
                this._pool.fix(topCell);
            }
        }
    }

    /**
     * 
     */
    private _dealFixDown() {
        let topCell = this._cells[0];
        let [topTag, topIndex] = getCellInfo(topCell);

        let topY = this._cp2vp(cc.v2(0, topCell.y + (1 - topCell.anchorY) * topCell.height)).y;
        let viewTopY = BPMath.anchorPos(this._view, cc.v2(0, 1)).y;

        let fixedCell = this._pool.getFixedCell();
        if (fixedCell) {
            let [, fixedIndex] = getCellInfo(fixedCell);
            if (topIndex != fixedIndex + 1) { return; }

            if (topY < viewTopY - fixedCell.height - this.spacing.height) {
                this._switchParent(fixedCell);
                this._pool.unfix();
                this._cells.unshift(fixedCell);
                //cc.log("unfix cell: ", fixedCell.name);
                this._tryCreateLastCanFixCell(fixedCell);
            }
        }
        else {
            if (topTag != this.fixedTag) { return; }

            let topCellNext = this._cells[1];
            if (!topCellNext) { return; }

            let [, topNextIndex] = getCellInfo(topCellNext);
            if (topIndex == topNextIndex - 1) { return; }

            if (topY < viewTopY) {
                this._switchParent(topCell);
                //cc.log("fix cell: ", topCell.name);
                this._cells.shift();
                this._pool.fix(topCell);
            }
        }
    }

    /**
     * 
     */
    private _tryCreateLastCanFixCell(curFixedCell: cc.Node) {
        if (this.fixedTag < 0) {
            return;
        }

        if (curFixedCell == null) {
            return;
        }

        let [tag, curIndex] = getCellInfo(curFixedCell);
        if (tag != this.fixedTag) {
            return;
        }

        let targetCacheIndex = this._canFixedIndexCache.indexOf(curIndex) - 1;
        if (targetCacheIndex < 0) {
            return;
        }

        let targetIndex = this._canFixedIndexCache[targetCacheIndex];
        let newCell = this._pool.get(this.fixedTag, targetIndex);
        if (newCell.parent == null) {
            this._content.addChild(newCell);
        }

        newCell.x = curFixedCell.x;
        newCell.y = curFixedCell.y + curFixedCell.height + this.spacing.height;
        this._cells.unshift(newCell);

        cc.log("try create last can fix cell with index: ", targetIndex);
        this.node.emit(BPFixedListViewEvent.OnCellUpdate, newCell, targetIndex);
    }

    /**
     * 该cell应该在content中的位置
     */
    private _getCellPosInContent(cell: cc.Node) {
        let pos = cc.v2();
        let [tag, index] = getCellInfo(cell);

        let cmt = BPMath.anchorPos(this._content, cc.v2(0.5, 1));
        pos.x = cmt.x;
        pos.y = cmt.y - this._gapCache[index]
            + (this.spacing.height + cell.anchorY * cell.height);
        return pos;
    }

    /**
     * 显示一个节点
     */
    private _useCell(index: number, backOrFront: 1 | -1 = 1) {
        if (index < 0 || index > this._maxCount - 1) { return; }

        let params = this._getParams(index);
        let cell = this._pool.get(params.tag, index);
        let pos = this._getCellPosInContent(cell);
        cell.x = pos.x;
        cell.y = pos.y;

        if (cell.parent == null) {
            this._content.addChild(cell);
        }

        if (backOrFront == 1) {
            this._cells.push(cell);
        }
        else {
            this._cells.unshift(cell);
        }

        cc.log("update cell with index = ", index);
        this.node.emit(BPFixedListViewEvent.OnCellUpdate, cell, index);
    }

    /**
     * 显示一个邻居节点
     * @param cell 当前节点
     * @param backOrFront 1 下一个 -1 上一个
     */
    private _useNeighborCell(cell: cc.Node, backOrFront: 1 | -1) {
        let [, index] = getCellInfo(cell);
        this._useCell(index + backOrFront, backOrFront);
    }

    /**
     * 
     */
    private _recycleCell(loc: "top" | "bottom") {
        if (loc == "top") {
            this._pool.put(this._cells.shift());
        }
        else {
            this._pool.put(this._cells.pop());
        }
    }

    /**
     * 
     */
    private _switchParent(cell: cc.Node, useCustomPos: boolean = false) {
        let curParent = cell.parent;
        cell.removeFromParent(false);

        let newParent = this._view;
        if (curParent == newParent) {
            newParent = this._content;
        }
        cell.setParent(newParent);

        if (useCustomPos == true) { return; }

        if (newParent == this._view) {
            let pos = BPMath.anchorPos(this._view, cc.v2(0.5, 1));
            cell.setPosition(pos.x - (0.5 - cell.anchorX) * cell.width,
                pos.y - (1 - cell.anchorY) * cell.height);
        }
        else {
            cell.setPosition(this._getCellPosInContent(cell));
        }
    }
}