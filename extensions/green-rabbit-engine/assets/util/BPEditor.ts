/**
 * @author
 * @date
 * @description
 */
export class BPEditor {
    
    /**
     * 
     */
    static refreshInspector(node: cc.Node): void {
        if (!CC_EDITOR) return;

        if (node == null) {
            return;
        }

        Editor.Utils.refreshSelectedInspector('node', node.uuid);
    }

    /**
     * 
     */
    static updateInspectorAttr(comp: cc.Component, names: string[], keys: string[], values: any[]): void {
        if (!CC_EDITOR) return;

        if (names.length != keys.length) {
            Editor.error("BPEditor, names and keys length not equal!");
            return;
        }

        if (names.length != values.length) {
            Editor.error("BPEditor, names and values length not equal!");
            return;
        }

        for (let i = 0; i < names.length; ++i) {
            let name = names[i];
            let value = values[i];
            let key = keys[i];

            BPEditor.log(`set component attr: ${name} of ${comp.name}'s ${key} as ${value}...`);
            cc.Class["Attr"].setClassAttr(cc.ScrollView, name, keys, value);
        }
    }

    /**
     * 
     */
    static error(...args: any[]): void {
        if (!CC_EDITOR) return;
        Editor.error(args);
    }

    /**
     * 
     */
    static log(...args: any[]): void {
        if (!CC_EDITOR) return;
        Editor.log(args);
    }

    /**
     * 
     */
    static warn(...args: any[]): void {
        if (!CC_EDITOR) return;
        Editor.warn(args);
    }
}