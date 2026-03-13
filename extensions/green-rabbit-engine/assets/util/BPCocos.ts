import * as cc from 'cc';

export namespace BPCocos {
    export class BuiltinBundleName {
        static readonly RESOURCES = (cc.AssetManager.BuiltinBundleName.RESOURCES as unknown as string);
        static readonly INTERNAL = (cc.AssetManager.BuiltinBundleName.INTERNAL as unknown as string);
        static readonly MAIN = (cc.AssetManager.BuiltinBundleName.MAIN as unknown as string);
        static readonly START_SCENE = (cc.AssetManager.BuiltinBundleName.START_SCENE as unknown as string);
    }
}
