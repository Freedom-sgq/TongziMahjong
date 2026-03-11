export interface IBPModel {
    parseData(text: string): void;

    getData(primaryKey: string): void;

    getDatas(primaryKey?: string): void;
}