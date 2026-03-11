/**
 * @author Tinker
 * @date
 * @description
 */

import { BPEntityBase } from "./BPEntityBase";
import { BPSystemBase } from "./BPSystemBase";

export interface IBPDelegateFactory {
    createSystem(...args: any[]): BPSystemBase;

    createEntity(...args: any[]): BPEntityBase;
}