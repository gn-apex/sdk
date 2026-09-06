"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/content/binary-compiler.ts
var binary_compiler_exports = {};
__export(binary_compiler_exports, {
  BinaryCompiler: () => BinaryCompiler
});
module.exports = __toCommonJS(binary_compiler_exports);
var crypto = __toESM(require("crypto"), 1);
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  BinaryCompiler
});
