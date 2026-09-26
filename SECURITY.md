# Security & Privacy Policy

GN-Apex is designed around a public-browser/runtime key and privileged server-side credentials. Authorization and capabilities are strictly enforced by the GN-Apex API and Cloudflare Edge.

_Last updated: September 2026 — Version 1.0.0 Verified Release._

## Credential Model

- Browser bundles only use public/read credentials (`nx_pk_...`).
- Secret / master keys remain exclusively server-side.
- Request IDs (`X-Nexus-Request-ID`) are emitted on every request for end-to-end tracing.
- Data Ingestion operates with automatic payload redaction for passwords, authorization tokens, and payment fields.

## Resolved Security Findings

| Component                              | Status       | Resolution                                                                                                                                                                                                                                                                                               |
| -------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Content Rendering (`NexusRenders.tsx`) | **RESOLVED** | Isomorphic HTML sanitization scrubs `<script>`, `javascript:` links, and inline event handlers before DOM insertion.                                                                                                                                                                                     |
| Local Cache (`local-cache-server.ts`)  | **RESOLVED** | Strict slug allowlist regex (`^[a-z0-9-_]+$`) prevents path traversal attacks at the boundary.                                                                                                                                                                                                           |
| HTTP Resilience (`http.ts`)            | **RESOLVED** | Circuit breaker is isolated from `404 Not Found` and `401` client responses. It only trips on `5xx` server crashes, `429` rate limits, and network timeouts.                                                                                                                                             |
| First-Party Telemetry & Auth           | **RESOLVED** | Canvas fingerprinting is _controllable_ via `privacy.fingerprinting` in `NexusConfig` — **note: it defaults to `true` (enabled)**, so integrators who need it off must set this explicitly. Identity resolution operates under first-party Legitimate Interest for closed-ecosystem GN-Apex deployments. |

## Privacy defaults you should know about

This SDK ships with automatic analytics, canvas-based device fingerprinting, and (in the React integration) an auto-prompted push-notification permission request all **enabled by default**, as part of GN-Apex's zero-config platform design. None of this is a vulnerability — it's documented, intentional behavior — but it has real privacy and compliance implications depending on where you deploy. See the main [README's "Privacy, consent & data collection defaults" section](./README.md#privacy-consent--data-collection-defaults) for the full list of defaults and the exact config flags to change them (e.g. for GDPR/CCPA-scoped deployments, or app-store policies that restrict fingerprinting or require explicit consent before tracking).

## Reporting Security Issues

Please report security issues privately rather than opening a public GitHub issue, so a fix can be prepared before details are public:

1. Open a private advisory via **GitHub Security Advisories** on this repository (`Security` tab → `Report a vulnerability`), if enabled, **or**
2. Email the maintainers at the security contact listed in this repository's GitHub profile / organization page.

Please include: the affected version, a minimal reproduction, and the potential impact. We aim to acknowledge reports promptly and will credit reporters (with permission) once a fix ships.
