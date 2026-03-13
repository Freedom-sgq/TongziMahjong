import { BPModule } from "BPEngine";
import { zh } from "../Lang/GameStringZH";
import { en } from "../Lang/GameStringEN";

export const LangTextConfig: Array<BPModule.BPLangTextConfigType> = [
    { local: "zh", phases: zh },
    { local: "en", phases: en },
];

export const LangSpriteConfig: Array<BPModule.BPLangSpriteConfigType> = [
    //{ key: "CombatPath", path: "Combat:BPFont/Localized" },
];