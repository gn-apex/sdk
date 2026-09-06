// src/content/local-cache-server.ts
import fs from "fs";
import path from "path";

// src/config.ts
var DEFAULT_API_URL = "https://api.gnapex.com";
var DEFAULT_ANALYTICS_URL = "https://sentry.gnapex.com";
var LOCAL_NEST_URL = "https://api.gnapex.com";
var LOCAL_RUST_URL = "https://sentry.gnapex.com";
var getEnvConfig = () => {
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

// src/content/binary-compiler.ts
import * as crypto from "crypto";
var BinaryCompiler = class {
  /**
   * Generates a secure, deterministic cryptographic key from the project's API key.
   */
  static deriveKeys(apiKey) {
    const hash = crypto.createHash("sha256").update(apiKey).digest();
    const encryptionKey = hash;
    const hmacKey = crypto.createHmac("sha256", apiKey).update("nexus-integrity-key").digest();
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
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.ALGORITHM, encryptionKey, iv);
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
    const hmac = crypto.createHmac("sha256", hmacKey);
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
    const hmac = crypto.createHmac("sha256", hmacKey);
    hmac.update(prefixBlock);
    const actualSignature = hmac.digest();
    if (!crypto.timingSafeEqual(expectedSignature, actualSignature)) {
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
    const decipher = crypto.createDecipheriv(this.ALGORITHM, encryptionKey, iv);
    let decrypted = decipher.update(cipherText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    const data = JSON.parse(decrypted.toString("utf8"));
    return { data, metadata };
  }
};
BinaryCompiler.MAGIC_HEADER = "NEXS";
// 4-byte ASCII magic identifier
BinaryCompiler.ALGORITHM = "aes-256-cbc";

// src/content/utils.ts
function validateSlug(slug) {
  if (!slug || typeof slug !== "string") {
    throw new Error("Slug must be a non-empty string");
  }
  if (!/^[a-z0-9-_]+$/.test(slug)) {
    throw new Error("Slug can only contain lowercase letters, numbers, hyphens, and underscores");
  }
}

// src/content/local-cache-server.ts
var LocalCache = class {
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
export {
  LocalCache
};
