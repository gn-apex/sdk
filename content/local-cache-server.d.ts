import { I as ILocalCache } from '../cache-types-B39iNHfE.js';

declare class LocalCache implements ILocalCache {
    private baseDir;
    private apiKey;
    constructor(customPath?: string, apiKey?: string);
    isLoaded(): boolean;
    private decompileFile;
    /**
     * Retrieve a specific page safely from its .nx file.
     */
    getPage(slug: string): Promise<any>;
    /**
     * Retrieve an entire collection safely from its specific .nx file.
     */
    getCollection(collectionId: string): Promise<any[] | null>;
    /**
     * Retrieve global settings from its .nx file.
     */
    getGlobals(): Promise<any>;
    /**
     * Returns a merged JSON of the entire workspace structure.
     */
    getAllData(): Promise<any>;
}

export { LocalCache };
