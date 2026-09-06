import React from 'react';

interface NexusRendererProps {
    content: string;
    className?: string;
    onCommentClick?: (commentId: string) => void;
    onImageClick?: (src: string, alt?: string) => void;
    hydrateCharts?: boolean;
    enableImageInteraction?: boolean;
    documentClassName?: string;
}
declare function NexusRenderer({ content, className, onCommentClick, onImageClick, hydrateCharts, enableImageInteraction, documentClassName, }: NexusRendererProps): React.JSX.Element;

interface CacheStats {
    size: number;
    hits: number;
    misses: number;
    hitRate: number;
    evictions: number;
}

interface MinimalNexusConfig {
    apiUrl?: string;
    analyticsUrl?: string;
    apiKey?: string;
    projectId?: string;
}

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

interface NexusProviderProps {
    children: React.ReactNode;
    projectId?: string;
    disableAnalytics?: boolean;
    hasConsent?: boolean;
    enableLiveFeed?: boolean;
    onLiveEvent?: (event: LiveAnalyticsEvent) => void;
    autoPromptPush?: boolean;
}
interface LiveAnalyticsEvent {
    eventType: string;
    projectId: string;
    sessionId: string;
    visitorId: string;
    userId?: string;
    data: {
        event_id: string;
        event_name?: string;
        url: string;
        timestamp: string;
        geo?: Record<string, any>;
        device?: Record<string, any>;
        performance?: Record<string, any>;
        ecommerce?: Record<string, any>;
    };
    timestamp: string;
    sequence: number;
}
interface LiveFeedContextValue {
    latestEvent: LiveAnalyticsEvent | null;
    isConnected: boolean;
}
declare const useNexusLiveFeed: () => LiveFeedContextValue;
declare const NexusProvider: ({ children, projectId, disableAnalytics, hasConsent, enableLiveFeed, onLiveEvent, autoPromptPush, }: NexusProviderProps) => React.JSX.Element;
declare const useNexus: () => NexusClient;
declare const useNexusAnalytics: () => {
    track: (eventName: string, properties?: Record<string, any>) => void;
    identify: (userId: string, traits?: Record<string, any>) => Promise<boolean>;
    group: (groupId: string, traits?: Record<string, any>) => Promise<boolean>;
    alias: (newId: string) => Promise<boolean>;
    trackPurchase: (orderData: {
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
    }) => void;
    trackError: (error: Error, context?: Record<string, any>) => void;
    reset: (performGdprScrub?: boolean) => void;
};

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

declare const AuthProvider: ({ children, config, }: {
    children: React.ReactNode;
    config: NexusConfig;
}) => React.JSX.Element;
declare const useNexusAuth: () => AuthContextType;

interface NexusRichTextProps {
    value: string;
    className?: string;
    hydrateCharts?: boolean;
    onCommentClick?: (commentId: string) => void;
    onImageClick?: (src: string, alt?: string) => void;
}
declare function NexusRichText({ value, className, hydrateCharts, onCommentClick, onImageClick, }: NexusRichTextProps): React.JSX.Element | null;
interface NexusLongTextProps {
    value: string;
    className?: string;
}
declare function NexusLongText({ value, className }: NexusLongTextProps): React.JSX.Element | null;
interface NexusIconProps {
    name: string;
    className?: string;
    size?: number;
    strokeWidth?: number;
}
declare function NexusIcon({ name, className, size, strokeWidth, }: NexusIconProps): React.JSX.Element | null;
interface NexusImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    value: string | {
        url: string;
        alt?: string;
    } | null;
}
declare function NexusImage({ value, className, alt, ...props }: NexusImageProps): React.JSX.Element | null;
interface NexusGalleryProps {
    value: Array<string | {
        url: string;
        alt?: string;
    }> | null;
    className?: string;
    imageClassName?: string;
}
declare function NexusGallery({ value, className, imageClassName, }: NexusGalleryProps): React.JSX.Element | null;
interface NexusVideoProps {
    value: string | null;
    className?: string;
    autoplay?: boolean;
}
declare function NexusVideo({ value, className, autoplay, }: NexusVideoProps): React.JSX.Element | null;
interface NexusMapProps {
    value: {
        lat: number;
        lng: number;
        address?: string;
    } | null;
    className?: string;
}
declare function NexusMap({ value, className }: NexusMapProps): React.JSX.Element | null;
interface NexusColorProps {
    value: string | null;
    className?: string;
    showHexLabel?: boolean;
}
declare function NexusColor({ value, className, showHexLabel, }: NexusColorProps): React.JSX.Element | null;
interface NexusGradientProps {
    value: string | null;
    children?: React.ReactNode;
    className?: string;
    asTextMask?: boolean;
}
declare function NexusGradient({ value, children, className, asTextMask, }: NexusGradientProps): React.JSX.Element;
interface NexusAddressProps {
    value: {
        street?: string;
        city?: string;
        state?: string;
        postalCode?: string;
        country?: string;
    } | null;
    className?: string;
}
declare function NexusAddress({ value, className }: NexusAddressProps): React.JSX.Element | null;
interface NexusKeyValueProps {
    value: Record<string, string> | null;
    className?: string;
}
declare function NexusKeyValue({ value, className }: NexusKeyValueProps): React.JSX.Element | null;
interface NexusTagsProps {
    value: string[] | null;
    className?: string;
    badgeClassName?: string;
}
declare function NexusTags({ value, className, badgeClassName, }: NexusTagsProps): React.JSX.Element | null;
interface NexusProgressProps {
    value: number | null;
    max?: number;
    className?: string;
    color?: string;
}
declare function NexusProgress({ value, max, className, color, }: NexusProgressProps): React.JSX.Element | null;
interface NexusBlendContainerProps {
    mode: string | null;
    children: React.ReactNode;
    className?: string;
}
declare function NexusBlendContainer({ mode, children, className, }: NexusBlendContainerProps): React.JSX.Element;
interface NexusCodeProps {
    value: string | null;
    language?: string;
    className?: string;
    showLineNumbers?: boolean;
}
declare function NexusCode({ value, language, className, showLineNumbers, }: NexusCodeProps): React.JSX.Element | null;
interface NexusBooleanProps {
    value: boolean | null;
    className?: string;
    trueLabel?: string;
    falseLabel?: string;
}
declare function NexusBoolean({ value, className, trueLabel, falseLabel, }: NexusBooleanProps): React.JSX.Element | null;

export { AuthProvider, type LiveAnalyticsEvent, NexusAddress, type NexusAddressProps, NexusBlendContainer, type NexusBlendContainerProps, NexusBoolean, type NexusBooleanProps, NexusCode, type NexusCodeProps, NexusColor, type NexusColorProps, NexusGallery, type NexusGalleryProps, NexusGradient, type NexusGradientProps, NexusIcon, type NexusIconProps, NexusImage, type NexusImageProps, NexusKeyValue, type NexusKeyValueProps, NexusLongText, type NexusLongTextProps, NexusMap, type NexusMapProps, NexusProgress, type NexusProgressProps, NexusProvider, type NexusProviderProps, NexusRenderer, NexusRichText, type NexusRichTextProps, NexusTags, type NexusTagsProps, NexusVideo, type NexusVideoProps, useNexus, useNexusAnalytics, useNexusAuth, useNexusLiveFeed };
