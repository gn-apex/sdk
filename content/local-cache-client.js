// src/content/local-cache-client.ts
var LocalCache = class {
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
export {
  LocalCache
};
