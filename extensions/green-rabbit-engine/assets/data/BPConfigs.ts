/**
 * @author Tinker
 * @date
 * @description
 */
import { BPViewAnimType, BPViewBase } from "../component/controls/BPViewBase";
import { BPSystemBase } from "../gui/delegate/BPSystemBase";
import { BPEntityBase } from "../gui/delegate/BPEntityBase";
import { BPCacheBase } from "./BPCacheBase";
import { BPModelBase } from "./BPModelBase";
import { BPClassType } from "../util/BPType";
import { BPCmdUnit } from "../event/BPCmdUnit";

/**
 * view
 */
export interface BPViewConfig {
    viewName: string;
    viewUrl: string;
    systemClass?: { new(view: BPViewBase, entity: BPEntityBase): BPSystemBase };
    entityClass?: { new(view: BPViewBase, ...args: any[]): BPEntityBase };
    useModal?: boolean;
    useMask?: boolean;
    useBlankClose?: boolean;
    anim?: BPViewAnimType;
    multiple?: boolean;
    isFoundation?: boolean;
}

/**
 * model
 */
export interface BPModelInfo {
    dict: string;
    cls: BPClassType<BPModelBase>;
    dir?: string;
}

export type BPModelConfig = BPModelInfo[];

/**
 * cache
 */
export type BPCacheInfo = BPClassType<BPCacheBase>;
export type BPCacheConfig = BPCacheInfo[];

/**
 * audio
 */
export interface BPAudioInfo {
    name: string;
    channel: number;
    path: string;
    maxInsCount?: number;
}

export type BPAudioConfig = BPAudioInfo[];

/**
 * 业务网络数据格式
 */
export interface BPNetMsgConfig {
    msgCodes: { [key: string]: string | number };
    msgClses: { [key: string]: any };
}

/**
 * 指令配置
 */
export type BPCmdCallback = (res: { next?: number }) => void;
export type BPCmdInfo = Array<(cumdUnit: BPCmdUnit, next: BPCmdCallback, ...params: any[]) => void>;

export interface BPCmdConfig {
    [key: string]: BPCmdInfo;
}

/**
 * 平台接口配置
 */
export type BPPlatformConfig = BPPlatformInfo[];
export interface BPPlatformInfo {
    key: string;
    cls?: string;
    method?: string;
    sign?: string;
    proxy?: (...args: any[]) => any;
}