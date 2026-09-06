var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/config.ts
var DEFAULT_API_URL, DEFAULT_ANALYTICS_URL, SDK_VERSION, LOCAL_NEST_URL, LOCAL_RUST_URL, getEnvConfig, mergeConfigs, getFullConfig, validateConfig, hasRequiredConfig;
var init_config = __esm({
  "src/config.ts"() {
    "use strict";
    DEFAULT_API_URL = "https://api.gnapex.com";
    DEFAULT_ANALYTICS_URL = "https://sentry.gnapex.com";
    SDK_VERSION = "1.1.0";
    LOCAL_NEST_URL = "https://api.gnapex.com";
    LOCAL_RUST_URL = "https://sentry.gnapex.com";
    getEnvConfig = () => {
      const NEXT_PUBLIC_ID = typeof process !== "undefined" ? process.env.NEXT_PUBLIC_GNAPEX_ID ?? process.env.NEXT_PUBLIC_NEXUS_ID : void 0;
      const NEXT_PUBLIC_KEY = typeof process !== "undefined" ? process.env.NEXT_PUBLIC_GNAPEX_KEY ?? process.env.NEXT_PUBLIC_NEXUS_KEY : void 0;
      const NEXT_PUBLIC_URL = typeof process !== "undefined" ? process.env.NEXT_PUBLIC_GNAPEX_API_URL ?? process.env.NEXT_PUBLIC_NEXUS_API_URL : void 0;
      const NEXT_PUBLIC_ANALYTICS_URL = typeof process !== "undefined" ? process.env.NEXT_PUBLIC_GNAPEX_ANALYTICS_URL ?? process.env.NEXT_PUBLIC_NEXUS_ANALYTICS_URL : void 0;
      const NODE_ID = typeof process !== "undefined" ? process.env.GNAPEX_PROJECT_ID ?? process.env.NEXUS_PROJECT_ID : void 0;
      const NODE_KEY = typeof process !== "undefined" ? process.env.GNAPEX_API_KEY ?? process.env.NEXUS_API_KEY : void 0;
      const NODE_URL = typeof process !== "undefined" ? process.env.GNAPEX_API_URL ?? process.env.NEXUS_API_URL : void 0;
      const NODE_ANALYTICS_URL = typeof process !== "undefined" ? process.env.GNAPEX_ANALYTICS_URL ?? process.env.NEXUS_ANALYTICS_URL : void 0;
      const NODE_ENV = typeof process !== "undefined" ? process.env.NODE_ENV : "production";
      const isDev = NODE_ENV === "development" || typeof window !== "undefined" && window.location.hostname === "localhost";
      const runtime = typeof window !== "undefined" ? window.__GNAPEX__ ?? window.__NEXUS__ : void 0;
      const meta = typeof document !== "undefined" ? (name) => document.querySelector(`meta[name="${name}"]`)?.getAttribute("content") ?? void 0 : (_name) => void 0;
      const projectId = runtime?.projectId ?? meta("gnapex-project") ?? meta("nexus-project") ?? NEXT_PUBLIC_ID ?? NODE_ID;
      const apiKey = runtime?.apiKey ?? meta("gnapex-key") ?? meta("nexus-key") ?? NEXT_PUBLIC_KEY ?? NODE_KEY;
      const apiUrl = runtime?.apiUrl ?? meta("gnapex-api") ?? meta("nexus-api") ?? NEXT_PUBLIC_URL ?? NODE_URL ?? (isDev ? LOCAL_NEST_URL : DEFAULT_API_URL);
      const analyticsUrl = runtime?.analyticsUrl ?? meta("gnapex-analytics") ?? meta("nexus-analytics") ?? NEXT_PUBLIC_ANALYTICS_URL ?? NODE_ANALYTICS_URL ?? (apiUrl.includes("localhost") ? LOCAL_RUST_URL : DEFAULT_ANALYTICS_URL);
      return {
        projectId,
        apiKey,
        apiUrl,
        analyticsUrl
      };
    };
    mergeConfigs = (base, override) => {
      const mergedApiUrl = override.apiUrl || base.apiUrl || DEFAULT_API_URL;
      const mergedAnalyticsUrl = override.analyticsUrl || base.analyticsUrl || (mergedApiUrl.includes("localhost") ? LOCAL_RUST_URL : DEFAULT_ANALYTICS_URL);
      return {
        ...base,
        ...override,
        apiUrl: mergedApiUrl,
        analyticsUrl: mergedAnalyticsUrl,
        projectId: override.projectId || base.projectId,
        apiKey: override.apiKey || base.apiKey
      };
    };
    getFullConfig = (partialConfig) => {
      const envConfig = getEnvConfig();
      return mergeConfigs(envConfig, partialConfig || {});
    };
    validateConfig = (config) => {
      const errors = [];
      if (!config.projectId) errors.push("Missing projectId");
      if (!config.apiUrl) errors.push("Missing apiUrl");
      else if (!/^https?:\/\//.test(config.apiUrl)) {
        errors.push("apiUrl must be a valid URL starting with http:// or https://");
      }
      return errors;
    };
    hasRequiredConfig = (config) => validateConfig(config).length === 0;
  }
});

