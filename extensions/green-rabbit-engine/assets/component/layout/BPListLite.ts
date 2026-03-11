import { BPModule, bp } from "BPEngine";
import { BPDecorator as BPDec } from "../../util/BPDecorator";
import { BPComponentBase } from "../BPComponentBase";
import { BPListCellBase } from "./BPListCellBase";
import { BPLog } from "../../util/BPLog";
import { BPMath } from "../../util/BPMath";

const EPSILON = 1e-6;

class BPListLiteCellPool {
    private _prefabs = null;
    private _mapCells = new BPModule.BPMap<cc.Node[]>();

    constructor(prefabs: cc.Prefab[]) {
        this._prefabs = prefabs;
        for (let i = 0; i < prefabs.length; i++) {
            this._mapCells.set(i.toString(), new Array<cc.Node>());
        }
    }

    /**
     *  放
     */
    public put(cell: cc.Node) {
        if (!cell) return;

        //cell.setPosition(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER);
        cell.y = Number.MAX_SAFE_INTEGER;
        cell.opacity = 0;

        const cellComp = cell.getComponent(BPListCellBase);
        if (!cellComp) {
            BPLog.error("预制体上没挂 BPListCellBase ...");
            return;
        }

        let cells = this._mapCells.get(cellComp.tag.toString());
        cells.push(cell);
    }

    /**
     *  取
     */
    public get(index: number, tag: number = 0) {
        let cells = this._mapCells.get(tag.toString());
        let outCell = cells.pop();
        if (!outCell) {
            outCell = cc.instantiate(this._prefabs[tag]);
        }

        const cellComp = outCell.getComponent(BPListCellBase);
        if (!cellComp) {
            BPLog.error("预制体上没挂 BPListCellBase ...");
            return;
        }

        cellComp.tag = tag;
        cellComp.index = index;
        outCell.opacity = 255;
        return outCell;
    }
}

export enum BPListLiteOrder {
    Front = 1,
    Push = 0,
}

/**
 * 轻量级List
 * 适合算不出来Cell实例的情况
 * 如：富文本元素；比较适合做聊天
 * 预制体必须是个BPListCellBase组件
 */
@BPDec.ccclass
@BPDec.disallowMultiple
//@BPDec.executeInEditMode
@BPDec.menu("BPComponents/BPListLite")
@BPDec.requireComponent(cc.ScrollView)
export class BPListLite extends BPComponentBase {
    /**
     *  预制体组
     */
    @BPDec.property({ type: [cc.Prefab] })
    private _cellPrefabs: cc.Prefab[] = [];

    @BPDec.property({ type: [cc.Prefab] })
    public get cellPrefabs(): cc.Prefab[] {
        return this._cellPrefabs;
    }

    public static readonly OnCreateCell = "OnCreateCell";
    public static readonly OnUpdateCell = "OnUpdateCell";

    /**
     * 
     */
    private _cellPool: BPListLiteCellPool = null;
    private _scrollView: cc.ScrollView = null;
    private _content: cc.Node = null;

    /**
     * 
     */
    private _cells: cc.Node[] = [];
    private _lastContentY: number = null;


    /**
     *  通过数据初始化
     */
    private _datas: any[] = null;
    public set datas(value: any[]) {
        this._datas = value ?? [];
        this.maxCount = this._datas.length;
    }

    public get datas(): any[] {
        return this._datas;
    }

    /**
     * 通过数量初始化
     */
    private _maxCount = 0;
    public set maxCount(value: number) {
        if (value < 0) { return; }
        this._maxCount = value;
    }

    public get maxCount(): number {
        return this._maxCount;
    }

    /**
     * 
     */
    protected onLoad(): void {
        this._cellPool = new BPListLiteCellPool(this._cellPrefabs);
        this._scrollView = this.getComponent("cc.ScrollView");
        this._content = this._scrollView.content;
        this._content.on(cc.Node.EventType.POSITION_CHANGED, this._onContentPosChanged, this);
    }

