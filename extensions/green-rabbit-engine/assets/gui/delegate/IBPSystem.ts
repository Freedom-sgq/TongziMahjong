import { IBPEntity } from "./IBPEntity";

/**
 * @author Tinker
 * @date
 * @description
 */
export interface IBPSystem {

    onLoad(): void;

    onStart(): void;

    onEnable(): void;

    onDisable(): void;

    onUpdate(deltaTime: number): void;

    onDestroy(): void;

    onCheckClose(): boolean;
}