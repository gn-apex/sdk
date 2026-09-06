import { I as ILocalCache } from './cache-types-B39iNHfE.cjs';

/**
 * GnApex Shared Cache Implementations
 *
 * Contains MemoryCache (LRU) and BrowserCache (LocalStorage)
 * which are safe for universal usage.
 */
interface CacheOptions {
    maxSize?: number;
    ttl?: number;
    /** false means platform-controlled immutable cache. */
    revalidate?: number | false;
    tags?: string[];
}
interface CacheStats {
    size: number;
    hits: number;
    misses: number;
    hitRate: number;
    evictions: number;
}
declare const CacheTags: {
    project: (projectId: string) => string;
    content: (slug: string) => string;
    collection: (collectionId: string) => string;
    global: string;
    user: (userId: string) => string;
    media: (mediaId: string) => string;
};
declare class MemoryCache {
    private cache;
    private tagIndex;
    private stats;
    private maxSize;
    private defaultTTL;
    constructor(options?: CacheOptions);
    set<T = any>(key: string, data: T, options?: CacheOptions): void;
    get<T = any>(key: string): {
        data: T;
        metadata: any;
    } | null;
    delete(key: string): boolean;
    invalidateByTags(tags: string[]): void;
    clear(): void;
    getStats(): CacheStats;
    private evictLRU;
    private calculateSize;
    private updateHitRate;
}
declare class BrowserCache {
    private projectId;
    private prefix;
    private maxSize;
    private currentSize;
    constructor(projectId: string);
    set<T = any>(key: string, data: T, ttl?: number): void;
    get<T = any>(key: string): T | null;
    delete(key: string): void;
    clear(): void;
    private getStorageKey;
    private calculateCurrentSize;
    private calculateStorageSize;
    private evictOldest;
}

interface MinimalNexusConfig {
    apiUrl?: string;
    analyticsUrl?: string;
    apiKey?: string;
    projectId?: string;
}
declare const DEFAULT_API_URL = "https://api.gnapex.com";
declare const DEFAULT_ANALYTICS_URL = "https://sentry.gnapex.com";
declare const SDK_VERSION = "1.1.0";
declare const LOCAL_NEST_URL = "https://api.gnapex.com";
declare const LOCAL_RUST_URL = "https://sentry.gnapex.com";
/**
 * Automatically discovers runtime configuration across:
 * 1. Window Global (__GNAPEX__ or __NEXUS__)
 * 2. HTML Meta Tags (<meta name="gnapex-project"> / <meta name="nexus-project">)
 * 3. Next.js Public Environment Variables (NEXT_PUBLIC_GNAPEX_* / NEXT_PUBLIC_NEXUS_*)
 * 4. Node.js Standard Process Variables (GNAPEX_* / NEXUS_*)
 */
declare const getEnvConfig: () => MinimalNexusConfig;
/**
 * Merges discovered configuration with manual constructor overrides
 */
declare const mergeConfigs: (base: MinimalNexusConfig, override: Partial<MinimalNexusConfig>) => MinimalNexusConfig;
/**
 * Returns complete resolved configuration snapshot
 */
declare const getFullConfig: (partialConfig?: Partial<MinimalNexusConfig>) => MinimalNexusConfig;
/**
 * Validates configuration integrity
 */
declare const validateConfig: (config: MinimalNexusConfig) => string[];
/**
 * Helper to check if required keys exist
 */
declare const hasRequiredConfig: (config: MinimalNexusConfig) => boolean;