    /**
     * 
     */
    private _getListBoundaryInContent() {
        let listLT = BPMath.anchorPos(this._scrollView.node, cc.v2(0, 1));
        let listRB = BPMath.anchorPos(this._scrollView.node, cc.v2(1, 0));

        let lt = BPMath.posInOtherNode(this._scrollView.node, this._content, listLT);
        let rb = BPMath.posInOtherNode(this._scrollView.node, this._content, listRB);

        return [lt, rb];
    }

    /**
     * 
     */
    private _onContentPosChanged(): void {
        //this._scrollView["_outOfBoundaryAmountDirty"] = true;
        if (this._maxCount <= 0) return;
        if (this._cells.length == 0) return;
        if (this._lastContentY == null) return;

        if (this._content.y - this._lastContentY > EPSILON) {
            this._updateContentUp();
        }

        if (this._content.y - this._lastContentY < -EPSILON) {
            this._updateContentDown();
        }

        this._lastContentY = this._content.y;
    }

    /**
     * 
     */
    _updateContentUp() {
        const [listLT, listRB] = this._getListBoundaryInContent();
        const startCell = this._cells[0];
        const endCell = this._cells[this._cells.length - 1];

        const startBot = BPMath.anchorPosParent(startCell, cc.v2(0, 0)).y;
        const endBot = BPMath.anchorPosParent(endCell, cc.v2(0, 0)).y;

        // 最上面得节点底部大于scrollview顶部边界
        // 且最下面节点底部小于scrollview底部边界
        if (startBot > listLT.y && endBot < listRB.y) {
            this._cellPool.put(this._cells.shift());
            //cc.log("shift ==> ", this._cells)
        }

        if (endBot > listRB.y) {
            this._concatCell(endCell, BPListLiteOrder.Push);
        }
    }

    /**
     * 
     */
    _updateContentDown() {
        const [listLT, listRB] = this._getListBoundaryInContent();
        const startCell = this._cells[0];
        const endCell = this._cells[this._cells.length - 1];

        const startTop = BPMath.anchorPosParent(startCell, cc.v2(0, 1)).y;
        const endTop = BPMath.anchorPosParent(endCell, cc.v2(0, 1)).y;

        if (startTop < listLT.y) {
            this._concatCell(startCell, BPListLiteOrder.Front);
        }

        // 最下面得节点底部小于scrollview底部边界
        // 且最上面节点底部大于于scrollview顶部边界
        if (endTop < listRB.y && startTop > listLT.y) {
            this._cellPool.put(this._cells.pop());
            //cc.log("pop ==> ", this._cells)
        }
    }

    /**
     * 
     */
    private _reset() {
        this._cells.forEach(cell => {
            this._cellPool.put(cell);
        });
        this._cells = [];
        this._content.height = 0/*this._scrollView.node.height*/;
        this._scrollView.stopAutoScroll();
    }

    /**
     * 起始数据索引,默认从0开始
     * @param start 从第几个数据开始
     * @param frontOrPush 排列顺序是叠还是推,默认是推
     * @example (5, 0) => 5, 6, 7, 8...
     * @example (5, 1) => ...2, 3, 4, 5
    */
    public updateComponent(start: number = 0, frontOrPush: BPListLiteOrder = BPListLiteOrder.Push) {
        this._reset();

        if (this._maxCount <= 0) return;

        // 1.先创建出来 求高度...
        let cellsHeight = 0;
        // front ↑ push ↓
        for (let i = start;
            i < this._maxCount && i >= 0;
            i = i + (frontOrPush ? -1 : 1)) {
            // 拿cell
            const cell = this._makeCell(i, frontOrPush);
            // 统计高度
            cellsHeight += cell.height;
            if (cellsHeight >= this._scrollView.node.height) {
                // 刚好大于scrollView高度就停止
                break;
            }
        }
        // 同步高度给content;
        this._content.height = cellsHeight;
        // this._content.height = Math.max(this._content.height, this._scrollView.node.height);

        // 2.起始对齐点，排列
        let posY = BPMath.anchorPos(this._content, cc.v2(0, 1 - frontOrPush)).y;
        for (let i = frontOrPush ? this._cells.length - 1 : 0;
            i < this._cells.length && i >= 0;
            i = i + (frontOrPush ? -1 : 1)) {
            const cell = this._cells[i];
            // 排列
            cell.y = posY - BPMath.anchorPos(cell, cc.v2(0, 1 - frontOrPush)).y;  // cell坐标
            posY = BPMath.anchorPosParent(cell, cc.v2(0, frontOrPush)).y;     // 新的对齐点
        }

        // 3.定位位置
        frontOrPush && cellsHeight > this.node.height ? this._scrollView.scrollToBottom() : this._scrollView.scrollToTop();
        this._lastContentY = this._content.y;
    }

