import * as cc from 'cc';
import { BPLog } from "../util/BPLog";
import { BPLoader } from "../res/BPLoader";
import { BPMap } from "../struct/BPMap";
import { BPSingletonBase } from "../struct/BPSingletonBase";
import { BPString } from "../util/BPString";
import { BPModelBase } from "./BPModelBase";
import { BPResManager } from "../res/BPResManager";
import { BPObj } from "../util/BPObj";
import { BPClassType } from "../util/BPType";
import { BPModelConfig, BPModelInfo } from "./BPConfigs";
import { BPCocos } from "../util/BPCocos";

type CCAsset = cc.Asset;
type CCRequestItem = cc.AssetManager.RequestItem;
type ProgressCallBack = (finish: number, total: number, item: CCRequestItem) => void;
type CompleteCallBackArray<T extends CCAsset> = (err: Error, assets: Array<T>) => void;

/**
 * 解析过程数据结构
 */
interface ModelInfo {
    name: string,
    dir: string,
    path: string,
    bundle: string;
    cls: BPClassType<BPModelBase>,
}

/**
 * @author Tinker
 * @date
 * @description
 */
export class BPModelManager extends BPSingletonBase {
    private _loader: BPLoader = null;
    private _modelInfos: BPMap<ModelInfo> = null;
    private _instanceCache: BPMap<BPModelBase> = null;
    private _defaultFolder: string = "";

    protected constructor() {
        super();

        this._loader = new BPLoader(true);
        this._modelInfos = new BPMap<ModelInfo>();
        this._instanceCache = new BPMap<BPModelBase>();
    }

    /**
     *  @param dir 默认读取路径,不传就是App包下得Dict/
     *  @example init(config, "App:Dict/")
     */
    public init(config: BPModelConfig, dir?: string): void {
        this._defaultFolder = "App:Dict";
        
        for (let key in config) {
            let info = config[key];
            this._parseModelConfig(key, info);
        }

        if (dir) {
            this._defaultFolder = dir;
        }
    }

    /**
     * 是否需要模糊查询
     * name_ => [name_1, name_2, name_3, name_4]
     */
    private _isfuzzyName(modelResName: string): boolean {
        return BPString.isEndOf(modelResName, "_");
    }

    /**
     * 解析配置信息
     * 生成配置数据
     */
    private _parseModelConfig(key: string, info: BPModelInfo) {
        const dir = info.dir || this._defaultFolder;
        let [bundle, path] = BPString.split(dir + "/" + info.dict, ":");
        if (path == null) {
            path = bundle;
            bundle = BPCocos.BuiltinBundleName.RESOURCES;
        }

        let data: ModelInfo = {
            name: info.cls.name,
            bundle: bundle,
            path: path,
            dir: dir,
            cls: info.cls
        };

        this._modelInfos.set(key, data);
    }

    /**
     * 
     */
    private _makeFuzzyDatas(data: ModelInfo) {
        return new Promise<Array<ModelInfo>>((resolve, reject) => {
            BPResManager.getInstance().loadBundle(data.bundle, (err, bundle) => {
                if (err) {
                    reject(err);
                    return;
                }

                let outDatas = new Array<ModelInfo>();
                if (this._isfuzzyName(data.name)) {
                    // TODO: 可以动态传类型
                    let infos = bundle.getDirWithPath(data.dir);
                    for (let i = 0; i < infos.length; ++i) {
                        let info = infos[i];
                        // bundle配置中的path字符串是否符合模糊匹配
                        if (info.path.indexOf(data.path) == -1) continue;

                        let newData = BPObj.deepCopy(data);
                        let sub = BPString.lastToEnd(info.path, "_");
                        newData.path += sub;
                        newData.name += sub;
                        outDatas.push(newData);
                    }
                }
                else {
                    outDatas.push(data);
                }

                resolve(outDatas);
            });
        });
    }

    /**
     * 加载所有配置过的model文件
     */
    public loadAll(inOnProgress: ProgressCallBack, inOnComplete: () => void, onError: (error: Error, path: string) => void): void {
        const promises: Promise<Array<ModelInfo>>[] = [];

        this._modelInfos.forEach((name, data) => {
            promises.push(this._makeFuzzyDatas(data));
        });

        Promise.all(promises).then((dataLists: ModelInfo[][]) => {
            let tempDataList: ModelInfo[] = [];
            dataLists.forEach((list) => {
                list.forEach((data) => {
                    tempDataList.push(data);
                })
            });

            if (tempDataList.length == 0) {
                BPLog.error("no any dict files ...");
                inOnComplete?.();
                return;
            }

            let count = 0;
            tempDataList.forEach((data) => {
                this._loader.loadRes(data.bundle, data.path,
                    (error: Error, asset: cc.TextAsset | cc.JsonAsset) => {
                        if (error) {
                            onError?.(error, data.path);
                            BPLog.error(error);
                            return;
                        }

                        count = count + 1;
                        inOnProgress?.(count, tempDataList.length, null);

                        // 缓存
                        let instance = new data.cls();
                        BPLog.engine(data.cls.name);
                        if (asset instanceof cc.JsonAsset) {
                            instance.parseData(asset.json);
                        }
                        else {
                            instance.parseData(asset.text);
                        }
                        // TODO这里不支持模糊加载了
                        this._instanceCache.set(data.cls.name, instance);

                        // 全加载完了
                        if (count == tempDataList.length) {
                            this._loader.releaseAll();
                            inOnComplete?.();
                        }
                    }
                );
            });

        });
    }

    /**
     * 提供两种函数重载，都提供类型推导
     * @example
     */
    public getModel<T extends BPModelBase>(modelCls: BPClassType<T> | string): T {
        let name: string = "";
        if (typeof modelCls != "string") {
            name = modelCls.name
        }
        else {
            name = modelCls;
        }
        return this._instanceCache.get(name) as T;
    }

    /**
     * ....
     */
    public destroy(): void {
        super.destroy();
        this._loader.destroy();
        this._modelInfos.clear();
        this._instanceCache.clear();
        this._defaultFolder = "";
    }
}