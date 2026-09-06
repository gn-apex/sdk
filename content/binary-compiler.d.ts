interface NxMetadata {
    version: string;
    compiledAt: string;
    projectId: string;
    schemaChecksum?: string;
}
declare class BinaryCompiler {
    private static readonly MAGIC_HEADER;
    private static readonly ALGORITHM;
    /**
     * Generates a secure, deterministic cryptographic key from the project's API key.
     */
    private static deriveKeys;
    /**
     * Compiles JSON content data into a secure, signed, and encrypted .nx binary buffer.
     */
    static compile(data: any, apiKey: string, projectId: string, metadataOverrides?: Partial<NxMetadata>): Buffer;
    /**
     * Verifies, decrypts, and decompiles a .nx binary buffer back into clean, type-safe JSON.
     * Throws structured errors on integrity verification failures or file corruption.
     */
    static decompile(buffer: Buffer, apiKey: string): {
        data: any;
        metadata: NxMetadata;
    };
}

export { BinaryCompiler, type NxMetadata };