    /**
     *  推一个节点进去
     */
    pushCell() {
        this._maxCount = this._maxCount + 1;
        this._updateContentUp();
    }

    checkCellExistByIndex(index: number): boolean {
        if (index < 0) return false;

        const len = this._cells.length;
        for (let i = 0; i < len; ++i) {
            if (this._cells[i].getComponent(BPListCellBase).index === index) {
                return true;
            }
        }

        return false;
    }

    /**
     *  获取一个已经更新好的Cell实例
     */
    private _makeCell(index: number, frontOrPush: BPListLiteOrder) {
        let params = { tag: 0 };
        this.node.emit(BPListLite.OnCreateCell, index, params);

        const cell = this._cellPool.get(index, params.tag);
        // 挂节点
        cell.parent == null && this._content.addChild(cell);

        // 更新缓存
        if (frontOrPush) {
            this._cells.unshift(cell);
        }
        else {
            this._cells.push(cell);
        }

        // 推更新事件
        this.node.emit(BPListLite.OnUpdateCell, cell);

        return cell;
    }

    /**
     * 在列表顶部或者底部新增一个Cell
     */
    private _concatCell(baseCell: cc.Node, frontOrPush: BPListLiteOrder) {
        const cellComp = baseCell.getComponent(BPListCellBase);
        if (!cellComp) {
            BPLog.error("concatCell失败, 没有BPListCellBase ...");
        }

        const index = cellComp.index;
        const targetIndex = index + (frontOrPush ? -1 : 1);
        if (targetIndex < 0 || targetIndex >= this._maxCount) {
            //BPLog.logLogic("没数据了...");
            return;
        }

        // 根据临近粘节点规则，计算位置
        const targetCell = this._makeCell(targetIndex, frontOrPush);
        const basePos = BPMath.anchorPosParent(baseCell, cc.v2(0, frontOrPush)).y;
        targetCell.y = basePos - BPMath.anchorPos(targetCell, cc.v2(0, 1 - frontOrPush)).y;

        // 是否需要更新content高度
        let bNeedGrow = false;
        const y1 = BPMath.anchorPosParent(targetCell, cc.v2(0, frontOrPush)).y
        const y2 = BPMath.anchorPos(this._content, cc.v2(0, frontOrPush)).y
        if (frontOrPush == BPListLiteOrder.Front) {
            bNeedGrow = y1 - y2 > EPSILON;
        }
        else if (frontOrPush == BPListLiteOrder.Push) {
            bNeedGrow = y1 - y2 < -EPSILON;
        }

        // 需要处理content生长
        if (bNeedGrow) {
            this._packContentAndCells(targetCell.height, frontOrPush);
        }
    }

    /**
     * 更新content高度和位置
     */
    private _packContentAndCells(height: number, frontOrPush: BPListLiteOrder) {
        const content = this._content;
        const scrollView = this._scrollView;
        if (content == null || scrollView == null) {
            return;
        }

        // content
        const anchorY = content.anchorY;
        const deltaPosY = height * (frontOrPush - 1 + anchorY);
        const _autoScrollPos = scrollView["_autoScrollStartPosition"];
        _autoScrollPos && (_autoScrollPos.y += deltaPosY);
        content.height += height;

        this._cells.forEach((cell) => {
            cell.y -= deltaPosY;
        })

        // 最后再变化坐标，因为会触发事件
        content.y += deltaPosY;
    }
}