// src/content/binary-compiler.ts
import * as crypto2 from "crypto";
var BinaryCompiler;
var init_binary_compiler = __esm({
  "src/content/binary-compiler.ts"() {
    "use strict";
    BinaryCompiler = class {
      /**
       * Generates a secure, deterministic cryptographic key from the project's API key.
       */
      static deriveKeys(apiKey) {
        const hash = crypto2.createHash("sha256").update(apiKey).digest();
        const encryptionKey = hash;
        const hmacKey = crypto2.createHmac("sha256", apiKey).update("nexus-integrity-key").digest();
        return { encryptionKey, hmacKey };
      }
      /**
       * Compiles JSON content data into a secure, signed, and encrypted .nx binary buffer.
       */
      static compile(data, apiKey, projectId, metadataOverrides = {}) {
        const { encryptionKey, hmacKey } = this.deriveKeys(apiKey);
        const metadata = {
          version: "2.0.0",
          compiledAt: (/* @__PURE__ */ new Date()).toISOString(),
          projectId,
          ...metadataOverrides
        };
        const metadataStr = JSON.stringify(metadata);
        const metadataBuffer = Buffer.from(metadataStr, "utf-8");
        const iv = crypto2.randomBytes(16);
        const cipher = crypto2.createCipheriv(this.ALGORITHM, encryptionKey, iv);
        const plainTextPayload = JSON.stringify(data);
        let encryptedPayload = cipher.update(plainTextPayload, "utf8");
        encryptedPayload = Buffer.concat([encryptedPayload, cipher.final()]);
        const payloadBuffer = Buffer.concat([iv, encryptedPayload]);
        const headerBuffer = Buffer.from(this.MAGIC_HEADER, "ascii");
        const metaLengthBuffer = Buffer.alloc(4);
        metaLengthBuffer.writeUInt32BE(metadataBuffer.length, 0);
        const payloadLengthBuffer = Buffer.alloc(4);
        payloadLengthBuffer.writeUInt32BE(payloadBuffer.length, 0);
        const prefixBlock = Buffer.concat([
          headerBuffer,
          metaLengthBuffer,
          metadataBuffer,
          payloadLengthBuffer,
          payloadBuffer
        ]);
        const hmac = crypto2.createHmac("sha256", hmacKey);
        hmac.update(prefixBlock);
        const signature = hmac.digest();
        return Buffer.concat([prefixBlock, signature]);
      }
      /**
       * Verifies, decrypts, and decompiles a .nx binary buffer back into clean, type-safe JSON.
       * Throws structured errors on integrity verification failures or file corruption.
       */
      static decompile(buffer, apiKey) {
        if (buffer.length < 44) {
          throw new Error(
            "Corrupted File: Binary payload is too short to be a valid Nexus node."
          );
        }
        const { encryptionKey, hmacKey } = this.deriveKeys(apiKey);
        const prefixBlockLength = buffer.length - 32;
        const prefixBlock = buffer.subarray(0, prefixBlockLength);
        const expectedSignature = buffer.subarray(prefixBlockLength);
        const hmac = crypto2.createHmac("sha256", hmacKey);
        hmac.update(prefixBlock);
        const actualSignature = hmac.digest();
        if (!crypto2.timingSafeEqual(expectedSignature, actualSignature)) {
          throw new Error(
            "DATA_INTEGRITY_VIOLATION: Cryptographic signature mismatch. This local node has been modified externally or tampered with."
          );
        }
        const magicHeader = prefixBlock.subarray(0, 4).toString("ascii");
        if (magicHeader !== this.MAGIC_HEADER) {
          throw new Error(
            "Invalid Format: File lacks the correct Nexus binary magic header."
          );
        }
        const metaLength = prefixBlock.readUInt32BE(4);
        const metaStart = 8;
        const metaEnd = metaStart + metaLength;
        const metadataStr = prefixBlock.subarray(metaStart, metaEnd).toString("utf-8");
        const metadata = JSON.parse(metadataStr);
        const payloadLength = prefixBlock.readUInt32BE(metaEnd);
        const payloadStart = metaEnd + 4;
        const payloadEnd = payloadStart + payloadLength;
        const payloadBuffer = prefixBlock.subarray(payloadStart, payloadEnd);
        const iv = payloadBuffer.subarray(0, 16);
        const cipherText = payloadBuffer.subarray(16);
        const decipher = crypto2.createDecipheriv(this.ALGORITHM, encryptionKey, iv);
        let decrypted = decipher.update(cipherText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        const data = JSON.parse(decrypted.toString("utf8"));
        return { data, metadata };
      }
    };
    BinaryCompiler.MAGIC_HEADER = "NEXS";
    // 4-byte ASCII magic identifier
    BinaryCompiler.ALGORITHM = "aes-256-cbc";
  }
});

// src/content/utils.ts
function validateSlug(slug) {
  if (!slug || typeof slug !== "string") {
    throw new Error("Slug must be a non-empty string");
  }
  if (!/^[a-z0-9-_]+$/.test(slug)) {
    throw new Error("Slug can only contain lowercase letters, numbers, hyphens, and underscores");
  }
}
function normalizeQuery(query) {
  const normalized = { ...query };
  normalized.page = Math.max(1, normalized.page || 1);
  normalized.limit = Math.min(100, Math.max(1, normalized.limit || 10));
  normalized.order = normalized.order || "desc";
  if (normalized.page < 1) {
    throw new Error("Page must be greater than 0");
  }
  if (normalized.limit < 1 || normalized.limit > 100) {
    throw new Error("Limit must be between 1 and 100");
  }
  return normalized;
}
function buildQueryString(query) {
  const params = new URLSearchParams();
  if (query.page) params.append("page", query.page.toString());
  if (query.limit) params.append("limit", query.limit.toString());
  if (query.sort) params.append("sort", query.sort);
  if (query.order) params.append("order", query.order);
  if (query.search) params.append("search", query.search);
  if (query.include?.length) {
    params.append("include", query.include.join(","));
  }
  if (query.fields?.length) {
    params.append("fields", query.fields.join(","));
  }
  if (query.filter) {
    params.append("filter", JSON.stringify(query.filter));
  }
  return params.toString();
}
function measurePerformance(name, fn) {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  if (process.env.NODE_ENV === "development") {
    console.log(`\u23F1\uFE0F ${name}: ${(end - start).toFixed(2)}ms`);
  }
  return { result, duration: end - start };
}
var init_utils = __esm({
  "src/content/utils.ts"() {
    "use strict";
  }
});

// src/content/local-cache-server.ts
var local_cache_server_exports = {};
__export(local_cache_server_exports, {
  LocalCache: () => LocalCache
});
import fs from "fs";
import path from "path";
var LocalCache;
var init_local_cache_server = __esm({
  "src/content/local-cache-server.ts"() {
    "use strict";
    init_config();
    init_binary_compiler();
    init_utils();
    LocalCache = class {
      constructor(customPath, apiKey) {
        this.apiKey = "";
        this.baseDir = customPath || ".nexus/local";
        const config = getEnvConfig();
        this.apiKey = apiKey || config.apiKey || "";
      }
      isLoaded() {
        return fs.existsSync(path.resolve(process.cwd(), this.baseDir));
      }
      decompileFile(filePath) {
        if (!this.apiKey) {
          if (process.env.NODE_ENV === "development") {
            console.warn(
              "\u26A0\uFE0F  GnApex: Missing NEXUS_API_KEY. Local decryption bypassed."
            );
          }
          return null;
        }
        try {
          const encryptedBuffer = fs.readFileSync(filePath);
          const decompiled = BinaryCompiler.decompile(encryptedBuffer, this.apiKey);
          return decompiled.data;
        } catch (error) {
          if (process.env.NODE_ENV === "development") {
            console.error(
              `
\u{1F6A8}  GnApex Security Alert: Data Integrity Violation in file:
    ${filePath}
    Error: ${error.message}
    This file has been disabled until regenerated via npx nexus pull.
`
            );
          }
          return null;
        }
      }
      /**
       * Retrieve a specific page safely from its .nx file.
       */
      async getPage(slug) {
        try {
          validateSlug(slug);
        } catch {
          return null;
        }
        const filePath = path.resolve(
          process.cwd(),
          this.baseDir,
          "pages",
          `${slug}.nx`
        );
        if (fs.existsSync(filePath)) {
          const pageData = this.decompileFile(filePath);
          if (!pageData) return null;
          let content = pageData;
          while (content && typeof content === "object" && content.data !== void 0) {
            content = content.data;
          }
          return content;
        }
        return null;
      }
      /**
       * Retrieve an entire collection safely from its specific .nx file.
       */
      async getCollection(collectionId) {
        try {
          validateSlug(collectionId);
        } catch {
          return null;
        }
        const filePath = path.resolve(
          process.cwd(),
          this.baseDir,
          "collections",
          `${collectionId}.nx`
        );
        if (fs.existsSync(filePath)) {
          return this.decompileFile(filePath);
        }
        return null;
      }
      /**
       * Retrieve global settings from its .nx file.
       */
      async getGlobals() {
        const filePath = path.resolve(process.cwd(), this.baseDir, "globals.nx");
        if (fs.existsSync(filePath)) {
          return this.decompileFile(filePath);
        }
        return null;
      }
      /**
       * Returns a merged JSON of the entire workspace structure.
       */
      async getAllData() {
        const pages = {};
        const collections = {};
        let globals = {};
        try {
          const pagesDir = path.resolve(process.cwd(), this.baseDir, "pages");
          if (fs.existsSync(pagesDir)) {
            for (const file of fs.readdirSync(pagesDir)) {
              if (file.endsWith(".nx")) {
                const slug = path.basename(file, ".nx");
                pages[slug] = await this.getPage(slug);
              }
            }
          }
          const colsDir = path.resolve(process.cwd(), this.baseDir, "collections");
          if (fs.existsSync(colsDir)) {
            for (const file of fs.readdirSync(colsDir)) {
              if (file.endsWith(".nx")) {
                const id = path.basename(file, ".nx");
                collections[id] = await this.getCollection(id) || [];
              }
            }
          }
          globals = await this.getGlobals() || {};
        } catch {
        }
        return { pages, collections, globals };
      }
    };
  }
});

// src/content/local-cache-client.ts
var local_cache_client_exports = {};
__export(local_cache_client_exports, {
  LocalCache: () => LocalCache2
});
var LocalCache2;
var init_local_cache_client = __esm({
  "src/content/local-cache-client.ts"() {
    "use strict";
    LocalCache2 = class {
      constructor(customPath) {
        // Maintain private properties for type parity with the Server version
        this.data = null;
        this.hasLoaded = false;
        this.cachePath = customPath || ".nexus/cache.json";
      }
      /**
       * Always returns false in the browser as local file caching
       * is a server-side only feature.
       */
      isLoaded() {
        return false;
      }
      /**
       * No-op method to maintain internal API compatibility.
       */
      load() {
        return;
      }
      /**
       * Returns null. Browsers should fetch pages from the Remote API
       * or the Memory/Browser cache.
       */
      async getPage(_slug) {
        return null;
      }
      /**
       * Returns null. Browsers should fetch collections from the Remote API.
       */
      async getCollection(_collectionId) {
        return null;
      }
      /**
       * Returns null.
       */
      async getGlobals() {
        return null;
      }
      /**
       * Returns null.
       */
      async getAllData() {
        return null;
      }
      /**
       * Dummy helper to match Node implementation.
       */
      shouldWarnAboutMissingCache(error) {
        const isMissing = error.code === "ENOENT";
        const isMalformed = error instanceof SyntaxError;
        if (process.env.NODE_ENV !== "development") return false;
        return !isMissing || isMalformed;
      }
    };
  }
});

// src/client.ts
init_config();

// src/content/cache-implementations.ts
var CacheTags = {
  project: (projectId) => `nexus_project_${projectId}`,
  content: (slug) => `content_${slug}`,
  collection: (collectionId) => `collection_${collectionId}`,
  global: "nexus_global_config",
  user: (userId) => `user_${userId}`,
  media: (mediaId) => `media_${mediaId}`
};
var MemoryCache = class {
  constructor(options = {}) {
    this.cache = /* @__PURE__ */ new Map();
    this.tagIndex = /* @__PURE__ */ new Map();
    this.stats = {
      size: 0,
      hits: 0,
      misses: 0,
      hitRate: 0,
      evictions: 0
    };
    this.maxSize = options.maxSize || 1e3;
    this.defaultTTL = options.ttl || 5 * 60 * 1e3;
  }
  set(key, data, options = {}) {
    if (this.cache.size >= this.maxSize) {
      this.evictLRU();
    }
    const metadata = {
      timestamp: Date.now(),
      expiresAt: Date.now() + (options.ttl || this.defaultTTL),
      tags: options.tags || [],
      size: this.calculateSize(data)
    };
    this.cache.set(key, { data, metadata });
    this.stats.size = this.cache.size;
    metadata.tags.forEach((tag) => {
      if (!this.tagIndex.has(tag)) {
        this.tagIndex.set(tag, /* @__PURE__ */ new Set());
      }
      this.tagIndex.get(tag).add(key);
    });
  }
  get(key) {
    const entry = this.cache.get(key);
    if (!entry) {
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }
    if (Date.now() > entry.metadata.expiresAt) {
      this.delete(key);
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }
    entry.metadata.timestamp = Date.now();
    this.stats.hits++;
    this.updateHitRate();
    return entry;
  }
  delete(key) {
    const entry = this.cache.get(key);
    if (!entry) return false;
    entry.metadata.tags.forEach((tag) => {
      const keys = this.tagIndex.get(tag);
      if (keys) {
        keys.delete(key);
        if (keys.size === 0) {
          this.tagIndex.delete(tag);
        }
      }
    });
    this.cache.delete(key);
    this.stats.size = this.cache.size;
    return true;
  }
  invalidateByTags(tags) {
    const keysToDelete = /* @__PURE__ */ new Set();
    tags.forEach((tag) => {
      const keys = this.tagIndex.get(tag);
      if (keys) {
        keys.forEach((key) => keysToDelete.add(key));
        this.tagIndex.delete(tag);
      }
    });
    keysToDelete.forEach((key) => this.delete(key));
    if (process.env.NODE_ENV === "development") {
      console.log(
        `[MemoryCache] Invalidated ${keysToDelete.size} entries by tags: ${tags.join(", ")}`
      );
    }
  }
  clear() {
    this.cache.clear();
    this.tagIndex.clear();
    this.stats = {
      size: 0,
      hits: 0,
      misses: 0,
      hitRate: 0,
      evictions: 0
    };
  }
  getStats() {
    return { ...this.stats };
  }
  evictLRU() {
    let oldestKey = null;
    let oldestTime = Infinity;
    for (const [key, entry] of this.cache.entries()) {
      if (entry.metadata.timestamp < oldestTime) {
        oldestTime = entry.metadata.timestamp;
        oldestKey = key;
      }
    }
    if (oldestKey) {
      this.delete(oldestKey);
      this.stats.evictions++;
    }
  }
  calculateSize(data) {
    try {
      const jsonString = JSON.stringify(data);
      return new Blob([jsonString]).size;
    } catch {
      return 0;
    }
  }
  updateHitRate() {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? this.stats.hits / total : 0;
  }
};
var BrowserCache = class {
  constructor(projectId) {
    this.projectId = projectId;
    this.prefix = "nexushub_";
    this.maxSize = 5 * 1024 * 1024;
    // 5MB standard LocalStorage limit
    this.currentSize = 0;
    if (typeof window !== "undefined") {
      this.calculateCurrentSize();
    }
  }
  set(key, data, ttl = 5 * 60 * 1e3) {
    if (typeof window === "undefined") return;
    const storageKey = this.getStorageKey(key);
    const entry = {
      data,
      metadata: {
        timestamp: Date.now(),
        expiresAt: Date.now() + ttl,
        size: this.calculateStorageSize(data)
      }
    };
    const serialized = JSON.stringify(entry);
    const newSize = new Blob([serialized]).size;
    if (this.currentSize + newSize > this.maxSize) {
      this.evictOldest();
    }
    try {
      localStorage.setItem(storageKey, serialized);
      this.currentSize += newSize;
    } catch (error) {
      console.warn("[BrowserCache] Failed to save to localStorage:", error);
      this.evictOldest();
      try {
        localStorage.setItem(storageKey, serialized);
      } catch (e) {
      }
    }
  }
  get(key) {
    if (typeof window === "undefined") return null;
    const storageKey = this.getStorageKey(key);
    const item = localStorage.getItem(storageKey);
    if (!item) return null;
    try {
      const entry = JSON.parse(item);
      if (Date.now() > entry.metadata.expiresAt) {
        this.delete(key);
        return null;
      }
      return entry.data;
    } catch {
      this.delete(key);
      return null;
    }
  }
  delete(key) {
    if (typeof window === "undefined") return;
    const storageKey = this.getStorageKey(key);
    const item = localStorage.getItem(storageKey);
    if (item) {
      this.currentSize -= new Blob([item]).size;
    }
    localStorage.removeItem(storageKey);
  }
  clear() {
    if (typeof window === "undefined") return;
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.prefix)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key));
    this.currentSize = 0;
  }
  getStorageKey(key) {
    return `${this.prefix}${this.projectId}_${key}`;
  }
  calculateCurrentSize() {
    this.currentSize = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.prefix)) {
        const item = localStorage.getItem(key);
        if (item) {
          this.currentSize += new Blob([item]).size;
        }
      }
    }
  }
  calculateStorageSize(data) {
    return new Blob([JSON.stringify(data)]).size;
  }
  evictOldest() {
    let oldestKey = null;
    let oldestTime = Infinity;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.prefix)) {
        const item = localStorage.getItem(key);
        if (item) {
          try {
            const entry = JSON.parse(item);
            if (entry.metadata.timestamp < oldestTime) {
              oldestTime = entry.metadata.timestamp;
              oldestKey = key;
            }
          } catch {
            localStorage.removeItem(key);
          }
        }
      }
    }
    if (oldestKey) {
      const item = localStorage.getItem(oldestKey);
      if (item) {
        this.currentSize -= new Blob([item]).size;
      }
      localStorage.removeItem(oldestKey);
    }
  }
};

