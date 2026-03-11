import { BPCacheBase } from "../../data/BPCacheBase";
import { BPModelBase } from "../../data/BPModelBase";

export interface BPEntityPanel {
    [key: string]: cc.Component | cc.Node
}

export interface BPEntityModel {
    [key: string]: BPModelBase;
}

export interface BPEntityCache {
    [key: string]: BPCacheBase;
}

export interface BPEntityCustom {
    [key: string]: any;
}

/**
 * @author
 * @date
 * @description 
 */
export interface IBPEntity {
    panel: BPEntityPanel;
    model: BPEntityModel;
    cache: BPEntityCache;
    custom: BPEntityCustom;
}