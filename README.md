# @gnapex/sdk

<div align="center">

**The zero-config client SDK for GN-Apex — content, analytics, auth, and realtime updates in one TypeScript package for Next.js and React.**

[![npm version](https://img.shields.io/npm/v/@gnapex/sdk.svg)](https://www.npmjs.com/package/@gnapex/sdk)
[![npm downloads](https://img.shields.io/npm/dm/@gnapex/sdk.svg)](https://www.npmjs.com/package/@gnapex/sdk)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-3178c6.svg)](#typescript-support)
[![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg)](#requirements)
[![React](https://img.shields.io/badge/React-18%2F19-61DAFB?logo=react&logoColor=black)](https://react.dev/)

[Documentation](#table-of-contents) • [Quick Start](#quick-start) • [API Reference](#api-reference) • [CLI](#cli-reference) • [Security](./SECURITY.md) • [Contributing](./CONTRIBUTING.md)

</div>

---

## What is @gnapex/sdk?

`@gnapex/sdk` (package binaries: `apex`, `nexus`) is the **official client runtime for GN-Apex-generated sites**. It is the single dependency a GN-Apex site needs to talk to the platform: fetching content, tracking analytics, handling authentication, syncing feature flags, and receiving realtime content updates — with **zero required configuration**.

GN-Apex sites are designed so that the developer focuses on content, components, and UI/UX, while this SDK and the GN-Apex platform own runtime behavior: caching, retries, session identity, offline queuing, and cache invalidation.

If you are looking for how to fetch a page, track an event, gate a feature flag, or render GN-Apex rich content inside a Next.js or React app — this is the package, and this README is the reference.

> **Package:** `@gnapex/sdk`  
> **React subpath:** `@gnapex/sdk/react`  
> **CLI binaries:** `apex`, `nexus`  
> **License:** MIT  
> **Runtime:** Node.js 18+  
> **React peer support:** React 18.2+ or React 19

## Why teams use it

- **Zero-config discovery.** Drop the SDK into a GN-Apex-generated site and it self-configures from `window.__GNAPEX__`, HTML meta tags, or environment variables — no manual client wiring.
- **One SDK, one mental model.** Content fetching, analytics, auth, feature flags, diagnostics, and push notifications all live behind a single `NexusClient` instance and a matching set of React hooks.
- **Resilient by default.** Every content request goes through rate limiting, exponential backoff with jitter, circuit breaking, and request deduplication — without you writing retry logic.
- **Automatic behavioral analytics.** Page views, SPA route changes, clicks, rage/dead clicks, form submissions (without field values), scroll depth, outbound links, video milestones, Web Vitals, and uncaught errors are tracked out of the box.
- **Realtime content sync.** Subscribe to content updates over WebSocket and invalidate local caches the moment an editor publishes.
- **Typed end to end.** Full TypeScript definitions for every public API, shipped as `.d.ts` alongside ESM and CJS builds.

## Table of contents

- [Requirements](#requirements)
- [Installation](#installation)
- [Quick start](#quick-start)
- [Core concepts](#core-concepts)
- [Architecture](#architecture)
- [Configuration](#configuration)
- [React integration](#react-integration)
- [API reference](#api-reference)
  - [Content](#content-api)
  - [Analytics](#analytics-api)
  - [Auth](#auth-api)
  - [Feature flags & remote config](#feature-flags--remote-config)
  - [Diagnostics](#diagnostics)
  - [HTTP client](#http-client)
  - [Events](#events)
  - [Caching](#caching-model)
  - [Push notifications](#push-notifications)
- [Public API surface](#public-api-surface)
- [CLI reference](#cli-reference)
- [Privacy, consent & data collection defaults](#privacy-consent--data-collection-defaults)
- [Error handling](#error-handling)
- [Accessibility](#accessibility)
- [TypeScript support](#typescript-support)
- [Framework support](#framework-support)
- [Troubleshooting / FAQ](#troubleshooting--faq)
- [Security](#security)
- [Versioning](#versioning)
- [Contributing](#contributing)
- [Support](#support)
- [License](#license)

## Requirements

| Requirement | Version                                                                     |
| ----------- | --------------------------------------------------------------------------- |
| Node.js     | >= 18.0.0                                                                   |
| React       | ^18.2.0 \|\| ^19.0.0 (peer dependency, only needed for `@gnapex/sdk/react`) |
| React DOM   | ^18.2.0 \|\| ^19.0.0 (peer dependency)                                      |
| Next.js     | Recommended for the bundled `NexusProvider` (uses `next/navigation`)        |
| TypeScript  | ^5.x recommended (types ship out of the box)                                |

The core client (`@gnapex/sdk`) has no React dependency and can be used in any JavaScript/TypeScript environment — Node scripts, edge functions, non-React frontends. React hooks and components (`@gnapex/sdk/react`) are an optional, separately-exported entry point.

## Installation

```bash
npm install @gnapex/sdk
```

```bash
yarn add @gnapex/sdk
```

```bash
pnpm add @gnapex/sdk
```

```bash
bun add @gnapex/sdk
```

For the React/Next.js integration, `react` and `react-dom` must already be present in your project (they are peer dependencies, not bundled).

## Quick start

### 1. Zero-config content fetching

If your site is deployed on GN-Apex, runtime configuration is injected automatically via `window.__GNAPEX__` or `<meta>` tags. You can import the shared singleton and start fetching immediately:

```ts
import { nexus } from "@gnapex/sdk";

const page = await nexus.getPage("home");
```

### 2. Explicit configuration (local dev, CI, non-GN-Apex hosting)

```ts
import { createNexusClient } from "@gnapex/sdk";

const client = createNexusClient({
  projectId: "your-project-id",
  apiKey: "nx_pk_your_public_key", // public/read key only — never a secret key
  apiUrl: "https://api.gnapex.com",
  debug: process.env.NODE_ENV === "development",
});

const page = await client.getPage("home");
```

### 3. React / Next.js setup

Wrap your app (or root layout) once:

```tsx
// app/layout.tsx
import { NexusProvider } from "@gnapex/sdk/react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <NexusProvider projectId="your-project-id">{children}</NexusProvider>
      </body>
    </html>
  );
}
```

Then use the hooks anywhere in the tree:

```tsx
"use client";
import { useNexus, useNexusAnalytics } from "@gnapex/sdk/react";

export function CTAButton() {
  const nexus = useNexus();
  const { track } = useNexusAnalytics();

  return (
    <button
      onClick={() => {
        track("cta_clicked", { location: "hero" });
      }}
    >
      Get started
    </button>
  );
}
```

## Core concepts

`@gnapex/sdk` exposes one primary object, `NexusClient`, composed of focused sub-engines:

| Sub-engine        | Property              | Responsibility                                                                           |
| ----------------- | --------------------- | ---------------------------------------------------------------------------------------- |
| `ContentEngine`   | `client.content`      | Fetching pages, collections, globals, and items; caching; search; realtime subscriptions |
| `AnalyticsEngine` | `client.analytics`    | Automatic + manual event tracking, identity, Web Vitals                                  |
| `NexusHttpClient` | `client.http`         | Shared HTTP pipeline: retries, timeouts, circuit breaking, request IDs                   |
| `NexusEventBus`   | `client.events`       | Internal typed pub/sub for platform-level integrations                                   |
| `FeatureFlags`    | `client.flags`        | Local, in-memory boolean/typed flag store                                                |
| `RemoteConfig`    | `client.remoteConfig` | Local, in-memory key/value config store                                                  |

A default singleton (`nexus`) is created for you on import, matching the "one client per site" model most GN-Apex deployments use. Call `createNexusClient()` directly if you need multiple isolated clients (for example, multi-tenant admin tooling).

## Architecture

At a high level, the SDK is composed of one client instance fronting several focused sub-engines, with an optional React integration layer on top:

```text
Application
    │
    ├── @gnapex/sdk
    │     ├── NexusClient
    │     ├── ContentEngine
    │     ├── AnalyticsEngine
    │     ├── NexusHttpClient
    │     ├── FeatureFlags
    │     ├── RemoteConfig
    │     ├── NexusEventBus
    │     ├── Cache layer
    │     └── Diagnostics
    │
    ├── @gnapex/sdk/react
    │     ├── NexusProvider
    │     ├── useNexus
    │     ├── useNexusAnalytics
    │     ├── useNexusLiveFeed
    │     └── useNexusAuth
    │
    └── GN-Apex CLI (apex / nexus)
          ├── Project initialization
          ├── Content / schema workflows
          ├── Validation
          ├── Deployment
          ├── Diagnostics
          └── Developer tooling
```

## Configuration

### Configuration discovery order

The SDK resolves configuration automatically, checking sources in this order and taking the first defined value for each field:

1. `window.__GNAPEX__` (or legacy `window.__NEXUS__`) — injected by the GN-Apex edge runtime
2. `<meta name="gnapex-project">`, `<meta name="gnapex-key">`, etc. (or legacy `nexus-*` meta names)
3. `NEXT_PUBLIC_GNAPEX_ID`, `NEXT_PUBLIC_GNAPEX_KEY`, `NEXT_PUBLIC_GNAPEX_API_URL`, `NEXT_PUBLIC_GNAPEX_ANALYTICS_URL` (Next.js public env vars; legacy `NEXT_PUBLIC_NEXUS_*` also supported)
4. `GNAPEX_PROJECT_ID`, `GNAPEX_API_KEY`, `GNAPEX_API_URL`, `GNAPEX_ANALYTICS_URL` (Node/CI environment variables; legacy `NEXUS_*` also supported)
5. Explicit values passed to `createNexusClient(config)` or `nexus.updateConfig(config)` — these always take priority over discovered values.

### `NexusConfig` reference

```ts
interface NexusConfig {
  projectId: string; // required
  apiKey?: string; // public key, format: nx_pk_...
  apiUrl: string; // required — defaults to https://api.gnapex.com
  analyticsUrl?: string; // defaults to https://sentry.gnapex.com
  debug?: boolean; // default: false
  cacheStrategy?: "memory" | "localStorage" | "none"; // default: "memory"
  revalidateTime?: number | false; // default: false — see Caching model
  timeout?: number; // default: 10_000 (ms)
  retries?: number; // default: 3
  cacheInvalidation?: "platform" | "manual"; // default: "platform"
  environment?: "development" | "staging" | "production";
  autoTracking?: boolean; // default: true
  publicKeyOnly?: boolean; // default: true
  privacy?: {
    analytics?: boolean; // default: true
    fingerprinting?: boolean; // default: true — see Privacy section
    redact?: boolean; // default: true
  };
}
```

### Environment variables

```bash
# .env.local — Next.js
NEXT_PUBLIC_GNAPEX_ID=your-project-id
NEXT_PUBLIC_GNAPEX_KEY=nx_pk_your_public_key
NEXT_PUBLIC_GNAPEX_API_URL=https://api.gnapex.com
NEXT_PUBLIC_GNAPEX_ANALYTICS_URL=https://sentry.gnapex.com
```

```bash
# .env — Node.js / CI / scripts
GNAPEX_PROJECT_ID=your-project-id
GNAPEX_API_KEY=nx_pk_your_public_key
GNAPEX_API_URL=https://api.gnapex.com
```

> **Only ever put a public key (`nx_pk_...`) in browser-reachable configuration.** Secret/master keys are for privileged server-side use and must never ship to the client. See [Security](#security).

### Updating configuration at runtime

```ts
nexus.updateConfig({ debug: true, revalidateTime: 60 });
const snapshot = nexus.getConfig(); // frozen, read-only snapshot
```

## React integration

`@gnapex/sdk/react` is a dedicated entry point so non-React consumers of the core SDK don't pay for a React dependency they don't need.

### `NexusProvider`

```tsx
<NexusProvider
  projectId="your-project-id"
  disableAnalytics={false}
  hasConsent={true}
  enableLiveFeed={false}
  autoPromptPush={true}
  onLiveEvent={(event) => console.log(event)}
>
  {children}
</NexusProvider>
```

| Prop               | Type              | Default | Description                                                                                                |
| ------------------ | ----------------- | ------- | ---------------------------------------------------------------------------------------------------------- |
| `projectId`        | `string`          | —       | Overrides discovered project ID                                                                            |
| `disableAnalytics` | `boolean`         | `false` | Fully disables the analytics engine                                                                        |
| `hasConsent`       | `boolean`         | `true`  | Gate for analytics initialization — see [Privacy](#privacy-consent--data-collection-defaults)              |
| `enableLiveFeed`   | `boolean`         | `false` | Opens a WebSocket connection for realtime analytics events                                                 |
| `onLiveEvent`      | `(event) => void` | —       | Callback fired on every live analytics event                                                               |
| `autoPromptPush`   | `boolean`         | `true`  | Automatically requests browser push permission — see [Privacy](#privacy-consent--data-collection-defaults) |

### Hooks

```ts
import {
  useNexus, // returns the NexusClient instance
  useNexusAnalytics, // returns { track, identify, group, alias, trackPurchase, trackError, reset }
  useNexusLiveFeed, // returns { latestEvent, isConnected } when enableLiveFeed is true
  useNexusAuth, // returns { user, isLoading, error, isAuthenticated, login, register, logout, updateProfile, requestPasswordReset }
} from "@gnapex/sdk/react";
```

`useNexusAnalytics` is always safe to call — if analytics is disabled, it returns no-op functions instead of throwing, so components don't need conditional logic.

### Live analytics feed

```tsx
<NexusProvider
  enableLiveFeed
  onLiveEvent={(event) => {
    console.log("Live event:", event);
  }}
>
  {children}
</NexusProvider>
```

```tsx
import { useNexusLiveFeed } from "@gnapex/sdk/react";

export function LiveStatus() {
  const { latestEvent, isConnected } = useNexusLiveFeed();

  return (
    <div>
      <p>{isConnected ? "Connected" : "Disconnected"}</p>
      {latestEvent && <pre>{JSON.stringify(latestEvent, null, 2)}</pre>}
    </div>
  );
}
```

### Rendering rich content

`NexusRenderer` renders sanitized rich-text/HTML content produced by the GN-Apex content editor, including inline chart blocks:

```tsx
import { NexusRenderer } from "@gnapex/sdk/react";

<NexusRenderer
  content={page.body}
  hydrateCharts
  enableImageInteraction
  onImageClick={(src, alt) => openLightbox(src, alt)}
/>;
```

Content passed to `NexusRenderer` is sanitized before DOM insertion (script tags, `javascript:` URLs, and inline event handlers are stripped) — see [`SECURITY.md`](./SECURITY.md) for the exact scope of that guarantee.

## API reference

### Content API

All content methods are available at `nexus.content.*` or via convenience aliases on the client itself (`nexus.getPage(...)`).

```ts
// Fetch a single page by slug
const page = await nexus.content.getPage<PageData>("about-us", {
  revalidate: 60, // override the platform default (false)
  tags: ["marketing"], // cache tags for targeted invalidation
  forceRefresh: false,
  includeMetadata: false, // when true, returns { data, meta } instead of raw data
});

// Fetch a paginated collection
const posts = await nexus.content.getCollection<Post>("blog-posts", {
  page: 1,
  limit: 20,
  sort: "publishedAt",
  order: "desc",
  filter: { category: "engineering" },
  search: "release notes",
});

// Fetch global/singleton content (nav, footer, site settings, etc.)
const settings = await nexus.content.getGlobals("site-settings");

// Fetch a single item from a collection by ID
const author = await nexus.content.getItem("authors", "author_123");

// Full-text search across a content type
const results = await nexus.content.search("blog-posts", "release notes");

// Prefetch (warm the cache) for a list of URLs/slugs
await nexus.content.prefetch(["/about", "/pricing", "/blog"]);

// Subscribe to realtime content updates (returns an unsubscribe function)
const unsubscribe = nexus.content.subscribeToUpdates((update) => {
  console.log("Content updated:", update);
});

// Cache control
nexus.content.invalidateCache(["marketing"]); // invalidate by tag
nexus.content.clearCache(); // clear everything
nexus.content.getCacheStats(); // { hits, misses, size, ... }
```

Every content response carries `meta.cacheStatus` (`"hit" | "miss" | "stale"`) when `includeMetadata: true` is passed, so you can observe cache behavior in production.

For advanced content operations, the exported `ContentEngine` provides the SDK's content/cache layer directly:

```ts
import { ContentEngine } from "@gnapex/sdk";
```

Use the generated TypeScript declarations in `dist/` as the authoritative API contract for the exact version you install.

### Analytics API

Automatic tracking starts as soon as the client initializes in a browser (unless disabled — see [Privacy](#privacy-consent--data-collection-defaults)). Manual tracking is available as an escape hatch:

```ts
// Custom event
nexus.analytics?.track("newsletter_signup", { plan: "free" });

// Identify a known user (ties subsequent events to that identity)
await nexus.analytics?.identify("user_123", {
  email: "jane@example.com",
  plan: "pro",
});

// Group (organization/account-level) association
await nexus.analytics?.group("org_456", { name: "Acme Inc" });

// Alias an anonymous visitor ID to a known user ID (post-signup identity merge)
await nexus.analytics?.alias("user_123");

// E-commerce conversion tracking
nexus.analytics?.trackPurchase({
  orderId: "order_789",
  value: 49.0,
  currency: "USD",
  items: [{ id: "sku_1", name: "Pro Plan", price: 49.0, quantity: 1 }],
});

// Manual error tracking
nexus.analytics?.trackError(new Error("Checkout failed"), { step: "payment" });

// Reset local identity (e.g. on logout)
nexus.analytics?.reset(); // pass `true` to also perform a GDPR-style local data scrub

nexus.analytics?.getSessionId();
```

Automatic tracking, with no extra code required, covers:

- Page views and SPA navigation changes
- Clicks, including rage-click and dead-click detection
- Form submissions (submission events only — field values are never collected)
- Video lifecycle events and 25/50/75/90/100% watch milestones
- Scroll depth
- Outbound link clicks
- Web Vitals (via `web-vitals`)
- Uncaught errors and unhandled promise rejections
- Clipboard "copy" events, tagged as social shares
- Session/visitor identity resolution

### Auth API

Auth is exposed via `AuthProvider` (mounted automatically inside `NexusProvider`) and the `useNexusAuth` hook. It talks to a project-scoped auth endpoint (`{apiUrl}/auth/project/{projectId}`) using cookie/token-based sessions — no client secret is ever required or accepted.

```tsx
import { useNexusAuth } from "@gnapex/sdk/react";

function LoginForm() {
  const { login, isLoading, error, user, isAuthenticated } = useNexusAuth();

  const handleSubmit = async (email: string, password: string) => {
    await login({ email, password });
  };

  if (isAuthenticated) return <p>Welcome, {user?.email}</p>;
  // ...
}
```

Available operations: `login`, `register`, `logout`, `updateProfile`, `requestPasswordReset`. Successful auth events automatically call `nexus.analytics.identify()` so authenticated users are stitched to their prior anonymous analytics activity — disable this by setting `privacy.analytics: false` or `disableAnalytics` on the provider if that behavior is undesired for a given deployment.

Exported auth types include `SiteUser`, `AuthState`, `AuthError`, `LoginCredentials`, and `RegisterCredentials`.

### Feature flags & remote config

`client.flags` and `client.remoteConfig` are **local, in-memory stores** you populate yourself (for example, from a value your app already fetched, or a value injected at build/deploy time). They do not perform a network fetch internally — treat them as a typed, ergonomic container, not a hosted flag-delivery service:

```ts
nexus.flags.set({ newCheckout: true, betaBanner: false });
nexus.flags.isEnabled("newCheckout"); // true
nexus.flags.get<string>("checkoutVariant", "control");
nexus.flags.all();

nexus.remoteConfig.set({ maxUploadSizeMb: 25 });
nexus.remoteConfig.get<number>("maxUploadSizeMb", 10);
nexus.remoteConfig.all();
```

### Diagnostics

```ts
nexus.diagnostics();
// {
//   version: "1.1.0",
//   environment: "production",
//   online: true,
//   userAgent: "...",
//   memory: 41943040,       // when performance.memory is available
//   cache: { ...contentCacheStats },
//   http: { ...httpClientStats },
// }
```

Useful for debug overlays, support tooling, and health-check endpoints. Do not publish sensitive diagnostic payloads to public logs.

### HTTP client

The SDK exposes a resilient HTTP client:

```ts
const response = await nexus.http.request("https://api.gnapex.com/example");

const data = await response.json();
```

The request layer can provide:

- Request IDs
- Timeout protection
- Retries
- Exponential backoff
- Jitter
- Rate limiting
- Circuit breaking
- Normalized `NexusError` instances
- Request lifecycle events

Request-specific controls are available through `NexusRequestOptions`.

### Events

The SDK exposes a typed event bus:

```ts
const unsubscribe = nexus.events.on("request:end", (event) => {
  console.log(event.requestId, event.duration);
});
```

Built-in event categories include:

- `request:start`
- `request:end`
- `cache:hit`
- `cache:miss`
- `analytics:queued`
- `analytics:flushed`
- `content:updated`
- `error`

Always unsubscribe long-lived listeners when the owning component or process is destroyed.

### Push notifications

Web Push support is exposed through `NexusPushClient`:

```ts
import { NexusPushClient } from "@gnapex/sdk";

const push = new NexusPushClient(nexus.getConfig());

const subscribed = await push.requestSubscription("/sw.js");

console.log("Subscribed:", subscribed);
```

Your application must provide a compatible service worker and satisfy browser notification/security requirements. Browsers may require user interaction or permission flows according to their notification policies — do not treat notification permission as guaranteed.

## Public API surface

Primary exports from the root `@gnapex/sdk` package include:

```ts
NexusClient;
nexus;
createNexusClient;

ContentEngine;
MemoryCache;
LocalCache;
BrowserCache;
CacheTags;

AnalyticsEngine;
NexusPushClient;

NexusConfig;
ContentResponse;
CollectionResponse;
CacheMetadata;
CacheEntry;
CollectionQuery;
ErrorResponse;

NexusHttpClient;
NexusRequestOptions;

NexusEventBus;

FeatureFlags;
RemoteConfig;

NexusError;
isNexusError;
VERSION;
```

The package also exports configuration, diagnostics, event, flag, HTTP, and authentication types. React integrations are exposed from the `@gnapex/sdk/react` subpath:

```ts
NexusProvider;
useNexus;
useNexusAnalytics;
useNexusLiveFeed;
useNexusAuth;
NexusRenderer;
```

Use your installed package's `dist/*.d.ts` files as the exact versioned API reference.

## CLI reference

The package ships a CLI, installed as both `apex` and `nexus`:

```bash
npx apex --version
npx apex <command> --help
```

| Command           | Description                                                   |
| ----------------- | ------------------------------------------------------------- |
| `init`            | Initialize GN-Apex in your project (setup wizard)             |
| `pull`            | Pull content & schema from remote to local cache              |
| `push`            | Push local content to the GN-Apex remote                      |
| `validate`        | Validate local data against the content schema                |
| `diff`            | Show pending local changes compared to upstream               |
| `schema`          | Inspect the content schema                                    |
| `types`           | Generate TypeScript definitions from the content schema       |
| `status`          | Show project status and health                                |
| `deploy`          | Deploy the project to the GN-Apex Global Edge Network         |
| `local [command]` | Manage local content data (`list`, `init-templates`, `reset`) |
| `studio`          | Run the local, offline Content Studio                         |
| `doctor`          | Diagnose SDK setup/configuration issues                       |
| `seed`            | Seed content into a project                                   |

Start with:

```bash
npx apex init
```

Run `npx apex doctor` first if you're debugging a configuration problem — it checks environment variables, connectivity, and common misconfigurations.

For CI or automated environments, prefer explicit environment variables and non-interactive command options where supported.

## Privacy, consent & data collection defaults

GN-Apex is a batteries-included analytics and personalization platform, and several capabilities are **on by default** so a freshly-deployed GN-Apex site gets working analytics and engagement features without extra setup. If you're integrating this SDK into a project that has its own privacy obligations (GDPR, CCPA, an internal privacy review, an app store policy, etc.), **read this section before shipping to production** and adjust the defaults below to fit your requirements.

| Capability                                                                   | Default                                                                  | Where it's controlled                                                          |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| Automatic behavioral analytics                                               | **On**                                                                   | `privacy.analytics` in `NexusConfig`, or `disableAnalytics` on `NexusProvider` |
| Canvas-based device fingerprinting (used to derive a cookie-less visitor ID) | **On**                                                                   | `privacy.fingerprinting` in `NexusConfig`                                      |
| Payload redaction of common credential/password/payment fields               | **On**                                                                   | `privacy.redact` in `NexusConfig`                                              |
| Analytics consent gate                                                       | **Assumed granted** (`hasConsent` defaults to `true`)                    | `hasConsent` prop on `NexusProvider`                                           |
| Browser push-notification permission prompt                                  | **Auto-requested on load**                                               | `autoPromptPush` prop on `NexusProvider`                                       |
| GDPR-style local data scrub on reset                                         | **Off** (`reset()` only clears local session state unless told to scrub) | `performGdprScrub` argument to `analytics.reset(true)`                         |

### How to turn any of this off

```ts
// Disable fingerprinting and keep the rest of analytics
const client = createNexusClient({
  privacy: { analytics: true, fingerprinting: false, redact: true },
});
```

```tsx
// Don't auto-prompt for push, and don't start analytics until you have consent
<NexusProvider
  projectId="your-project-id"
  autoPromptPush={false}
  hasConsent={hasUserAcceptedCookies /* wire this to your own consent state */}
>
  {children}
</NexusProvider>
```

```ts
// Fully disable analytics and fingerprinting
const client = createNexusClient({
  autoTracking: false,
  privacy: { analytics: false, fingerprinting: false },
});
```

```ts
// On logout, scrub local analytics identity data instead of just resetting session state
nexus.analytics?.reset(true);
```

None of the above requires forking the SDK — every default is a config flag. If you're building a consent-management flow, gate `NexusProvider`'s `hasConsent` prop on your CMP's result and set `autoPromptPush={false}` until the user has explicitly opted into notifications.

Do not collect sensitive personal information through custom event properties unless your legal, security, and data-retention requirements explicitly permit it. Avoid sending passwords, authentication tokens, payment credentials, secrets, or unnecessary personal data as analytics properties. The SDK includes privacy-oriented redaction behavior, but developers remain responsible for the data they explicitly send.

## Caching model

GN-Apex intentionally defaults `revalidateTime` to `false`. **This is not a short-TTL SDK cache** — it means content is treated as cacheable indefinitely, because the GN-Apex platform's own edge network owns invalidation and purge centrally. When an editor publishes a change, the platform pushes invalidation to affected caches; you don't need to manage TTLs yourself.

- `cacheStrategy: "memory"` (default): an in-memory, per-session cache in the browser, capped and short-lived (5s TTL) as a de-duplication layer, separate from the platform-level "forever" cache described above.
- `cacheStrategy: "localStorage"`: persists cache entries across page loads in the browser.
- `cacheStrategy: "none"`: disables the client-side cache layer entirely (every call hits the network, subject to the HTTP pipeline's own retry/circuit-breaking behavior).
- A local `.nexus` cache is used automatically in `development` only, as an offline-friendly developer convenience — it is never active in production builds.
- Per-call `revalidate` and `tags` options let you opt specific calls into shorter TTLs or targeted invalidation without changing the site-wide default.

The SDK exports cache implementations directly:

```ts
import { MemoryCache, LocalCache, BrowserCache, CacheTags } from "@gnapex/sdk";
```

> Do not assume that cached content is automatically revalidated at a short interval. Understand the GN-Apex invalidation model before changing cache behavior.

## Error handling

All SDK errors are instances of `NexusError`, a typed subclass of `Error`:

```ts
import { isNexusError } from "@gnapex/sdk";

try {
  await nexus.getPage("missing-page");
} catch (err) {
  if (isNexusError(err)) {
    console.error(err.code, err.status, err.requestId, err.retryable);
  }
}
```

`NexusErrorCode` values: `CONFIGURATION_ERROR`, `NETWORK_ERROR`, `TIMEOUT`, `ABORTED`, `HTTP_ERROR`, `RATE_LIMITED`, `CIRCUIT_OPEN`, `NOT_FOUND`, `VALIDATION_ERROR`, `STORAGE_ERROR`, `UNKNOWN`.

Every request carries an `X-Nexus-Request-ID` header end-to-end, and that ID is attached to thrown errors (`err.requestId`) for support/log correlation.

For production applications, distinguish:

- Authentication failures
- Missing content
- Rate limiting
- Network failures
- Timeouts
- Server failures
- Circuit-open conditions

Do not retry non-retryable application errors indefinitely.

## Accessibility

The SDK's own rendering surface (`NexusRenderer`) is a thin, sanitized pass-through for editor-authored content — accessibility of the rendered output (heading structure, alt text, link text) is primarily determined by the content itself. To keep GN-Apex-powered pages accessible:

- Always populate `alt` text at the content/CMS level for images; `NexusRenderer`'s `onImageClick` handler does not generate alt text for you.
- Chart blocks rendered via `hydrateCharts` are visual SVG output — pair them with a text/table summary in the source content for screen reader users, since inline SVG charts are not automatically given accessible names.
- The invisible tracking marker element the SDK renders (`#__nexus_react_active`) is `display: none` and not exposed to assistive technology; it carries no semantic content and requires no action from you.
- Push notification prompts and cookie/consent UI are your application's responsibility to render accessibly — the SDK only triggers the browser-native permission dialog, which follows the user's OS/browser accessibility settings.
- Auth forms (`useNexusAuth`) are headless — you own the markup, so standard form-labeling and error-announcement practices (`aria-live`, associated `<label>`s) apply as they would to any React form.

The SDK should not require developers to compromise application accessibility merely to enable telemetry or content features.

## TypeScript support

Written in TypeScript, ships `.d.ts` declaration files for both the root export and the `/react` subpath, with no separate `@types` package needed. `noImplicitAny`-safe generics are provided on the main content methods (`getPage<T>`, `getCollection<T>`, `getItem<T>`, `getGlobals<T>`) so you can type responses against your own content models.

```ts
interface BlogPost {
  title: string;
  slug: string;
  publishedAt: string;
}

const post = await nexus.content.getItem<BlogPost>("blog-posts", "post_123");
// post is typed as BlogPost
```

Additional types can be imported directly:

```ts
import type {
  NexusConfig,
  ContentResponse,
  CollectionResponse,
  ErrorResponse,
  CacheMetadata,
  CacheEntry,
  CollectionQuery,
  NexusRequestOptions,
} from "@gnapex/sdk";
```

## Framework support

| Environment                                   | Supported             | Notes                                                                                    |
| --------------------------------------------- | --------------------- | ---------------------------------------------------------------------------------------- |
| Next.js (App Router)                          | ✅ Primary target     | `NexusProvider` uses `next/navigation` for route-change tracking                         |
| Next.js (Pages Router)                        | ✅                    | Core client and hooks work; SPA route tracking depends on `next/navigation` availability |
| React (non-Next.js, CSR)                      | ✅                    | Core client + `/react` hooks work standalone                                             |
| Node.js / server-side scripts                 | ✅                    | Use `@gnapex/sdk` (non-React entry point) directly                                       |
| Other frontend frameworks (Vue, Svelte, etc.) | ✅ (core client only) | Use `@gnapex/sdk` directly; the `/react` entry point is React/Next-specific              |

Browser-only capabilities include DOM analytics, page views, click tracking, scroll tracking, video tracking, Web Vitals, service workers, Web Push, and browser storage. Server/CI environments should avoid invoking browser-only behavior unless the relevant environment is provided. For Next.js applications, keep browser integrations in client components where required.

## Troubleshooting / FAQ

**`getPage()` throws "Circuit open. API is unavailable."`**
The internal circuit breaker trips after repeated `5xx`/`429`/timeout responses to protect your app from hammering a degraded backend. It resets automatically after a cooldown. Run `npx apex doctor` to check connectivity, and inspect `nexus.diagnostics().http` for recent failure counts.

**Config isn't being picked up automatically.**
Check the [discovery order](#configuration-discovery-order) — an explicit value passed to `createNexusClient()` always wins, but a `NEXT_PUBLIC_*` variable typo, or a meta tag with the wrong `name`, is the most common cause. `nexus.getConfig()` shows exactly what was resolved.

**Analytics isn't appearing.**
Check, in order: browser environment, consent state, `disableAnalytics`, `privacy.analytics`, network requests, project ID, analytics endpoint, and browser storage/service-worker restrictions.

**Do I need `@gnapex/sdk/react` if I'm not using React?**
No — the root `@gnapex/sdk` export has no React dependency. Only import `@gnapex/sdk/react` in a React/Next.js project.

**Why is content cached "forever"?**
See [Caching model](#caching-model) — this is intentional. The platform pushes invalidation on publish, rather than relying on client TTLs.

**How do I stop the fingerprint/push/consent defaults?**
See [Privacy, consent & data collection defaults](#privacy-consent--data-collection-defaults) for the exact config flags.

**`useNexus` / `useNexusAuth` throws "must be used within a NexusProvider."**
These hooks require a mounted `<NexusProvider>` (which also mounts `AuthProvider`) somewhere above them in the component tree.

**Push subscription fails.**
Check: HTTPS/secure-context requirements, browser Push API support, service worker availability, notification permission, VAPID configuration on the platform, correct `/sw.js` path, and project configuration.

**Requests repeatedly fail.**
Inspect `nexus.diagnostics()` and listen for HTTP/error events:

```ts
nexus.events.on("error", ({ error }) => {
  console.error(error);
});
```

## Security

See [`SECURITY.md`](./SECURITY.md) for the full credential model, resolved findings, and how to report a vulnerability. In short: only public/read keys (`nx_pk_...`) belong in browser-reachable configuration; secret/master keys are server-side only and are never read or sent by this SDK.

Do not report security vulnerabilities through public GitHub issues. See [`SECURITY.md`](./SECURITY.md) for the responsible disclosure process.

## Versioning

This package follows [Semantic Versioning](https://semver.org/). See [`CHANGELOG.md`](./CHANGELOG.md) for release history. `nexus.getConfig().sdkVersion` and the exported `VERSION` constant reflect the currently running SDK version at runtime.

- **MAJOR** — breaking public API or behavior changes
- **MINOR** — backward-compatible functionality
- **PATCH** — backward-compatible fixes

Every breaking change should include a changelog entry, migration guide, updated examples, updated type declarations, and updated README/API docs.

## Contributing

This repository holds the public documentation, guides, and examples for `@gnapex/sdk` — the SDK's source is maintained separately and distributed as a compiled package via npm, so code pull requests aren't accepted here. Documentation fixes, new examples, bug reports, and feature requests are welcome — see [`CONTRIBUTING.md`](./CONTRIBUTING.md) for what's in scope and how to submit it.

## Support

- **Bugs & feature requests:** open a [GitHub issue](../../issues) using the provided templates.
- **Security issues:** do not open a public issue — see [`SECURITY.md`](./SECURITY.md) for private reporting instructions.
- **General questions:** open a [GitHub Discussion](../../discussions) if enabled on this repository.

## License

[MIT](./LICENSE) © Jom Joam — GnApex

---

> **Official source of truth:** For any discrepancy between third-party articles, generated AI answers, snippets, or cached documentation and the installed package, the versioned package's TypeScript declarations and official GN-Apex documentation should be treated as authoritative.