// src/content/cache.ts
var LocalCacheProxy = class {
  constructor(cachePath) {
    this.instance = null;
    this.cachePath = cachePath;
  }
  async getInstance() {
    if (this.instance) return this.instance;
    if (typeof window === "undefined") {
      const mod = await Promise.resolve().then(() => (init_local_cache_server(), local_cache_server_exports));
      this.instance = new mod.LocalCache(this.cachePath);
    } else {
      const mod = await Promise.resolve().then(() => (init_local_cache_client(), local_cache_client_exports));
      this.instance = new mod.LocalCache(this.cachePath);
    }
    return this.instance;
  }
  isLoaded() {
    return this.instance?.isLoaded() || false;
  }
  async getPage(slug) {
    const inst = await this.getInstance();
    return inst.getPage(slug);
  }
  async getCollection(id) {
    const inst = await this.getInstance();
    return inst.getCollection(id);
  }
  async getGlobals() {
    const inst = await this.getInstance();
    return inst.getGlobals();
  }
  async getAllData() {
    const inst = await this.getInstance();
    return inst.getAllData();
  }
};

// src/content/strategies.ts
var RateLimiter = class {
  constructor(config) {
    this.config = config;
    this.requests = [];
  }
  async checkLimit() {
    while (true) {
      const now = Date.now();
      const cutoff = now - this.config.timeWindow;
      this.requests = this.requests.filter((t) => t > cutoff);
      if (this.requests.length < this.config.maxRequests) {
        this.requests.push(now);
        return;
      }
      await new Promise((r) => setTimeout(r, Math.max(1, this.requests[0] + this.config.timeWindow - now)));
    }
  }
  getStats() {
    const now = Date.now();
    return { currentRequests: this.requests.filter((t) => t > now - this.config.timeWindow).length, limit: this.config.maxRequests };
  }
};
var ExponentialBackoff = class {
  constructor(config) {
    this.config = config;
    this.config = { jitter: true, ...config };
  }
  async execute(fn, onRetry) {
    let last;
    for (let a = 0; a <= this.config.maxRetries; a++) {
      try {
        return await fn();
      } catch (e) {
        last = e;
        if (e?.code === "ABORTED" || e?.code === "VALIDATION_ERROR" || e?.status >= 400 && e?.status < 500 && e?.status !== 429) throw e;
        if (a === this.config.maxRetries) break;
        let delay = Math.min(this.config.maxDelay, this.config.baseDelay * 2 ** a);
        if (this.config.jitter) delay *= 0.5 + Math.random();
        onRetry?.(a + 1, delay, e);
        await new Promise((r) => setTimeout(r, delay));
      }
    }
    throw last;
  }
};
var CircuitState = /* @__PURE__ */ ((CircuitState2) => {
  CircuitState2[CircuitState2["CLOSED"] = 0] = "CLOSED";
  CircuitState2[CircuitState2["OPEN"] = 1] = "OPEN";
  CircuitState2[CircuitState2["HALF_OPEN"] = 2] = "HALF_OPEN";
  return CircuitState2;
})(CircuitState || {});
var CircuitBreaker = class {
  constructor(threshold = 5, reset = 3e4) {
    this.threshold = threshold;
    this.reset = reset;
    this.state = 0 /* CLOSED */;
    this.failures = 0;
    this.lastFailure = 0;
  }
  isOpen() {
    if (this.state === 1 /* OPEN */ && Date.now() - this.lastFailure >= this.reset) {
      this.state = 2 /* HALF_OPEN */;
      return false;
    }
    return this.state === 1 /* OPEN */;
  }
  recordSuccess() {
    this.failures = 0;
    this.state = 0 /* CLOSED */;
  }
  recordFailure() {
    this.failures++;
    this.lastFailure = Date.now();
    if (this.failures >= this.threshold) this.state = 1 /* OPEN */;
  }
  getState() {
    return CircuitState[this.state];
  }
};
var RequestBatcher = class {
  constructor(windowMs = 10, maxBatchSize = 50) {
    this.windowMs = windowMs;
    this.maxBatchSize = maxBatchSize;
    this.pending = /* @__PURE__ */ new Map();
  }
  schedule(key, request) {
    const existing = this.pending.get(key);
    if (existing) return existing;
    const promise = new Promise((resolve, reject) => setTimeout(() => request().then(resolve, reject), this.windowMs));
    this.pending.set(key, promise);
    promise.finally(() => this.pending.delete(key)).catch(() => {
    });
    return promise;
  }
  clear() {
    this.pending.clear();
  }
};

