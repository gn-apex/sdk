import { I as ILocalCache } from '../cache-types-B39iNHfE.js';

/**
 * GnApex LocalCache (Browser Implementation)
 *
 * This is a dummy implementation used when the SDK is bundled for the browser.
 * Since the browser has no access to the Node.js File System (fs), this
 * implementation returns null for all operations.
 *
 * The real logic is located in local-cache-server.ts and is swapped
 * automatically by the bundler via the "browser" field in package.json.
 */
declare class LocalCache implements ILocalCache {
    private data;
    private hasLoaded;
    private cachePath;
    constructor(customPath?: string);
    /**
     * Always returns false in the browser as local file caching
     * is a server-side only feature.
     */
    isLoaded(): boolean;
    /**
     * No-op method to maintain internal API compatibility.
     */
    private load;
    /**
     * Returns null. Browsers should fetch pages from the Remote API
     * or the Memory/Browser cache.
     */
    getPage(_slug: string): Promise<any>;
    /**
     * Returns null. Browsers should fetch collections from the Remote API.
     */
    getCollection(_collectionId: string): Promise<any[] | null>;
    /**
     * Returns null.
     */
    getGlobals(): Promise<any>;
    /**
     * Returns null.
     */
    getAllData(): Promise<any>;
    /**
     * Dummy helper to match Node implementation.
     */
    private shouldWarnAboutMissingCache;
}

export { LocalCache };
