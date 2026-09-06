"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/content/local-cache-client.ts
var local_cache_client_exports = {};
__export(local_cache_client_exports, {
  LocalCache: () => LocalCache
});
module.exports = __toCommonJS(local_cache_client_exports);
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  LocalCache
});