// src/content/index.ts
init_utils();
var ContentEngine = class {
  constructor(config) {
    this.config = config;
    this.isServer = typeof window === "undefined";
    this.localCache = new LocalCacheProxy();
    this.memoryCache = new MemoryCache({
      maxSize: 500,
      ttl: 5 * 1e3
      // 👈 5 seconds
    });
    if (!this.isServer) {
      this.browserCache = new BrowserCache(config.projectId);
    }
    this.rateLimiter = new RateLimiter({
      maxRequests: config.debug ? 200 : 100,
      timeWindow: 6e4
    });
    this.backoff = new ExponentialBackoff({
      maxRetries: config.retries || 3,
      baseDelay: 100,
      maxDelay: 5e3,
      jitter: true
    });
    this.requestBatcher = new RequestBatcher(20, 50);
    this.circuitBreaker = new CircuitBreaker();
    this.defaultRevalidate = config.revalidateTime ?? false;
    this.cacheStrategy = config.cacheStrategy || "memory";
    if (!this.isServer) {
      window.addEventListener("beforeunload", this.cleanup.bind(this));
    }
  }
  updateConfig(config) {
    this.config = config;
    this.defaultRevalidate = config.revalidateTime ?? false;
    this.cacheStrategy = config.cacheStrategy || "memory";
  }
  async getPage(slug, options = {}) {
    const { result, duration } = measurePerformance(
      `getPage("${slug}")`,
      () => this._getPage(slug, options)
    );
    if (this.config.debug && duration > 100) {
      console.warn(
        `[GnApex] \u26A0\uFE0F getPage("${slug}") took ${duration.toFixed(2)}ms`
      );
    }
    return result;
  }
  async _getPage(slug, options = {}) {
    validateSlug(slug);
    const {
      revalidate = this.defaultRevalidate,
      tags = [],
      forceRefresh = false,
      includeMetadata = false
    } = options;
    const cacheKey = `page:${slug}`;
    if (!this.isServer && !forceRefresh && this.cacheStrategy === "memory") {
      const cached = this.memoryCache.get(cacheKey);
      if (cached && this.isCacheValid(cached.metadata)) {
        return includeMetadata ? cached : cached.data;
      }
    }
    if (!forceRefresh && process.env.NODE_ENV === "development") {
      try {
        const local = await this.localCache.getPage(slug);
        if (local) {
          return includeMetadata ? {
            data: local,
            metadata: {
              timestamp: Date.now(),
              expiresAt: Infinity,
              tags: []
            }
          } : local;
        }
      } catch {
      }
    }
    if (this.circuitBreaker.isOpen()) {
      throw new Error("[GnApex] Circuit open. API is unavailable.");
    }
    try {
      await this.rateLimiter.checkLimit();
      const data = await this.backoff.execute(async () => {
        return this.fetchPage(
          slug,
          cacheKey,
          tags,
          revalidate,
          forceRefresh
        );
      });
      this.circuitBreaker.recordSuccess();
      return includeMetadata ? data : data.data;
    } catch (error) {
      this.circuitBreaker.recordFailure();
      if (process.env.NODE_ENV === "development") {
        try {
          const local = await this.localCache.getPage(slug);
          if (local) {
            return includeMetadata ? {
              data: local,
              metadata: {
                timestamp: Date.now(),
                expiresAt: Infinity,
                tags: []
              }
            } : local;
          }
        } catch {
        }
      }
      throw this.normalizeError(error, `Failed to fetch page '${slug}'`);
    }
  }
  async getCollection(collectionId, query = {}, options = {}) {
    const normalizedQuery = normalizeQuery(query);
    const {
      revalidate = this.defaultRevalidate,
      tags = [],
      forceRefresh = false,
      includeMetadata = false
    } = options;
    const queryString = buildQueryString(normalizedQuery);
    const cacheKey = `collection:${collectionId}:${queryString}`;
    if (!this.isServer && !forceRefresh && this.cacheStrategy === "memory") {
      const cached = this.memoryCache.get(cacheKey);
      if (cached && this.isCacheValid(cached.metadata)) {
        return includeMetadata ? cached : cached.data;
      }
    }
    if (!forceRefresh && process.env.NODE_ENV === "development") {
      try {
        const localCollection = await this.localCache.getCollection(collectionId);
        if (localCollection) {
          const result = this.applyLocalQuery(
            localCollection,
            normalizedQuery
          );
          return result;
        }
      } catch {
      }
    }
    if (this.circuitBreaker.isOpen()) {
      throw new Error("[GnApex] Circuit open. API is unavailable.");
    }
    try {
      await this.rateLimiter.checkLimit();
      const result = await this.backoff.execute(async () => {
        return this.fetchCollection(
          collectionId,
          normalizedQuery,
          cacheKey,
          tags,
          revalidate,
          forceRefresh
        );
      });
      this.circuitBreaker.recordSuccess();
      return includeMetadata ? result : result.data;
    } catch (error) {
      this.circuitBreaker.recordFailure();
      if (process.env.NODE_ENV === "development") {
        try {
          const localCollection = await this.localCache.getCollection(collectionId);
          if (localCollection) {
            return this.applyLocalQuery(
              localCollection,
              normalizedQuery
            );
          }
        } catch {
        }
      }
      throw this.normalizeError(
        error,
        `Failed to fetch collection '${collectionId}'`
      );
    }
  }
  async getGlobals(options = {}) {
    const {
      include = [],
      revalidate = this.defaultRevalidate,
      forceRefresh = false
    } = options;
    const cacheKey = `globals:${include.join(",")}`;
    if (!this.isServer && !forceRefresh && this.cacheStrategy === "memory") {
      const cached = this.memoryCache.get(cacheKey);
      if (cached && this.isCacheValid(cached.metadata)) {
        return cached.data;
      }
    }
    if (!forceRefresh && process.env.NODE_ENV === "development") {
      try {
        const localGlobals = await this.localCache.getGlobals();
        if (localGlobals) {
          return localGlobals;
        }
      } catch {
      }
    }
    try {
      await this.rateLimiter.checkLimit();
      const url = `${this.config.apiUrl}/content/${this.config.projectId}/globals`;
      const params = include.length > 0 ? `?include=${include.join(",")}` : "";
      const fetchTags = [
        CacheTags.project(this.config.projectId),
        CacheTags.global,
        ...options.tags || []
      ];
      const res = await this.fetchWithTimeout(`${url}${params}`, {
        method: "GET",
        headers: this.getHeaders(),
        tags: fetchTags,
        revalidate,
        forceRefresh
      });
      if (!res.ok) {
        throw new Error(`API Error ${res.status}: ${res.statusText}`);
      }
      const json = await res.json();
      const data = json.data || json;
      if (!this.isServer) {
        this.writeCache(cacheKey, data, {
          revalidate,
          tags: fetchTags
        });
      }
      return data;
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        try {
          const localGlobals = await this.localCache.getGlobals();
          if (localGlobals) {
            return localGlobals;
          }
        } catch {
        }
      }
      throw this.normalizeError(error, "Failed to fetch globals");
    }
  }
  async getItem(collectionId, itemId, options = {}) {
    const { forceRefresh = false } = options;
    const cacheKey = `item:${collectionId}:${itemId}`;
    if (!this.isServer && !forceRefresh && this.cacheStrategy === "memory") {
      const cached = this.memoryCache.get(cacheKey);
      if (cached && this.isCacheValid(cached.metadata)) {
        return cached.data;
      }
    }
    return this.requestBatcher.schedule(
      forceRefresh ? `${cacheKey}:refresh:${Date.now()}` : cacheKey,
      async () => {
        const params = new URLSearchParams();
        if (options.include?.length) {
          params.append("include", options.include.join(","));
        }
        const url = `${this.config.apiUrl}/content/${this.config.projectId}/collection/${collectionId}/${itemId}?${params}`;
        const fetchTags = [
          CacheTags.project(this.config.projectId),
          CacheTags.collection(collectionId),
          `item_${itemId}`,
          ...options.tags || []
        ];
        const res = await this.fetchWithTimeout(url, {
          method: "GET",
          headers: this.getHeaders(),
          tags: fetchTags,
          revalidate: options.revalidate ?? this.defaultRevalidate,
          forceRefresh
        });
        if (!res.ok) {
          throw new Error(`API Error ${res.status}: ${res.statusText}`);
        }
        const json = await res.json();
        const data = json.data || json;
        if (!this.isServer) {
          this.writeCache(cacheKey, data, {
            revalidate: options.revalidate ?? this.defaultRevalidate,
            tags: fetchTags
          });
        }
        return data;
      }
    );
  }
  async search(query, options = {}) {
    const params = new URLSearchParams({
      q: query,
      limit: (options.limit || 20).toString()
    });
    if (options.collections?.length) {
      params.append("collections", options.collections.join(","));
    }
    if (options.fields?.length) {
      params.append("fields", options.fields.join(","));
    }
    const url = `${this.config.apiUrl}/content/${this.config.projectId}/search?${params}`;
    const fetchTags = [
      CacheTags.project(this.config.projectId),
      ...(options.collections || []).map(
        (collection) => CacheTags.collection(collection)
      )
    ];
    const res = await this.fetchWithTimeout(url, {
      method: "GET",
      headers: this.getHeaders(),
      tags: fetchTags,
      revalidate: options.revalidate ?? this.defaultRevalidate,
      forceRefresh: options.forceRefresh ?? false
    });
    if (!res.ok) {
      throw new Error(`API Error ${res.status}: ${res.statusText}`);
    }
    return await res.json();
  }
  async prefetch(urls) {
    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      requestIdleCallback(async () => {
        await Promise.allSettled(
          urls.map(
            (url) => fetch(url, {
              priority: "low"
            })
          )
        );
      });
    }
  }
  subscribeToUpdates(callback) {
    if (this.isServer || typeof EventSource === "undefined") {
      return () => {
      };
    }
    if (!this.config.apiKey) {
      return () => {
      };
    }
    let eventSource = null;
    let retryCount = 0;
    let isClosed = false;
    const connect = () => {
      if (isClosed) return;
      const url = `${this.config.apiUrl}/content/${this.config.projectId}/updates?key=${this.config.apiKey ?? ""}`;
      eventSource = new EventSource(url);
      eventSource.onopen = () => {
        retryCount = 0;
      };
      eventSource.onmessage = (event) => {
        let data;
        try {
          data = JSON.parse(event.data);
        } catch {
          return;
        }
        if (!data || typeof data.type !== "string") {
          return;
        }
        if (data.type === "content.updated" && data.slug) {
          this.invalidateCache([CacheTags.content(data.slug)]);
        }
        if (data.type === "collection.updated" && data.collectionId) {
          this.invalidateCache([CacheTags.collection(data.collectionId)]);
        }
        if (data.type === "globals.updated") {
          this.invalidateCache([CacheTags.global]);
        }
        if (data.type === "schema.updated") {
          this.clearCache();
        }
        callback(data);
      };
      eventSource.onerror = () => {
        eventSource?.close();
        if (isClosed) return;
        const timeout = Math.min(1e3 * Math.pow(2, retryCount), 3e4);
        retryCount++;
        setTimeout(connect, timeout);
      };
    };
    connect();
    return () => {
      isClosed = true;
      eventSource?.close();
    };
  }
  writeCache(key, data, options) {
    const ttlSeconds = options.revalidate === false ? 60 : Math.max(1, options.revalidate);
    if (this.cacheStrategy === "memory") {
      this.memoryCache.set(key, data, {
        tags: options.tags,
        ttl: ttlSeconds * 1e3
      });
    }
  }
  invalidateCache(tags) {
    this.memoryCache.invalidateByTags(tags);
    if (this.browserCache) {
      this.browserCache.clear();
    }
  }
  clearCache() {
    this.memoryCache.clear();
    if (this.browserCache) {
      this.browserCache.clear();
    }
  }
  getCacheStats() {
    return {
      memory: this.memoryCache.getStats(),
      local: {
        loaded: this.localCache.isLoaded()
      }
    };
  }
  async fetchPage(slug, cacheKey, tags, revalidate, forceRefresh) {
    const url = `${this.config.apiUrl}/content/${this.config.projectId}/page/${slug}`;
    const fetchTags = [
      CacheTags.project(this.config.projectId),
      CacheTags.content(slug),
      ...tags
    ];
    const res = await this.fetchWithTimeout(url, {
      method: "GET",
      headers: this.getHeaders(),
      tags: fetchTags,
      revalidate,
      forceRefresh
    });
    if (!res.ok) {
      if (res.status === 404) {
        throw new Error(`Page '${slug}' not found.`);
      }
      if (res.status === 408) {
        throw new Error("Request timeout");
      }
      throw new Error(`API Error ${res.status}: ${res.statusText}`);
    }
    const json = await res.json();
    const etag = res.headers.get("etag");
    const cacheEntry = {
      data: json.data,
      metadata: {
        timestamp: Date.now(),
        etag: etag || void 0,
        expiresAt: revalidate === false ? Infinity : Date.now() + revalidate * 1e3,
        tags: fetchTags
      }
    };
    if (!this.isServer) {
      this.writeCache(cacheKey, cacheEntry.data, {
        revalidate,
        tags: fetchTags
      });
    }
    return cacheEntry;
  }
  async fetchCollection(collectionId, query, cacheKey, tags, revalidate, forceRefresh) {
    const params = buildQueryString(query);
    const url = `${this.config.apiUrl}/content/${this.config.projectId}/collection/${collectionId}?${params}`;
    const fetchTags = [
      CacheTags.project(this.config.projectId),
      CacheTags.collection(collectionId),
      ...tags
    ];
    const res = await this.fetchWithTimeout(url, {
      method: "GET",
      headers: this.getHeaders(),
      tags: fetchTags,
      revalidate,
      forceRefresh
    });
    if (!res.ok) {
      if (res.status === 408) {
        throw new Error("Request timeout");
      }
      throw new Error(`API Error ${res.status}: ${res.statusText}`);
    }
    const json = await res.json();
    const etag = res.headers.get("etag");
    const cacheEntry = {
      data: json,
      metadata: {
        timestamp: Date.now(),
        etag: etag || void 0,
        expiresAt: revalidate === false ? Infinity : Date.now() + revalidate * 1e3,
        tags: fetchTags
      }
    };
    if (!this.isServer) {
      this.writeCache(cacheKey, cacheEntry.data, {
        revalidate,
        tags: fetchTags
      });
    }
    return cacheEntry;
  }
  applyLocalQuery(items, query) {
    let filtered = [...items];
    if (query.search) {
      const searchLower = query.search.toLowerCase();
      filtered = filtered.filter(
        (item) => JSON.stringify(item).toLowerCase().includes(searchLower)
      );
    }
    if (query.filter) {
      filtered = filtered.filter((item) => {
        return Object.entries(query.filter).every(([key, value]) => {
          const itemValue = item[key];
          if (itemValue === void 0) {
            return false;
          }
          if (Array.isArray(value)) {
            return value.includes(itemValue);
          }
          return itemValue === value;
        });
      });
    }
    if (query.sort) {
      filtered.sort((a, b) => {
        const aVal = a[query.sort];
        const bVal = b[query.sort];
        const order = query.order === "asc" ? 1 : -1;
        if (aVal < bVal) {
          return -1 * order;
        }
        if (aVal > bVal) {
          return 1 * order;
        }
        return 0;
      });
    }
    const page = query.page || 1;
    const limit = query.limit || 10;
    const start = (page - 1) * limit;
    const end = start + limit;
    const total = filtered.length;
    return {
      items: filtered.slice(start, end),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNext: end < total,
      hasPrev: start > 0
    };
  }
  async fetchWithTimeout(url, options = {}) {
    const {
      timeout = this.config.timeout || 1e4,
      tags = [],
      revalidate,
      forceRefresh = false,
      ...fetchOptions
    } = options;
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    const nextConfig = this.isServer ? {
      cache: forceRefresh || revalidate === 0 ? "no-store" : "force-cache",
      ...forceRefresh ? {} : {
        next: {
          tags,
          revalidate: revalidate === false ? false : revalidate
        }
      }
    } : {};
    try {
      const response = await fetch(url, {
        ...fetchOptions,
        ...nextConfig,
        signal: controller.signal
      });
      clearTimeout(id);
      return response;
    } catch (error) {
      clearTimeout(id);
      throw error;
    }
  }
  getHeaders() {
    const headers = {
      "Content-Type": "application/json",
      "X-GN-Apex-Client": `gnapex-sdk/${this.config.sdkVersion ?? "1.1.6"}`,
      "X-GN-Apex-Request-ID": typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `nx_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      "X-GN-Apex-Project": this.config.projectId
    };
    if (this.config.apiKey) {
      headers["Authorization"] = `Bearer ${this.config.apiKey}`;
    }
    return headers;
  }
  isCacheValid(metadata) {
    return Date.now() < metadata.expiresAt;
  }
  normalizeError(error, context) {
    if (error instanceof Error) {
      const msg = error.message.toLowerCase();
      if (error.name === "AbortError" || error.message.includes("408") || msg.includes("timeout") || msg.includes("aborted")) {
        return new Error(`${context}: Request timeout`);
      }
      return error;
    }
    const str = String(error).toLowerCase();
    if (str.includes("408") || str.includes("timeout") || str.includes("aborted")) {
      return new Error(`${context}: Request timeout`);
    }
    return new Error(`${context}: ${String(error)}`);
  }
  cleanup() {
    if (!this.isServer) {
      window.removeEventListener("beforeunload", this.cleanup.bind(this));
    }
  }
};

// src/analytics/tracker.ts
init_config();

// src/analytics/fingerprint.ts
var cachedEntropy = null;
var getDeviceEntropy = async (allowFingerprinting = true) => {
  if (cachedEntropy) return cachedEntropy;
  if (typeof window === "undefined") return {};
  const nav = window.navigator;
  cachedEntropy = {
    screen_resolution: `${window.screen.width}x${window.screen.height}`,
    color_depth: window.screen.colorDepth,
    pixel_ratio: window.devicePixelRatio || 1,
    hardware_concurrency: nav.hardwareConcurrency,
    device_memory: nav.deviceMemory,
    // Chrome/Edge only
    timezone_offset: (/* @__PURE__ */ new Date()).getTimezoneOffset(),
    platform: nav.platform,
    language: nav.language,
    touch_support: "ontouchstart" in window || nav.maxTouchPoints > 0,
    canvas_hash: allowFingerprinting ? await generateCanvasHash() : void 0
  };
  return cachedEntropy;
};
var generateCanvasHash = async () => {
  try {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return "";
    canvas.width = 200;
    canvas.height = 50;
    ctx.textBaseline = "top";
    ctx.font = '16px "Arial"';
    ctx.fillStyle = "#f60";
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = "#069";
    ctx.fillText("GnApex Rocks! <canvas> 1.0", 2, 15);
    ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
    ctx.fillText("GnApex Rocks! <canvas> 1.0", 4, 17);
    const dataUrl = canvas.toDataURL();
    let hash = 0;
    for (let i = 0; i < dataUrl.length; i++) {
      const char = dataUrl.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return hash.toString(16);
  } catch {
    return "";
  }
};
var getVisitorId = async (allowFingerprinting = true) => {
  if (typeof window === "undefined") return "server_visitor";
  const STORAGE_KEY = "nexus_vid";
  let vid = localStorage.getItem(STORAGE_KEY);
  if (!vid) {
    const entropy = await getDeviceEntropy(allowFingerprinting);
    const random = Math.random().toString(36).substring(2, 15);
    const timestamp = Date.now().toString(36);
    const fingerprint = [
      entropy.screen_resolution,
      entropy.hardware_concurrency,
      entropy.timezone_offset,
      entropy.platform,
      entropy.canvas_hash || "standard_entropy"
    ].join("|");
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
      hash = (hash << 5) - hash + fingerprint.charCodeAt(i);
      hash |= 0;
    }
    vid = `vis_${hash.toString(16)}_${timestamp}_${random}`;
    localStorage.setItem(STORAGE_KEY, vid);
  }
  return vid;
};

// src/analytics/vitals.ts
import { onCLS, onLCP, onTTFB, onINP, onFCP } from "web-vitals";
var METRIC_KEY_MAP = {
  CLS: "cls",
  LCP: "lcp",
  INP: "inp",
  TTFB: "ttfb",
  FCP: "fcp"
};
var VitalsCollector = class {
  constructor() {
    this.metrics = {};
    this.hasUpdates = false;
    if (typeof window !== "undefined") {
      this.init();
    }
  }
  init() {
    const recordMetric = (metric) => {
      const key = METRIC_KEY_MAP[metric.name];
      this.metrics[key] = metric.value;
      this.hasUpdates = true;
    };
    onCLS(recordMetric);
    onLCP(recordMetric);
    onTTFB(recordMetric);
    onINP(recordMetric);
    onFCP(recordMetric);
    const navEntry = performance.getEntriesByType("navigation")[0];
    if (navEntry) {
      this.metrics.navigation_timing = {
        dns_lookup: navEntry.domainLookupEnd - navEntry.domainLookupStart,
        tcp_connect: navEntry.connectEnd - navEntry.connectStart,
        request_time: navEntry.responseEnd - navEntry.requestStart,
        dom_load: navEntry.domComplete - navEntry.domInteractive,
        domain_lookup_start: navEntry.domainLookupStart,
        domain_lookup_end: navEntry.domainLookupEnd,
        connect_start: navEntry.connectStart,
        connect_end: navEntry.connectEnd,
        secure_connection_start: navEntry.secureConnectionStart > 0 ? navEntry.secureConnectionStart : void 0
      };
      this.hasUpdates = true;
    }
    const resourceEntries = performance.getEntriesByType(
      "resource"
    );
    if (resourceEntries.length > 0) {
      this.metrics.resources = resourceEntries.filter(
        (r) => !r.name.includes("/api/collect") && !r.name.includes("/analytics") && !r.name.includes("sentry.gnapex.com")
      ).sort((a, b) => b.duration - a.duration).slice(0, 5).map((r) => ({
        name: r.name.length > 120 ? r.name.substring(0, 120) + "..." : r.name,
        initiatorType: r.initiatorType,
        duration: Math.round(r.duration),
        transferSize: r.transferSize > 0 ? r.transferSize : void 0,
        encodedBodySize: r.encodedBodySize > 0 ? r.encodedBodySize : void 0,
        decodedBodySize: r.decodedBodySize > 0 ? r.decodedBodySize : void 0,
        startTime: Math.round(r.startTime),
        responseEnd: Math.round(r.responseEnd)
      }));
      this.hasUpdates = true;
    }
    const mem = performance.memory;
    if (mem) {
      this.metrics.memory_usage = {
        used_js_heap_size: mem.usedJSHeapSize,
        total_js_heap_size: mem.totalJSHeapSize,
        js_heap_size_limit: mem.jsHeapSizeLimit
      };
      this.hasUpdates = true;
    }
  }
  getMetricsSnapshot() {
    if (!this.hasUpdates) return null;
    this.hasUpdates = false;
    const snapshot = { ...this.metrics };
    this.metrics.resources = void 0;
    return snapshot;
  }
};
var vitalsCollector = new VitalsCollector();
var initVitals = (_tracker) => {
  if (process.env.NODE_ENV === "development") {
    console.log("[GN-Apex] Web Vitals monitoring active");
  }
};

// src/analytics/storage.ts
var DB_NAME = "GnApex_Analytics";
var STORE_NAME = "events_queue";
var DB_VERSION = 2;
var MAX_QUEUE_SIZE = 500;
var EventStorage = class {
  constructor() {
    this.db = null;
    this.isReady = this.init();
  }
  init() {
    if (typeof window === "undefined" || !window.indexedDB) {
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onerror = () => {
        console.warn(
          "[GnApex] Failed to open IndexedDB. Falling back to memory."
        );
        resolve();
      };
      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve();
      };
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (db.objectStoreNames.contains(STORE_NAME)) {
          db.deleteObjectStore(STORE_NAME);
        }
        db.createObjectStore(STORE_NAME, {
          keyPath: "id",
          autoIncrement: true
        });
      };
    });
  }
  /**
   * Add an event to the persistent queue.
   * Evicts the oldest entry if the queue is already at MAX_QUEUE_SIZE.
   */
  async enqueue(payload) {
    await this.isReady;
    if (!this.db) return;
    const currentCount = await this.count();
    if (currentCount >= MAX_QUEUE_SIZE) {
      const oldest = await this.peek(1);
      if (oldest.length > 0 && oldest[0].id !== void 0) {
        await this.remove([oldest[0].id]);
      }
    }
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.add({
        payload,
        timestamp: Date.now(),
        retryCount: 0
      });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
  /**
   * Get a batch of the oldest events without removing them.
   */
  async peek(limit = 20) {
    await this.isReady;
    if (!this.db) return [];
    return new Promise((resolve) => {
      const transaction = this.db.transaction([STORE_NAME], "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll(null, limit);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve([]);
    });
  }
  /**
   * Remove events by ID after a successful upload.
   */
  async remove(ids) {
    await this.isReady;
    if (!this.db || ids.length === 0) return;
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(new Error("Delete transaction aborted"));
      ids.forEach((id) => {
        store.delete(id);
      });
    });
  }
  /**
   * Count pending events in the queue.
   */
  async count() {
    await this.isReady;
    if (!this.db) return 0;
    return new Promise((resolve) => {
      const transaction = this.db.transaction([STORE_NAME], "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.count();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(0);
    });
  }
};
var eventStorage = new EventStorage();

// src/analytics/tracker.ts
var safeGetItem = (key) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};
var safeSetItem = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch {
  }
};
var safeRemoveItem = (key) => {
  try {
    localStorage.removeItem(key);
  } catch {
  }
};
var generateUUID = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === "x" ? r : r & 3 | 8;
    return v.toString(16);
  });
};
var Tracker = class {
  constructor(config) {
    this.sessionId = "";
    this.visitorId = "";
    this.anonymousId = "";
    this.isFlushing = false;
    this.flushPromise = null;
    // 🛡️ Batch size set to 10 to keep payloads strictly under Actix 32KB limit
    this.batchSize = 10;
    this.config = config;
    this.endpoint = `${this.config.analyticsUrl}/api/collect`;
    this.circuitBreaker = new CircuitBreaker();
    this.sessionStart = Date.now();
    if (typeof window !== "undefined") {
      this.initSession();
      this.startFlushing();
    }
  }
  async initSession() {
    this.visitorId = await getVisitorId(
      this.config.privacy?.fingerprinting ?? true
    );
    let anonId = safeGetItem("nexus_anon_id");
    if (!anonId) {
      anonId = `anon_${generateUUID().replace(/-/g, "")}`;
      safeSetItem("nexus_anon_id", anonId);
    }
    this.anonymousId = anonId;
    let sid = safeGetItem("nexus_sid");
    const lastActivity = safeGetItem("nexus_last_active");
    const now = Date.now();
    const SESSION_TIMEOUT = 30 * 60 * 1e3;
    const isExpired = !sid || !lastActivity || now - parseInt(lastActivity, 10) > SESSION_TIMEOUT;
    if (isExpired) {
      const uuid2 = generateUUID().replace(/-/g, "").substring(0, 16);
      sid = `sess_${uuid2}_${now}`;
      safeSetItem("nexus_sid", sid);
      this.sessionStart = now;
    }
    safeSetItem("nexus_last_active", now.toString());
    this.sessionId = sid;
  }
  async send(eventType, data = {}, eventName, ecommerce) {
    if (typeof window === "undefined") return;
    safeSetItem("nexus_last_active", Date.now().toString());
    const entropy = await getDeviceEntropy(
      this.config.privacy?.fingerprinting ?? true
    );
    const isPageView = eventType === "page_view" || eventType === "performance";
    const perfMetrics = isPageView ? vitalsCollector.getMetricsSnapshot() : void 0;
    const utmParams = isPageView ? extractUtmParams(window.location.href) : void 0;
    const payload = {
      projectId: this.config.projectId,
      sessionId: this.sessionId,
      visitorId: this.visitorId,
      anonymousId: this.anonymousId,
      messageId: generateUUID(),
      sentAt: (/* @__PURE__ */ new Date()).toISOString(),
      version: SDK_VERSION,
      url: window.location.href,
      referrer: isPageView ? document.referrer : void 0,
      userAgent: isPageView ? window.navigator.userAgent : void 0,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      language: window.navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      eventType,
      eventName,
      eventData: data,
      ecommerce: ecommerce ?? void 0,
      performance: perfMetrics || void 0,
      context: {
        device: {
          hardwareConcurrency: entropy.hardware_concurrency,
          deviceMemory: entropy.device_memory,
          pixelRatio: entropy.pixel_ratio,
          platform: entropy.platform,
          ...this.config.privacy?.fingerprinting ? { canvasFingerprint: entropy.canvas_hash } : {}
        },
        visitorIdLocal: this.visitorId,
        utm: utmParams
      },
      clientTimestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
    await eventStorage.enqueue(payload);
    const count = await eventStorage.count();
    if (count >= 10 || eventType === "purchase" || eventType === "identify") {
      this.flushQueue();
    }
  }
  startFlushing() {
    this.flushInterval = setInterval(() => this.flushQueue(), 5e3);
    window.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") this.flushQueue(true);
    });
  }
  async flushQueue(useBeacon = false) {
    if (this.flushPromise) return this.flushPromise;
    this.flushPromise = (async () => {
      if (this.circuitBreaker.isOpen()) return;
      try {
        const storedEvents = await eventStorage.peek(this.batchSize);
        if (!storedEvents.length) return;
        const payloads = storedEvents.map((e) => e.payload);
        const headers = {
          "Content-Type": "application/json",
          Authorization: this.config.apiKey ? `Bearer ${this.config.apiKey}` : "",
          "X-Nexus-Client": `analytics/${SDK_VERSION}`,
          "X-Nexus-Project": this.config.projectId
        };
        let response;
        try {
          response = await fetch(
            `${this.config.analyticsUrl}/api/collect/batch`,
            {
              method: "POST",
              headers,
              body: JSON.stringify({ events: payloads }),
              keepalive: useBeacon
            }
          );
        } catch {
          response = void 0;
        }
        if (response && response.status === 413) {
          await eventStorage.remove(storedEvents.map((e) => e.id));
          return;
        }
        if (!response || response.status === 404 || response.status === 405) {
          const results = await Promise.allSettled(
            payloads.map(
              (event) => fetch(this.endpoint, {
                method: "POST",
                headers,
                body: JSON.stringify(event),
                keepalive: useBeacon
              })
            )
          );
          const successIds = results.flatMap(
            (r, i) => r.status === "fulfilled" && (r.value.ok || r.value.status === 413) ? [storedEvents[i].id] : []
          );
          if (successIds.length) await eventStorage.remove(successIds);
          if (successIds.length === storedEvents.length) {
            this.circuitBreaker.recordSuccess();
          } else {
            this.circuitBreaker.recordFailure();
          }
        } else if (response.ok) {
          await eventStorage.remove(storedEvents.map((e) => e.id));
          this.circuitBreaker.recordSuccess();
        } else {
          this.circuitBreaker.recordFailure();
        }
      } catch (err) {
        this.circuitBreaker.recordFailure();
        if (this.config.debug) {
          console.warn("[GN-Apex] Analytics flush deferred:", err);
        }
      } finally {
        this.flushPromise = null;
      }
    })();
    return this.flushPromise;
  }
  getSession() {
    return this.sessionId;
  }
  getVisitorId() {
    return this.visitorId;
  }
  getAnonymousId() {
    return this.anonymousId;
  }
  getSessionDuration() {
    return Date.now() - this.sessionStart;
  }
  clearIdentity() {
    safeRemoveItem("nexus_anon_id");
    this.anonymousId = "";
  }
  stop() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    this.flushQueue(true);
  }
};
function extractUtmParams(url) {
  try {
    const params = new URL(url).searchParams;
    const utmKeys = [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_term",
      "utm_content"
    ];
    const result = {};
    utmKeys.forEach((key) => {
      const val = params.get(key);
      if (val) result[key] = val;
    });
    return result;
  } catch {
    return {};
  }
}

// src/analytics/index.ts
var safeRemoveItem2 = (key) => {
  try {
    localStorage.removeItem(key);
  } catch {
  }
};
var AnalyticsEngine = class {
  constructor(config) {
    this.cleanupFns = [];
    this.isInitialized = false;
    this.maxScrollDepth = 0;
    this.scrollThresholdsFired = /* @__PURE__ */ new Set();
    this.lastPath = typeof window !== "undefined" ? window.location.pathname : "";
    this.clickBuffer = [];
    this.tracker = new Tracker(config);
  }
  start() {
    if (this.isInitialized || typeof window === "undefined") return;
    this.isInitialized = true;
    this.pageView();
    initVitals(this.tracker);
    this.setupClickTracking();
    this.setupFormTracking();
    this.setupRouteTracking();
    this.setupShareTracking();
    this.setupScrollTracking();
    this.setupOutboundTracking();
    this.setupVideoTracking();
    this.setupErrorTracking();
    if (process.env.NODE_ENV === "development") {
      console.log("[GnApex] \u{1F680} Analytics Engine Started");
    }
  }
  pageView(customReferrer) {
    if (typeof window === "undefined") return;
    const currentPath = window.location.pathname;
    this.maxScrollDepth = 0;
    this.scrollThresholdsFired.clear();
    this.tracker.send("page_view", {
      path: currentPath,
      search: window.location.search,
      title: document.title,
      timezone_offset: (/* @__PURE__ */ new Date()).getTimezoneOffset(),
      referrer: customReferrer || (this.lastPath !== currentPath ? this.lastPath : document.referrer)
    });
    this.lastPath = currentPath;
  }
  setupShareTracking() {
    if (typeof window === "undefined") return;
    const copyHandler = () => {
      this.tracker.send("social_share", {
        method: "clipboard_copy",
        url: window.location.href
      });
    };
    window.addEventListener("copy", copyHandler, { passive: true });
    this.cleanupFns.push(() => window.removeEventListener("copy", copyHandler));
    if (typeof navigator !== "undefined" && navigator.share) {
      const originalShare = navigator.share.bind(navigator);
      navigator.share = (data) => {
        this.tracker.send("social_share", {
          method: "native_share_menu",
          url: data?.url || window.location.href,
          title: data?.title
        });
        return originalShare(data);
      };
      this.cleanupFns.push(() => {
        navigator.share = originalShare;
      });
    }
  }
  setupScrollTracking() {
    if (typeof window === "undefined") return;
    const THRESHOLDS = [25, 50, 75, 100];
    const scrollHandler = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (docHeight <= 0) return;
      const pct = Math.round(scrollTop / docHeight * 100);
      if (pct > this.maxScrollDepth) {
        this.maxScrollDepth = pct;
      }
      clearTimeout(this.scrollTimer);
      this.scrollTimer = setTimeout(() => {
        for (const threshold of THRESHOLDS) {
          if (this.maxScrollDepth >= threshold && !this.scrollThresholdsFired.has(threshold)) {
            this.scrollThresholdsFired.add(threshold);
            this.tracker.send("scroll", {
              depth: threshold / 100,
              depth_percent: threshold,
              path: window.location.pathname
            });
          }
        }
      }, 300);
    };
    window.addEventListener("scroll", scrollHandler, { passive: true });
    this.cleanupFns.push(() => {
      window.removeEventListener("scroll", scrollHandler);
      clearTimeout(this.scrollTimer);
    });
  }
  setupClickTracking() {
    if (typeof window === "undefined") return;
    const clickHandler = (e) => {
      const target = e.target;
      const link = target.closest("a");
      if (link) {
        this.tracker.send("click", {
          element_type: "link",
          href: link.href,
          text: link.innerText?.substring(0, 50),
          id: link.id,
          classes: link.className,
          dataset: { ...link.dataset },
          coordinates: { x: e.clientX, y: e.clientY }
        });
      }
      const button = target.closest("button");
      if (button) {
        this.tracker.send("click", {
          element_type: "button",
          text: button.innerText?.substring(0, 50),
          id: button.id,
          classes: button.className,
          coordinates: { x: e.clientX, y: e.clientY }
        });
      }
      const now = Date.now();
      const ZONE = 400;
      const WINDOW_MS = 1e3;
      const RAGE_THRESHOLD = 3;
      this.clickBuffer.push({ x: e.clientX, y: e.clientY, t: now });
      this.clickBuffer = this.clickBuffer.filter((c) => now - c.t < WINDOW_MS);
      const zone = {
        x: Math.floor(e.clientX / ZONE),
        y: Math.floor(e.clientY / ZONE)
      };
      const zoneClicks = this.clickBuffer.filter(
        (c) => Math.floor(c.x / ZONE) === zone.x && Math.floor(c.y / ZONE) === zone.y
      );
      if (zoneClicks.length >= RAGE_THRESHOLD) {
        this.tracker.send(
          "click",
          {
            element_type: target.tagName.toLowerCase(),
            event_name: "rage_click",
            coordinates: { x: e.clientX, y: e.clientY },
            click_count: zoneClicks.length,
            path: window.location.pathname
          },
          "rage_click"
        );
        this.clickBuffer = [];
      }
      const isInteractive = target.closest(
        "a, button, input, select, textarea, [onclick], [role='button']"
      );
      if (!isInteractive) {
        const pathBefore = window.location.pathname;
        setTimeout(() => {
          const pathAfter = window.location.pathname;
          if (pathBefore === pathAfter) {
            this.tracker.send(
              "click",
              {
                element_type: target.tagName.toLowerCase(),
                event_name: "dead_click",
                selector: getSelector(target),
                coordinates: { x: e.clientX, y: e.clientY },
                path: window.location.pathname
              },
              "dead_click"
            );
          }
        }, 300);
      }
    };
    window.addEventListener("click", clickHandler, { passive: true });
    this.cleanupFns.push(
      () => window.removeEventListener("click", clickHandler)
    );
  }
  setupFormTracking() {
    if (typeof document === "undefined") return;
    const submitHandler = (e) => {
      const form = e.target;
      if (form) {
        this.tracker.send("form_submit", {
          form_id: form.id || form.name || "unknown_form",
          action: form.action,
          method: form.method,
          field_count: form.elements.length
        });
      }
    };
    document.addEventListener("submit", submitHandler, { passive: true });
    this.cleanupFns.push(
      () => document.removeEventListener("submit", submitHandler)
    );
  }
  setupOutboundTracking() {
    if (typeof window === "undefined") return;
    const outboundHandler = (e) => {
      const link = e.target.closest("a");
      if (!link || !link.href) return;
      try {
        const linkHost = new URL(link.href).hostname;
        if (linkHost && linkHost !== window.location.hostname) {
          this.tracker.send(
            "click",
            {
              event_name: "outbound_click",
              href: link.href,
              text: link.innerText?.substring(0, 50),
              destination_host: linkHost,
              coordinates: { x: e.clientX, y: e.clientY }
            },
            "outbound_click"
          );
        }
      } catch {
      }
    };
    window.addEventListener("click", outboundHandler, { passive: true });
    this.cleanupFns.push(
      () => window.removeEventListener("click", outboundHandler)
    );
  }
  setupVideoTracking() {
    if (typeof document === "undefined") return;
    const attach = (video) => {
      const v = video;
      if (v.__gnexusTracked) return;
      v.__gnexusTracked = true;
      v.__gnexusMilestones = /* @__PURE__ */ new Set();
      const src = () => video.currentSrc || video.src || "unknown";
      const emit = (name, data = {}) => this.tracker.send("media", { media_type: "video", event_name: name, src: src(), ...data }, name);
      video.addEventListener("loadedmetadata", () => emit("video_loaded", { duration_seconds: Number.isFinite(video.duration) ? Math.round(video.duration) : void 0 }));
      video.addEventListener("play", () => emit("video_play", { position_seconds: Math.round(video.currentTime) }));
      video.addEventListener("pause", () => emit("video_pause", { position_seconds: Math.round(video.currentTime) }));
      video.addEventListener("seeking", () => emit("video_seek", { position_seconds: Math.round(video.currentTime) }));
      video.addEventListener("ended", () => emit("video_complete", { duration_seconds: Math.round(video.duration) }));
      video.addEventListener("error", () => emit("video_error"));
      video.addEventListener("timeupdate", () => {
        if (!Number.isFinite(video.duration) || video.duration <= 0) return;
        for (const milestone of [25, 50, 75, 90, 100]) {
          if (video.currentTime / video.duration * 100 >= milestone && !v.__gnexusMilestones.has(milestone)) {
            v.__gnexusMilestones.add(milestone);
            emit(`video_${milestone}_percent`, { progress: milestone / 100 });
          }
        }
      });
    };
    document.querySelectorAll("video").forEach((v) => attach(v));
    const observer = new MutationObserver((ms) => ms.forEach((m) => m.addedNodes.forEach((n) => {
      if (n instanceof HTMLVideoElement) attach(n);
      if (n instanceof Element) n.querySelectorAll("video").forEach((v) => attach(v));
    })));
    if (document.body) observer.observe(document.body, { childList: true, subtree: true });
    this.cleanupFns.push(() => observer.disconnect());
  }
  setupErrorTracking() {
    if (typeof window === "undefined") return;
    const errorHandler = (e) => {
      this.tracker.send("error", {
        message: e.message,
        filename: e.filename,
        lineno: e.lineno,
        colno: e.colno,
        stack: e.error?.stack,
        url: window.location.href,
        type: "uncaught_error"
      });
    };
    const rejectionHandler = (e) => {
      const reason = e.reason instanceof Error ? e.reason.message : String(e.reason);
      const stack = e.reason instanceof Error ? e.reason.stack : void 0;
      this.tracker.send("error", {
        message: reason,
        stack,
        url: window.location.href,
        type: "unhandled_rejection"
      });
    };
    window.addEventListener("error", errorHandler);
    window.addEventListener("unhandledrejection", rejectionHandler);
    this.cleanupFns.push(() => {
      window.removeEventListener("error", errorHandler);
      window.removeEventListener("unhandledrejection", rejectionHandler);
    });
  }
  setupRouteTracking() {
    if (typeof window === "undefined" || typeof window.history === "undefined")
      return;
    const originalPushState = history.pushState.bind(history);
    const originalReplaceState = history.replaceState.bind(history);
    history.pushState = (...args) => {
      const prevPath = window.location.pathname;
      originalPushState(...args);
      if (!this.isInitializedByReactProvider()) {
        this.pageView(prevPath);
      }
    };
    history.replaceState = (...args) => {
      originalReplaceState(...args);
    };
    const popStateHandler = () => {
      if (!this.isInitializedByReactProvider()) {
        this.pageView();
      }
    };
    window.addEventListener("popstate", popStateHandler);
    this.cleanupFns.push(() => {
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
      window.removeEventListener("popstate", popStateHandler);
    });
  }
  isInitializedByReactProvider() {
    return !!document.getElementById("__nexus_react_active");
  }
  async identify(userId, traits = {}) {
    return this.sendIdentityRequest("identify", { user_id: userId, traits });
  }
  async group(groupId, traits = {}) {
    return this.sendIdentityRequest("group", { group_id: groupId, traits });
  }
  async alias(newId) {
    return this.sendIdentityRequest("alias", {
      previous_id: this.tracker.getSession(),
      user_id: newId
    });
  }
  reset(performGdprScrub = false) {
    const config = this.tracker.config;
    this.tracker.stop();
    localStorage.removeItem("nexus_sid");
    localStorage.removeItem("nexus_vid");
    safeRemoveItem2("nexus_anon_id");
    this.tracker.clearIdentity();
    if (performGdprScrub) {
      const endpoint = `${config.analyticsUrl}/api/privacy/scrub`;
      const userId = this.tracker.getVisitorId();
      fetch(endpoint, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.apiKey}`
        },
        body: JSON.stringify({
          project_id: config.projectId,
          user_id: userId
        })
      }).catch((err) => console.error("[GnApex] Privacy scrub failed:", err));
    }
    window.location.reload();
  }
  track(eventName, properties = {}) {
    this.tracker.send(
      "custom_event",
      { event_name: eventName, ...properties },
      eventName
    );
  }
  trackPurchase(orderData) {
    const ecommerce = {
      orderId: orderData.orderId,
      total: orderData.total,
      revenue: orderData.revenue ?? orderData.total,
      currency: orderData.currency || "USD",
      products: orderData.products.map((p) => ({
        productId: p.id,
        sku: p.sku,
        name: p.name,
        price: p.price,
        quantity: p.quantity
      }))
    };
    this.tracker.send(
      "purchase",
      { order_id: orderData.orderId },
      "purchase",
      ecommerce
    );
  }
  trackError(error, context) {
    this.tracker.send("error", {
      message: error.message,
      stack: error.stack,
      context,
      url: typeof window !== "undefined" ? window.location.href : "",
      type: "manual"
    });
  }
  async sendIdentityRequest(type, data) {
    try {
      const config = this.tracker.config;
      const endpoint = `${config.analyticsUrl}/api/${type}`;
      const payload = {
        projectId: config.projectId,
        sessionId: this.tracker.getSession(),
        visitorId: this.tracker.getVisitorId(),
        anonymousId: this.tracker.getAnonymousId(),
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        ...data
      };
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.apiKey}`
        },
        body: JSON.stringify(payload)
      });
      return response.ok;
    } catch (error) {
      console.error(`[GnApex] ${type} failed:`, error);
      return false;
    }
  }
  getSessionId() {
    return this.tracker.getSession();
  }
  stop(isFinalShutdown = false) {
    this.cleanupFns.forEach((fn) => fn());
    this.cleanupFns = [];
    if (isFinalShutdown) {
      this.tracker.send("session_end", {
        session_id: this.tracker.getSession(),
        duration: this.tracker.getSessionDuration(),
        max_scroll_depth: this.maxScrollDepth / 100
      });
    }
    this.tracker.stop();
    this.isInitialized = false;
  }
};
function getSelector(el, depth = 0) {
  if (!el || depth > 2) return "";
  const tag = el.tagName.toLowerCase();
  const id = el.id ? `#${el.id}` : "";
  const cls = el.className && typeof el.className === "string" ? `.${el.className.trim().split(/\s+/).slice(0, 2).join(".")}` : "";
  const self = `${tag}${id}${cls}`;
  const parent = el.parentElement && depth < 2 ? `${getSelector(el.parentElement, depth + 1)} > ` : "";
  return `${parent}${self}`;
}

