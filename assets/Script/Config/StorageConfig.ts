// 缓存配置信息
type ConfigGuard = Record<string, string>;
export const StorageConfig = {
    /** 全局音乐音效 */
    VolumGlobal: "VolumGlobal",

    /** 背景音乐 */
    VolumBGM: "VolumBGM",

    /** 音效 */
    VolumEffect: "VolumEffect",
} satisfies ConfigGuard;