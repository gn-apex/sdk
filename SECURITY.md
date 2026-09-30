# Security & Privacy Policy

GN-Apex is designed around a public-browser/runtime key and privileged server-side credentials. Authorization and capabilities are strictly enforced by the GN-Apex API and nd GN-Apex Global Edge.".

_Last updated: September 2026 — Version 1.0.0 Verified Release._

## Credential Model

- Browser bundles only use public/read credentials (`nx_pk_...`).
- Secret / master keys remain exclusively server-side.
- Request IDs (`X-Nexus-Request-ID`) are emitted on every request for end-to-end tracing.
- Data Ingestion operates with automatic payload redaction for passwords, authorization tokens, and payment fields.

## Client Sovereignty, Sandboxed Portals & Copilot Security

### 1. Portal Props Boundary & Safe Dynamic Execution

GN-Apex enforces a strict architectural boundary between **visual customization (client-owned)** and **core business logic (platform-enforced)**:

* **The Open Gate:** Project owners (clients) have 100% autonomous control over visual themes, component ordering, CSS variables, hero text, and page layouts in their No-Code Studio.
* **The Props Sandbox:** Every portal component strictly implements the `WorkspaceComponentProps` contract. Components only receive read-only data snapshots and pre-authorized action callbacks.
* **Zero Arbitrary Execution:** Clients and third-party marketplace themes cannot inject raw SQL, cannot execute unauthorized database mutations, and cannot bypass payment or grading formulas.

### 2. AI Copilot Isolation (Shadow DOM Security)

* The GN-Apex AI Copilot executes inside a native browser **Shadow DOM** (`attachShadow`).
* **CSS & DOM Isolation:** The host website’s scripts and styles cannot read or leak chat input streams, and the AI widget cannot interfere with or mutate the host application's DOM tree.
* **Telemetry Protection:** Analytics tracking and chat sessions are isolated per project ID and scrubbed of sensitive credential fields before transmission.

### 3. Client Ownership Model

* **Infrastructure:** Developers manage deployment pipelines and Next.js hosting via `apex deploy`.
* **Data & Feature Governance:** The Project Owner (Client) possesses exclusive ownership of all workspace schemas, portal layout arrays, design tokens, and AI persona configurations.
* **Zero Developer Gatekeeping:** Changes published by project owners in the GN-Apex Dashboard update live edge nodes immediately via signed webhook purges (`/api/revalidate`), without requiring code commits or developer intervention.

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
