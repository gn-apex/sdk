interface ILocalCache {
    isLoaded(): boolean;
    getPage(slug: string): Promise<any>;
    getCollection(collectionId: string): Promise<any[] | null>;
    getGlobals(): Promise<any>;
    getAllData(): Promise<any>;
}

export type { ILocalCache as I };