interface NexusConfig extends MinimalNexusConfig {
    debug?: boolean;
    cacheStrategy?: "memory" | "localStorage" | "none";
    revalidateTime?: number | false;
    timeout?: number;
    retries?: number;
    /** Internal/runtime version; populated automatically. */
    sdkVersion?: string;
    /** GN-Apex owns cache invalidation. Forever is intentional by default. */
    cacheInvalidation?: "platform" | "manual";
    environment?: "development" | "staging" | "production";
    privacy?: {
        analytics?: boolean;
        fingerprinting?: boolean;
        redact?: boolean;
    };
    autoTracking?: boolean;
    publicKeyOnly?: boolean;
}
interface NexusConfig {
    projectId: string;
    apiUrl: string;
}
interface ContentResponse<T = any> {
    id: string;
    type: string;
    data: T;
    meta: {
        version: number;
        updatedAt: string;
        locale?: string;
        cacheStatus: "hit" | "miss" | "stale";
    };
}
interface CollectionResponse<T = any> {
    items: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
    meta?: {
        fetchedAt: string;
        cacheStatus: string;
        filters?: Record<string, any>;
    };
}
interface CacheMetadata {
    timestamp: number;
    etag?: string;
    expiresAt: number;
    tags: string[];
}
interface CacheEntry<T = any> {
    data: T;
    metadata: CacheMetadata;
}
interface CollectionQuery {
    page?: number;
    limit?: number;
    sort?: string;
    order?: "asc" | "desc";
    filter?: Record<string, any>;
    fields?: string[];
    search?: string;
    include?: string[];
}
interface ErrorResponse {
    code: string;
    message: string;
    details?: any;
    timestamp: string;
}

declare class ContentEngine {
    private config;
    private localCache;
    private memoryCache;
    private browserCache?;
    private rateLimiter;
    private backoff;
    private requestBatcher;
    private circuitBreaker;
    private defaultRevalidate;
    private cacheStrategy;
    private isServer;
    constructor(config: NexusConfig);
    updateConfig(config: NexusConfig): void;
    getPage<T = any>(slug: string, options?: {
        revalidate?: number | false;
        tags?: string[];
        forceRefresh?: boolean;
        includeMetadata?: boolean;
    }): Promise<T>;
    private _getPage;
    getCollection<T = any>(collectionId: string, query?: CollectionQuery, options?: {
        revalidate?: number | false;
        tags?: string[];
        forceRefresh?: boolean;
        includeMetadata?: boolean;
    }): Promise<CollectionResponse<T>>;
    getGlobals<T = any>(options?: {
        include?: string[];
        revalidate?: number | false;
        forceRefresh?: boolean;
        tags?: string[];
    }): Promise<T>;
    getItem<T = any>(collectionId: string, itemId: string, options?: {
        revalidate?: number | false;
        tags?: string[];
        include?: string[];
        forceRefresh?: boolean;
    }): Promise<T>;
    search<T = any>(query: string, options?: {
        collections?: string[];
        fields?: string[];
        limit?: number;
        revalidate?: number | false;
        forceRefresh?: boolean;
    }): Promise<{
        results: T[];
        total: number;
    }>;
    prefetch(urls: string[]): Promise<void>;
    subscribeToUpdates(callback: (data: any) => void): () => void;
    private writeCache;
    invalidateCache(tags: string[]): void;
    clearCache(): void;
    getCacheStats(): {
        memory: CacheStats;
        local: {
            loaded: boolean;
        };
    };
    private fetchPage;
    private fetchCollection;
    private applyLocalQuery;
    private fetchWithTimeout;
    private getHeaders;
    private isCacheValid;
    private normalizeError;
    cleanup(): void;
}

declare class AnalyticsEngine {
    private tracker;
    private cleanupFns;
    private isInitialized;
    private maxScrollDepth;
    private scrollThresholdsFired;
    private scrollTimer?;
    constructor(config: NexusConfig);
    start(): void;
    private lastPath;
    pageView(customReferrer?: string): void;
    private setupShareTracking;
    private setupScrollTracking;
    private clickBuffer;
    private setupClickTracking;
    private setupFormTracking;
    private setupOutboundTracking;
    private setupVideoTracking;
    private setupErrorTracking;
    private setupRouteTracking;
    private isInitializedByReactProvider;
    identify(userId: string, traits?: Record<string, any>): Promise<boolean>;
    group(groupId: string, traits?: Record<string, any>): Promise<boolean>;
    alias(newId: string): Promise<boolean>;
    reset(performGdprScrub?: boolean): void;
    track(eventName: string, properties?: Record<string, any>): void;
    trackPurchase(orderData: {
        orderId: string;
        total: number;
        revenue?: number;
        currency?: string;
        products: Array<{
            id: string;
            name: string;
            price: number;
            quantity: number;
            sku?: string;
        }>;
    }): void;
    trackError(error: Error, context?: Record<string, any>): void;
    private sendIdentityRequest;
    getSessionId(): string;
    stop(isFinalShutdown?: boolean): void;
}

