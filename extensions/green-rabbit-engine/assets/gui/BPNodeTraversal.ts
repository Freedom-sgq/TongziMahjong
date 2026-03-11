import { BPLog } from "../util/BPLog";
import { BPMap } from "../struct/BPMap";
import { BPQueue } from "../struct/BPQueue";

/**
 * @author Tinker
 * @date 
 * @description 遍历View节点的类
 */
export class BPNodeTraversal {
    private _root: cc.Node;

    /**
     * @description 广度遍历节点队列现场保存，方便递进式遍历
     */
    private _nodeQueue = new BPQueue<cc.Node>();

    /**
     * @description 节点缓存，优先从缓存取节点，取不到递进遍历
     */
    private _nodeCache = new BPMap<cc.Node>();

    /**
     * 
     */
    constructor(inRoot: cc.Node) {
        this._root = inRoot;
        this._nodeQueue.push(inRoot);
    }

    /**
     * @description 缓存和递进获取节点树中的节点,效率高
     * @param {boolean} isDynamicNode 获取的是否为动态添加的节点
     */
    public getNode(inNodeName: string, isDynamicNode: boolean = false): cc.Node {
        // 缓存有就返回
        let outNode = this._nodeCache.get(inNodeName);
        if (outNode) {
            return outNode;
        }

        if (isDynamicNode == true) {
            if (this._nodeQueue.size == 0) {
                this._refresh();
            }
        }

        // 没有就递进广度遍历
        return this._getNodeBFSIncremental(inNodeName);
    }

    /**
     * @description 遍历获取节点树中的节点，效率一般
     */
    public findNode(inNodeName: string): cc.Node {
        return this._getNodeDFS(inNodeName);
    }

    /**
     * @description 深度全遍历，全量缓存
     */
    public walkNode(inNode: cc.Node): void {
        if (!cc.isValid(inNode, true)) {
            return;
        }

        let children = inNode.children;
        for (let i = 0; i < children.length; ++i) {
            let child = children[i];
            if (child) {
                this._nodeCache.set(child.name, child);
            }
            this.walkNode(child);
        }
    }

    /**
     * @description 刷新遍历队列
     */
    private _refresh(): void {
        this._nodeQueue.clear();
        this._nodeQueue.push(this._root);
        this._nodeCache.clear();
    }

    /**
     * @description 深度查询
     */
    private _getNodeDFS(inName: string, inRoot: cc.Node = this._root): cc.Node {
         if (inRoot.name == inName) {
            return inRoot;
        }

        let children = inRoot.children;
        for (let i = 0; i < children.length; ++i) {
            let child = children[i];
            if (child.name == inName) {
                return child;
            }

            this._getNodeDFS(inName, child);
        }

        return null;
    }

    /**
     * @description 广度增量查询
     */
    private _getNodeBFSIncremental(inName: string): cc.Node {
        let queue = this._nodeQueue;

        while (queue.size > 0) {
            let root = queue.front();
            this._nodeCache.set(root.name, root);

            let children = root.children;
            for (let i = 0; i < children.length; ++i) {
                let child = children[i];
                queue.push(child);
            }

            if (root.name == inName) {
                return root;
            }
        }

        // 遍历完了没有
        //BPLog.engine(`This ui:${this._root.name} has no node of name: ${inName}...`);
        return null;
    }

}