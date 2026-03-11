/**
 * @author Tinker
 * @date
 * @description
 */
export class BPImport {
    /**
     * @param moduleName  模块名
     * @param args 构造函数参数
     * @description 动态导入
     * 
     */
    public static createDefaultInstance(moduleName: string, ...args: any[]) {
        return import(moduleName).then((module) => {
            return new module.default(...args);
        });
    }

}