type NexusEventMap = {
    "request:start": {
        requestId: string;
        url: string;
        method: string;
    };
    "request:end": {
        requestId: string;
        url: string;
        status: number;
        duration: number;
    };
    "cache:hit": {
        key: string;
        stale?: boolean;
    };
    "cache:miss": {
        key: string;
    };
    "analytics:queued": {
        count: number;
    };
    "analytics:flushed": {
        sent: number;
        remaining: number;
    };
    "content:updated": {
        type: string;
        slug?: string;
        collectionId?: string;
        id?: string;
    };
    "error": {
        error: unknown;
    };
};
type Listener<T> = (payload: T) => void;
declare class NexusEventBus<M extends Record<string, any> = NexusEventMap> {
    private listeners;
    on<K extends keyof M>(event: K, listener: Listener<M[K]>): () => void;
    emit<K extends keyof M>(event: K, payload: M[K]): void;
    clear(): void;
}

interface NexusRequestOptions extends RequestInit {
    timeout?: number;
    retries?: number;
    next?: {
        tags?: string[];
        revalidate?: number | false;
    };
}
declare class NexusHttpClient {
    private config;
    private events;
    private readonly limiter;
    private readonly breaker;
    private readonly backoff;
    constructor(config: NexusConfig, events?: NexusEventBus<NexusEventMap>);
    updateConfig(config: NexusConfig): void;
    request(input: string, options?: NexusRequestOptions): Promise<Response>;
    getStats(): {
        rateLimit: {
            currentRequests: number;
            limit: number;
        };
        circuit: string;
    };
}

declare class FeatureFlags {
    private values;
    constructor(initial?: Record<string, any>);
    set(values: Record<string, any>): void;
    isEnabled(key: string, fallback?: boolean): boolean;
    get<T = any>(key: string, fallback?: T): T;
    all(): {
        [x: string]: any;
    };
}
declare class RemoteConfig {
    private values;
    set(values: Record<string, any>): void;
    get<T = any>(key: string, fallback?: T): T;
    all(): {
        [x: string]: any;
    };
}

/**
 * GN-Apex client: intentionally zero-config for GN-Apex generated sites.
 * Platform configuration is discovered automatically; explicit overrides are
 * an escape hatch for SDK consumers, not a requirement for site developers.
 * Cache revalidation is FALSE by default on purpose: GN-Apex/Cloudflare owns
 * invalidation and purge, so immutable content can stay cached indefinitely.
 */
declare class NexusClient {
    private config;
    content: ContentEngine;
    analytics?: AnalyticsEngine;
    readonly events: NexusEventBus;
    readonly http: NexusHttpClient;
    readonly flags: FeatureFlags;
    readonly remoteConfig: RemoteConfig;
    constructor(config?: Partial<NexusConfig>);
    /**
     * Helper alias for cleaner page content fetching.
     */
    getPage<T = any>(slug: string, options?: any): Promise<T>;
    /**
     * Returns a readonly snapshot of the active configuration.
     */
    getConfig(): Readonly<NexusConfig>;
    /**
     * Updates runtime configuration dynamically without breaking active listeners.
     */
    updateConfig(updates: Partial<NexusConfig>): void;
    /**
     * Returns deep system diagnostics including HTTP and cache performance.
     */
    diagnostics(): {
        cache: {
            memory: CacheStats;
            local: {
                loaded: boolean;
            };
        };
        http: {
            rateLimit: {
                currentRequests: number;
                limit: number;
            };
            circuit: string;
        };
        analyticsQueue: number | undefined;
        version: string;
        environment: string;
        online: boolean;
        userAgent?: string;
        memory?: number;
    };
    /**
     * Gracefully terminates background tasks and cleans up listeners.
     */
    destroy(): void;
}
declare const nexus: NexusClient;
declare const createNexusClient: (config?: Partial<NexusConfig>) => NexusClient;