// src/errors.ts
var NexusError = class extends Error {
  constructor(message, code = "UNKNOWN", status, requestId, details, retryable = false, cause) {
    super(message);
    this.code = code;
    this.status = status;
    this.requestId = requestId;
    this.details = details;
    this.retryable = retryable;
    this.cause = cause;
    this.name = "NexusError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
};
var isNexusError = (e) => e instanceof NexusError;

// src/events.ts
var NexusEventBus = class {
  constructor() {
    this.listeners = /* @__PURE__ */ new Map();
  }
  on(event, listener) {
    const set = this.listeners.get(event) ?? /* @__PURE__ */ new Set();
    set.add(listener);
    this.listeners.set(event, set);
    return () => set.delete(listener);
  }
  emit(event, payload) {
    this.listeners.get(event)?.forEach((l) => {
      try {
        l(payload);
      } catch {
      }
    });
  }
  clear() {
    this.listeners.clear();
  }
};

// src/http.ts
var uuid = () => typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `nx_${Date.now()}_${Math.random().toString(36).slice(2)}`;
var NexusHttpClient = class {
  constructor(config, events = new NexusEventBus()) {
    this.config = config;
    this.events = events;
    this.breaker = new CircuitBreaker();
    this.limiter = new RateLimiter({
      maxRequests: config.debug ? 200 : 100,
      timeWindow: 6e4
    });
    this.backoff = new ExponentialBackoff({
      maxRetries: config.retries ?? 3,
      baseDelay: 150,
      maxDelay: 8e3,
      jitter: true
    });
  }
  updateConfig(config) {
    this.config = config;
  }
  async request(input, options = {}) {
    if (this.breaker.isOpen()) {
      throw new NexusError(
        "GN-Apex service circuit is open",
        "CIRCUIT_OPEN",
        void 0,
        void 0,
        void 0,
        true
      );
    }
    const requestId = uuid();
    const url = input;
    const started = Date.now();
    const headers = new Headers(options.headers);
    headers.set("X-Nexus-Request-ID", requestId);
    headers.set(
      "X-Nexus-Client",
      `gnexus-sdk/${this.config.sdkVersion ?? "1.1.0"}`
    );
    headers.set("X-Nexus-Project", this.config.projectId);
    if (this.config.apiKey)
      headers.set("Authorization", `Bearer ${this.config.apiKey}`);
    this.events.emit("request:start", {
      requestId,
      url,
      method: options.method ?? "GET"
    });
    try {
      await this.limiter.checkLimit();
      const response = await this.backoff.execute(async () => {
        const controller = new AbortController();
        const timeout = options.timeout ?? this.config.timeout ?? 1e4;
        const timer = setTimeout(() => controller.abort(), timeout);
        try {
          return await fetch(url, {
            ...options,
            headers,
            signal: options.signal ?? controller.signal
          });
        } catch (e) {
          if (e?.name === "AbortError") {
            throw new NexusError(
              `Request timed out after ${timeout}ms`,
              "TIMEOUT",
              void 0,
              requestId,
              void 0,
              true,
              e
            );
          }
          throw new NexusError(
            "Network request failed",
            "NETWORK_ERROR",
            void 0,
            requestId,
            void 0,
            true,
            e
          );
        } finally {
          clearTimeout(timer);
        }
      });
      if (!response.ok) {
        const retryable = response.status === 408 || response.status === 429 || response.status >= 500;
        let details;
        try {
          details = await response.clone().json();
        } catch {
        }
        const code = response.status === 404 ? "NOT_FOUND" : response.status === 429 ? "RATE_LIMITED" : "HTTP_ERROR";
        const err = new NexusError(
          `API request failed (${response.status})`,
          code,
          response.status,
          response.headers.get("x-nexus-request-id") ?? requestId,
          details,
          retryable
        );
        throw err;
      }
      this.breaker.recordSuccess();
      this.events.emit("request:end", {
        requestId,
        url,
        status: response.status,
        duration: Date.now() - started
      });
      return response;
    } catch (e) {
      if (e instanceof NexusError) {
        if (e.retryable || e.status && (e.status >= 500 || e.status === 429)) {
          this.breaker.recordFailure();
        } else {
          this.breaker.recordSuccess();
        }
      } else {
        this.breaker.recordFailure();
      }
      this.events.emit("error", { error: e });
      throw e;
    }
  }
  getStats() {
    return {
      rateLimit: this.limiter.getStats(),
      circuit: this.breaker.getState()
    };
  }
};

// src/flags.ts
var FeatureFlags = class {
  constructor(initial) {
    this.values = {};
    this.values = { ...initial };
  }
  set(values) {
    this.values = { ...this.values, ...values };
  }
  isEnabled(key, fallback = false) {
    const v = this.values[key];
    return typeof v === "boolean" ? v : fallback;
  }
  get(key, fallback) {
    return this.values[key] ?? fallback;
  }
  all() {
    return { ...this.values };
  }
};
var RemoteConfig = class {
  constructor() {
    this.values = {};
  }
  set(values) {
    this.values = { ...this.values, ...values };
  }
  get(key, fallback) {
    return this.values[key] ?? fallback;
  }
  all() {
    return { ...this.values };
  }
};

// src/diagnostics.ts
var getDiagnostics = (version, environment) => ({ version, environment, online: typeof navigator === "undefined" ? true : navigator.onLine, userAgent: typeof navigator === "undefined" ? void 0 : navigator.userAgent, memory: typeof performance !== "undefined" && "memory" in performance ? performance.memory?.usedJSHeapSize : void 0 });

// src/client.ts
var NexusClient = class {
  constructor(config = {}) {
    const full = getFullConfig(config);
    this.config = {
      debug: false,
      cacheStrategy: "memory",
      revalidateTime: false,
      timeout: 1e4,
      retries: 3,
      sdkVersion: SDK_VERSION,
      cacheInvalidation: "platform",
      environment: typeof process !== "undefined" && process.env?.NODE_ENV === "development" ? "development" : "production",
      autoTracking: true,
      publicKeyOnly: true,
      // 🚀 Default: fingerprinting: true (Active by default for high-precision analytics)
      privacy: { analytics: true, fingerprinting: true, redact: true },
      ...full,
      ...config
    };
    const errors = validateConfig(this.config);
    if (errors.length && this.config.debug) {
      console.warn("[GN-Apex] Configuration warnings:", errors);
    }
    this.events = new NexusEventBus();
    this.http = new NexusHttpClient(this.config, this.events);
    this.flags = new FeatureFlags();
    this.remoteConfig = new RemoteConfig();
    this.content = new ContentEngine(this.config);
    if (typeof window !== "undefined" && this.config.autoTracking !== false && this.config.privacy?.analytics !== false) {
      this.analytics = new AnalyticsEngine(this.config);
      this.analytics.start();
    }
  }
  /**
   * Helper alias for cleaner page content fetching.
   */
  getPage(slug, options) {
    return this.content.getPage(slug, options);
  }
  /**
   * Returns a readonly snapshot of the active configuration.
   */
  getConfig() {
    return Object.freeze({
      ...this.config,
      privacy: { ...this.config.privacy }
    });
  }
  /**
   * Updates runtime configuration dynamically without breaking active listeners.
   */
  updateConfig(updates) {
    this.config = {
      ...this.config,
      ...updates,
      privacy: { ...this.config.privacy, ...updates.privacy }
    };
    this.http.updateConfig(this.config);
    this.content.updateConfig?.(this.config);
    if (typeof window !== "undefined" && this.config.autoTracking !== false && this.config.privacy?.analytics !== false && !this.analytics) {
      this.analytics = new AnalyticsEngine(this.config);
      this.analytics.start();
    }
    if (this.config.privacy?.analytics === false) {
      this.analytics?.stop();
    }
  }
  /**
   * Returns deep system diagnostics including HTTP and cache performance.
   */
  diagnostics() {
    return {
      ...getDiagnostics(SDK_VERSION, this.config.environment ?? "production"),
      cache: this.content.getCacheStats(),
      http: this.http.getStats(),
      analyticsQueue: this.analytics ? void 0 : 0
    };
  }
  /**
   * Gracefully terminates background tasks and cleans up listeners.
   */
  destroy() {
    this.analytics?.stop(true);
    this.content.cleanup?.();
    this.events.clear();
  }
};
var nexus = new NexusClient();
var createNexusClient = (config = {}) => new NexusClient(config);

// src/index.ts
init_config();

// src/notifications/push-client.ts
var NexusPushClient = class {
  constructor(config) {
    this.config = config;
  }
  /**
   * Helper to convert Base64 VAPID key to Uint8Array for WebPush security
   */
  urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
  /**
   * Requests browser notification permissions and registers the WebPush subscription
   */
  async requestSubscription(serviceWorkerPath = "/sw.js") {
    if (typeof window === "undefined" || !("serviceWorker" in navigator) || !("PushManager" in window)) {
      console.warn(
        "[GnApex] Push notifications are not supported in this browser environment."
      );
      return false;
    }
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        console.warn("[GnApex] Notification permission denied by user.");
        return false;
      }
      const vapidRes = await fetch(
        `${this.config.apiUrl}/notifications/vapid-key`,
        {
          headers: {
            Authorization: `Bearer ${this.config.apiKey}`,
            "x-nexus-project": this.config.projectId
          }
        }
      );
      if (!vapidRes.ok) throw new Error("Failed to fetch VAPID public key.");
      const { publicKey } = await vapidRes.json();
      const registration = await navigator.serviceWorker.register(serviceWorkerPath);
      await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        // 🚀 RESOLVED: Cast as 'any' to bypass strict DOM BufferSource typings
        applicationServerKey: this.urlBase64ToUint8Array(publicKey)
      });
      const rawSub = subscription.toJSON();
      if (!rawSub.endpoint || !rawSub.keys?.auth || !rawSub.keys?.p256dh) {
        throw new Error(
          "Malformed subscription payload received from browser."
        );
      }
      const res = await fetch(
        `${this.config.apiUrl}/notifications/project/${this.config.projectId}/subscribe`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.config.apiKey}`,
            "x-nexus-project": this.config.projectId
          },
          body: JSON.stringify({
            endpoint: rawSub.endpoint,
            auth: rawSub.keys.auth,
            p256dh: rawSub.keys.p256dh,
            provider: "WEB_PUSH"
          })
        }
      );
      return res.ok;
    } catch (err) {
      console.error("[GnApex] WebPush subscription failed:", err);
      return false;
    }
  }
};

// src/index.ts
var VERSION = "1.1.0";
export {
  AnalyticsEngine,
  BrowserCache,
  CacheTags,
  ContentEngine,
  DEFAULT_ANALYTICS_URL,
  DEFAULT_API_URL,
  FeatureFlags,
  LOCAL_NEST_URL,
  LOCAL_RUST_URL,
  LocalCacheProxy as LocalCache,
  MemoryCache,
  NexusClient,
  NexusError,
  NexusEventBus,
  NexusHttpClient,
  NexusPushClient,
  RemoteConfig,
  SDK_VERSION,
  VERSION,
  createNexusClient,
  getDiagnostics,
  getEnvConfig,
  getFullConfig,
  hasRequiredConfig,
  isNexusError,
  mergeConfigs,
  nexus,
  validateConfig
};
