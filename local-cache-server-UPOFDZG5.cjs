"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { newObj[key] = obj[key]; } } } newObj.default = obj; return newObj; } } function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }


var _chunkOP3LNZPCcjs = require('./chunk-OP3LNZPC.cjs');

// src/content/local-cache-server.ts
var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);
var _path = require('path'); var _path2 = _interopRequireDefault(_path);

// src/content/binary-compiler.ts
var _crypto = require('crypto'); var crypto = _interopRequireWildcard(_crypto);
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

// src/content/local-cache-server.ts
var LocalCache = class {
  constructor(customPath, apiKey) {
    this.apiKey = "";
    this.baseDir = customPath || ".nexus/local";
    const config = _chunkOP3LNZPCcjs.getEnvConfig.call(void 0, );
    this.apiKey = apiKey || config.apiKey || "";
  }
  isLoaded() {
    return _fs2.default.existsSync(_path2.default.resolve(process.cwd(), this.baseDir));
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
      const encryptedBuffer = _fs2.default.readFileSync(filePath);
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
      _chunkOP3LNZPCcjs.validateSlug.call(void 0, slug);
    } catch (e) {
      return null;
    }
    const filePath = _path2.default.resolve(
      process.cwd(),
      this.baseDir,
      "pages",
      `${slug}.nx`
    );
    if (_fs2.default.existsSync(filePath)) {
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
      _chunkOP3LNZPCcjs.validateSlug.call(void 0, collectionId);
    } catch (e2) {
      return null;
    }
    const filePath = _path2.default.resolve(
      process.cwd(),
      this.baseDir,
      "collections",
      `${collectionId}.nx`
    );
    if (_fs2.default.existsSync(filePath)) {
      return this.decompileFile(filePath);
    }
    return null;
  }
  /**
   * Retrieve global settings from its .nx file.
   */
  async getGlobals() {
    const filePath = _path2.default.resolve(process.cwd(), this.baseDir, "globals.nx");
    if (_fs2.default.existsSync(filePath)) {
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
      const pagesDir = _path2.default.resolve(process.cwd(), this.baseDir, "pages");
      if (_fs2.default.existsSync(pagesDir)) {
        for (const file of _fs2.default.readdirSync(pagesDir)) {
          if (file.endsWith(".nx")) {
            const slug = _path2.default.basename(file, ".nx");
            pages[slug] = await this.getPage(slug);
          }
        }
      }
      const colsDir = _path2.default.resolve(process.cwd(), this.baseDir, "collections");
      if (_fs2.default.existsSync(colsDir)) {
        for (const file of _fs2.default.readdirSync(colsDir)) {
          if (file.endsWith(".nx")) {
            const id = _path2.default.basename(file, ".nx");
            collections[id] = await this.getCollection(id) || [];
          }
        }
      }
      globals = await this.getGlobals() || {};
    } catch (e3) {
    }
    return { pages, collections, globals };
  }
};


exports.LocalCache = LocalCache;