type NexusErrorCode = "CONFIGURATION_ERROR" | "NETWORK_ERROR" | "TIMEOUT" | "ABORTED" | "HTTP_ERROR" | "RATE_LIMITED" | "CIRCUIT_OPEN" | "NOT_FOUND" | "VALIDATION_ERROR" | "STORAGE_ERROR" | "UNKNOWN";
declare class NexusError extends Error {
    readonly code: NexusErrorCode;
    readonly status?: number | undefined;
    readonly requestId?: string | undefined;
    readonly details?: unknown | undefined;
    readonly retryable: boolean;
    readonly cause?: unknown | undefined;
    readonly name = "NexusError";
    constructor(message: string, code?: NexusErrorCode, status?: number | undefined, requestId?: string | undefined, details?: unknown | undefined, retryable?: boolean, cause?: unknown | undefined);
}
declare const isNexusError: (e: unknown) => e is NexusError;

interface NexusDiagnostics {
    version: string;
    environment: string;
    online: boolean;
    userAgent?: string;
    memory?: number;
}
declare const getDiagnostics: (version: string, environment: string) => NexusDiagnostics;

interface SiteUser {
    id: string;
    email: string;
    username?: string;
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
    role: string;
    organizationId?: string;
    organizationTraits?: Record<string, any>;
    metadata?: Record<string, any>;
    createdAt: string;
}
interface AuthState {
    user: SiteUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: AuthError | null;
}
interface AuthError {
    code: string;
    message: string;
    status: number;
}
interface LoginCredentials {
    email: string;
    password: string;
}
interface RegisterCredentials {
    email: string;
    password: string;
    username?: string;
    firstName?: string;
    lastName?: string;
    metadata?: Record<string, any>;
}
interface AuthContextType extends AuthState {
    login: (creds: LoginCredentials) => Promise<void>;
    register: (creds: RegisterCredentials) => Promise<void>;
    logout: () => Promise<void>;
    updateProfile: (data: Partial<SiteUser>) => Promise<void>;
    requestPasswordReset: (email: string) => Promise<void>;
}

declare class LocalCacheProxy implements ILocalCache {
    private instance;
    private cachePath?;
    constructor(cachePath?: string);
    private getInstance;
    isLoaded(): boolean;
    getPage(slug: string): Promise<any>;
    getCollection(id: string): Promise<any[] | null>;
    getGlobals(): Promise<any>;
    getAllData(): Promise<any>;
}

declare class NexusPushClient {
    private config;
    constructor(config: NexusConfig);
    /**
     * Helper to convert Base64 VAPID key to Uint8Array for WebPush security
     */
    private urlBase64ToUint8Array;
    /**
     * Requests browser notification permissions and registers the WebPush subscription
     */
    requestSubscription(serviceWorkerPath?: string): Promise<boolean>;
}

declare const VERSION = "1.1.0";

export { AnalyticsEngine, type AuthContextType, type AuthError, type AuthState, BrowserCache, type CacheEntry, type CacheMetadata, CacheTags, type CollectionQuery, type CollectionResponse, ContentEngine, type ContentResponse, DEFAULT_ANALYTICS_URL, DEFAULT_API_URL, type ErrorResponse, FeatureFlags, LOCAL_NEST_URL, LOCAL_RUST_URL, LocalCacheProxy as LocalCache, type LoginCredentials, MemoryCache, type MinimalNexusConfig, NexusClient, type NexusConfig, type NexusDiagnostics, NexusError, type NexusErrorCode, NexusEventBus, type NexusEventMap, NexusHttpClient, NexusPushClient, type NexusRequestOptions, type RegisterCredentials, RemoteConfig, SDK_VERSION, type SiteUser, VERSION, createNexusClient, getDiagnostics, getEnvConfig, getFullConfig, hasRequiredConfig, isNexusError, mergeConfigs, nexus, validateConfig };
