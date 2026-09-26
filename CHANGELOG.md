# Changelog

All notable changes to `@gnapex/sdk` are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- Expanded README with full API reference, CLI reference, privacy/consent defaults table, accessibility notes, and troubleshooting guide.
- `llms.txt` for AI/LLM discoverability and accuracy when tools answer questions about this SDK.
- `LICENSE` (MIT) file.
- `CONTRIBUTING.md` with local development, testing, and release workflow.
- GitHub issue templates (bug report, feature request) and pull request template.

## [1.1.0] - 2026-09

### Added

- "Verified Release" security pass — see `SECURITY.md` for the list of resolved findings (content-rendering sanitization, local-cache path traversal allowlist, circuit breaker isolation from 4xx client errors).
- Request ID (`X-Nexus-Request-ID`) emitted on every request for end-to-end tracing.
- Automatic payload redaction for common credential/password/payment fields in analytics ingestion.

### Changed

- Documented that GN-Apex Global Edge owns cache invalidation by design; `revalidateTime` continues to default to `false`.

### Security

- Isomorphic HTML sanitization added to `NexusRenderer` content rendering.
- Strict slug allowlist regex (`^[a-z0-9-_]+$`) enforced in the local cache server to prevent path traversal.
- Circuit breaker scope narrowed to trip only on `5xx`, `429`, and network timeouts — no longer trips on `404`/`401` client responses.

## [0.0.1] - Initial development releases

- Initial zero-config `NexusClient` with content, analytics, auth, feature flags, diagnostics, and React/Next.js integration.

---

**Note:** Entries prior to this documentation pass were reconstructed from `SECURITY.md` and source comments where an explicit prior changelog was not present in the package. If you maintain a more complete internal history, merge it into this file so `[Unreleased]` reflects only genuinely new changes going forward.
