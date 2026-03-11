import { BPProtocolEvents } from "./BPProtocolBase";

/**
 * ....
 */
export type BPNetBufferType = (string | ArrayBufferLike | Blob | ArrayBufferView);

/**
 * ....
 */
export type BPProtocolOptionsType = {
    protocol?: string,
    host?: string,
    port?: number,
    url?: string,
    binaryType?: BinaryType,
}

/**
 * ....
 */
export interface IBPSocketProtocol {
    connect(options: BPProtocolOptionsType): boolean;

    send(buffer: BPNetBufferType): number;

    startHeartbeat(): void;

    onHeartbeatInterval(): void;

    close(reason?: string): void;

    isValid(): boolean;

    bindEventsAndHeartBeat(events: BPProtocolEvents, sendHeartBeatFunction: Function): void;
}