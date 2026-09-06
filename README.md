# GN-Apex SDK

The official JavaScript/TypeScript SDK for **GN-Apex**.

Build modern applications powered by GN-Apex content, analytics, authentication, real-time updates, feature flags, remote configuration, media, rich content, and more — with a unified developer experience for JavaScript and React applications.

[![npm](https://img.shields.io/npm/v/@gn-apex/sdk)](https://www.npmjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-supported-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-supported-61dafb)](https://react.dev/)

---

## ✨ Features

* 🚀 TypeScript-first API
* 📦 Modern ESM and CommonJS support
* ⚡ Intelligent client-side caching
* 📡 Reliable API communication
* 📊 Product and behavioral analytics
* 👤 User identity and groups
* 🔐 Authentication support
* 🎛️ Feature flags
* ⚙️ Remote configuration
* 🔴 Live update subscriptions
* 🔔 Web Push support
* 📝 Rich content rendering
* 🖼️ Image and gallery components
* 🎥 Video support
* 🗺️ Map rendering
* 💻 Code rendering
* 📈 Analytics and Web Vitals
* 🧩 React hooks and providers
* 🛡️ Privacy controls
* 🧰 Diagnostics and structured errors
* 🌐 Browser and server-friendly APIs

---

# Installation

## npm

```bash
npm install @gn-apex/sdk
```

## pnpm

```bash
pnpm add @gn-apex/sdk
```

## yarn

```bash
yarn add @gn-apex/sdk
```

## bun

```bash
bun add @gn-apex/sdk
```

---

# Requirements

The SDK is designed for modern JavaScript/TypeScript applications.

Recommended:

* Node.js 18+
* TypeScript 5+
* Modern evergreen browsers

React applications should use a supported modern React version.

---

# Quick Start

## JavaScript / TypeScript

```ts
import { createNexusClient } from "@gn-apex/sdk";

const nexus = createNexusClient({
  projectId: "your-project-id",
  apiKey: "your-public-api-key",
});

const page = await nexus.content.getPage("home");

console.log(page);
```

---

# Configuration

The SDK supports explicit configuration as well as runtime environment discovery.

```ts
import { createNexusClient } from "@gn-apex/sdk";

const nexus = createNexusClient({
  projectId: "your-project-id",
  apiKey: "your-public-api-key",

  apiUrl: "https://api.gnapex.com",

  analyticsUrl: "https://sentry.gnapex.com",

  environment: "production",

  cacheStrategy: "memory",

  timeout: 10000,

  retries: 3,
});
```

## Configuration options

| Option                   | Description                                  |
| ------------------------ | -------------------------------------------- |
| `projectId`              | GN-Apex project identifier                   |
| `apiKey`                 | Public SDK/API key                           |
| `apiUrl`                 | GN-Apex API endpoint                         |
| `analyticsUrl`           | Analytics endpoint                           |
| `environment`            | `development`, `staging`, or `production`    |
| `debug`                  | Enable SDK diagnostics                       |
| `cacheStrategy`          | `memory`, `localStorage`, or `none`          |
| `revalidateTime`         | Cache revalidation period                    |
| `timeout`                | Request timeout                              |
| `retries`                | Number of retry attempts                     |
| `cacheInvalidation`      | `platform` or `manual`                       |
| `autoTracking`           | Enable automatic analytics tracking          |
| `privacy.analytics`      | Enable or disable analytics                  |
| `privacy.fingerprinting` | Enable or disable fingerprinting             |
| `privacy.redact`         | Enable privacy redaction                     |
| `publicKeyOnly`          | Restrict configuration to public credentials |

---

# Environment Configuration

Configuration can also be discovered from supported runtime environments.

### Browser

```html
<meta name="gnapex-project" content="your-project-id">
```

### Next.js

```env
NEXT_PUBLIC_GNAPEX_PROJECT_ID=your-project-id
NEXT_PUBLIC_GNAPEX_API_KEY=your-public-api-key
```

### Node.js

```env
GNAPEX_PROJECT_ID=your-project-id
GNAPEX_API_KEY=your-public-api-key
```

GN-Apex also supports the corresponding `NEXUS_*` environment naming convention.

Explicit constructor configuration takes precedence over automatically discovered configuration.

---

# Content

The SDK provides a unified content API.

## Get a page

```ts
const page = await nexus.content.getPage("home");
```

With options:

```ts
const page = await nexus.content.getPage("home", {
  revalidate: 60,
  forceRefresh: false,
  includeMetadata: true,
});
```

---

## Get a collection

```ts
const posts = await nexus.content.getCollection("posts");
```

Pagination:

```ts
const posts = await nexus.content.getCollection("posts", {
  page: 1,
  limit: 20,
});
```

Sorting:

```ts
const posts = await nexus.content.getCollection("posts", {
  sort: "createdAt",
  order: "desc",
});
```

Filtering:

```ts
const posts = await nexus.content.getCollection("posts", {
  filter: {
    published: true,
    category: "technology",
  },
});
```

Searching:

```ts
const results = await nexus.content.search("cloud computing", {
  collections: ["posts"],
  limit: 10,
});
```

---

# Get an Item

```ts
const post = await nexus.content.getItem(
  "posts",
  "post-123"
);
```

---

# Global Content

```ts
const globals = await nexus.content.getGlobals();
```

You can request specific global fields:

```ts
const globals = await nexus.content.getGlobals({
  include: ["navigation", "footer"],
});
```

---

# Prefetching

Prefetch content before it is needed:

```ts
await nexus.content.prefetch([
  "/content/home",
  "/content/about",
  "/content/contact",
]);
```

This can be useful for navigation-heavy applications and predictable content flows.

---

# Cache

GN-Apex provides configurable client-side caching.

Supported strategies:

```ts
cacheStrategy: "memory"
```

```ts
cacheStrategy: "localStorage"
```

```ts
cacheStrategy: "none"
```

Example:

```ts
const nexus = createNexusClient({
  projectId: "your-project-id",
  apiKey: "your-public-api-key",
  cacheStrategy: "memory",
});
```

## Cache invalidation

```ts
nexus.content.invalidateCache([
  "content:home",
]);
```

Clear all client cache:

```ts
nexus.content.clearCache();
```

Inspect cache statistics:

```ts
const stats = nexus.content.getCacheStats();

console.log(stats);
```

---

# Analytics

Analytics can be used directly through the SDK.

```ts
nexus.analytics.track("button_clicked", {
  button: "signup",
});
```

---

## Page Views

```ts
nexus.analytics.pageView();
```

Custom referrer:

```ts
nexus.analytics.pageView("/previous-page");
```

---

# User Identity

Associate analytics activity with a user:

```ts
await nexus.analytics.identify("user_123", {
  plan: "pro",
  role: "admin",
});
```

---

# Groups

Associate users with organizations, teams, or other groups:

```ts
await nexus.analytics.group("organization_123", {
  name: "Example Organization",
  plan: "enterprise",
});
```

---

# Alias

```ts
await nexus.analytics.alias("new-user-id");
```

---

# Reset Identity

```ts
nexus.analytics.reset();
```

For a privacy/GDPR-oriented reset:

```ts
nexus.analytics.reset(true);
```

---

# Purchases

Track purchases using structured transaction data:

```ts
nexus.analytics.trackPurchase({
  orderId: "order_123",
  total: 149.99,
  revenue: 149.99,
  currency: "USD",

  products: [
    {
      id: "product_1",
      name: "Premium Plan",
      price: 149.99,
      quantity: 1,
      sku: "PREMIUM",
    },
  ],
});
```

---

# Error Tracking

```ts
nexus.analytics.trackError(
  new Error("Something went wrong"),
  {
    component: "Checkout",
  }
);
```

---

# Sessions

Retrieve the current analytics session:

```ts
const sessionId = nexus.analytics.getSessionId();
```

---

# Automatic Analytics

Automatic tracking can be enabled through configuration:

```ts
const nexus = createNexusClient({
  projectId: "your-project-id",
  apiKey: "your-public-api-key",

  autoTracking: true,
});
```

Depending on configuration and environment, analytics can capture application activity such as:

* Page views
* Route changes
* Clicks
* Forms
* Outbound links
* Video interaction
* Sharing activity
* Scroll depth
* Errors
* Web performance metrics

Always configure analytics and privacy behavior according to your application's consent and data policies.

---

# React

Install React support:

```bash
npm install @gn-apex/sdk react
```

Import the React integration:

```tsx
import {
  NexusProvider,
  useNexus,
} from "@gn-apex/sdk/react";
```

---

# NexusProvider

Wrap your application:

```tsx
import { NexusProvider } from "@gn-apex/sdk/react";

export default function App() {
  return (
    <NexusProvider
      projectId="your-project-id"
    >
      <YourApplication />
    </NexusProvider>
  );
}
```

---

# useNexus

```tsx
import { useNexus } from "@gn-apex/sdk/react";

function HomePage() {
  const nexus = useNexus();

  // Use the GN-Apex client here

  return <div>Hello GN-Apex</div>;
}
```

---

# useNexusAnalytics

```tsx
import { useNexusAnalytics } from "@gn-apex/sdk/react";

function SignupButton() {
  const analytics = useNexusAnalytics();

  return (
    <button
      onClick={() => {
        analytics.track("signup_clicked");
      }}
    >
      Sign up
    </button>
  );
}
```

---

# Authentication

The React package includes authentication support.

```tsx
import {
  AuthProvider,
  useNexusAuth,
} from "@gn-apex/sdk/react";
```

Example:

```tsx
function Account() {
  const {
    user,
    loading,
    login,
    logout,
  } = useNexusAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return (
      <button
        onClick={() =>
          login({
            email: "user@example.com",
            password: "password",
          })
        }
      >
        Sign in
      </button>
    );
  }

  return (
    <div>
      Welcome, {user.email}

      <button onClick={() => logout()}>
        Sign out
      </button>
    </div>
  );
}
```

> Never expose private credentials, server secrets, or privileged API keys in browser applications.

---

# Live Updates

Subscribe to live updates:

```tsx
import { useNexusLiveFeed } from "@gn-apex/sdk/react";

function LiveComponent() {
  const live = useNexusLiveFeed();

  // Consume live events here

  return null;
}
```

The React provider can enable live updates:

```tsx
<NexusProvider
  projectId="your-project-id"
  enableLiveFeed
>
  <App />
</NexusProvider>
```

---

# Web Push

GN-Apex supports browser push functionality through the SDK.

Push behavior should be enabled deliberately by your application and should follow browser permission and privacy requirements.

The SDK exposes:

```ts
NexusPushClient
```

for push-related functionality.

---

# Rich Content Rendering

The React package provides a collection of content rendering components.

## NexusRenderer

```tsx
import { NexusRenderer } from "@gn-apex/sdk/react";

<NexusRenderer
  content={content}
/>
```

With a custom class:

```tsx
<NexusRenderer
  content={content}
  className="prose max-w-none"
/>
```

---

# Rich Text

```tsx
import { NexusRichText } from "@gn-apex/sdk/react";

<NexusRichText
  value={content}
/>
```

---

# Long Text

```tsx
import { NexusLongText } from "@gn-apex/sdk/react";

<NexusLongText
  value={content}
/>
```

---

# Images

```tsx
import { NexusImage } from "@gn-apex/sdk/react";

<NexusImage
  value={image}
  alt="Example image"
/>
```

---

# Galleries

```tsx
import { NexusGallery } from "@gn-apex/sdk/react";

<NexusGallery
  value={gallery}
/>
```

---

# Video

```tsx
import { NexusVideo } from "@gn-apex/sdk/react";

<NexusVideo
  value={video}
/>
```

---

# Maps

```tsx
import { NexusMap } from "@gn-apex/sdk/react";

<NexusMap
  value={location}
/>
```

---

# Icons

```tsx
import { NexusIcon } from "@gn-apex/sdk/react";

<NexusIcon
  name="home"
  size={24}
/>
```

---

# Code

```tsx
import { NexusCode } from "@gn-apex/sdk/react";

<NexusCode
  value={code}
  language="typescript"
  showLineNumbers
/>
```

---

# Colors

```tsx
import { NexusColor } from "@gn-apex/sdk/react";

<NexusColor
  value="#6366f1"
  showHexLabel
/>
```

---

# Gradients

```tsx
import { NexusGradient } from "@gn-apex/sdk/react";

<NexusGradient value={gradient}>
  Gradient content
</NexusGradient>
```

---

# Address

```tsx
import { NexusAddress } from "@gn-apex/sdk/react";

<NexusAddress
  value={address}
/>
```

---

# Tags

```tsx
import { NexusTags } from "@gn-apex/sdk/react";

<NexusTags
  value={tags}
/>
```

---

# Progress

```tsx
import { NexusProgress } from "@gn-apex/sdk/react";

<NexusProgress
  value={75}
  max={100}
/>
```

---

# Feature Flags

Feature flags can be accessed through the SDK:

```ts
const enabled = await nexus.featureFlags.isEnabled(
  "new-dashboard"
);
```

Use feature flags to safely control application functionality without requiring a new deployment for every configuration change.

---

# Remote Configuration

Retrieve application configuration through the SDK:

```ts
const config = await nexus.remoteConfig.get(
  "checkout"
);
```

Remote configuration is useful for application behavior that needs to be managed centrally.

---

# Errors

GN-Apex exposes structured errors through `NexusError`.

```ts
import {
  NexusError,
  isNexusError,
} from "@gn-apex/sdk";

try {
  await nexus.content.getPage("missing-page");
} catch (error) {
  if (isNexusError(error)) {
    console.error(error.code);
    console.error(error.message);
  }
}
```

---

# Diagnostics

Retrieve SDK diagnostics:

```ts
import { getDiagnostics } from "@gn-apex/sdk";

const diagnostics = getDiagnostics(
  "1.1.0",
  "production"
);

console.log(diagnostics);
```

Diagnostics can help identify configuration and runtime issues when troubleshooting an integration.

---

# Events

The SDK exposes an event system for application-level SDK events.

Examples include:

```text
request:start
request:end
cache:hit
cache:miss
analytics:queued
analytics:flushed
content:updated
```

Example:

```ts
nexus.events.on("request:end", (event) => {
  console.log(event);
});
```

---

# Browser & Server Usage

The SDK is designed to work across modern JavaScript environments.

For server-side applications, avoid exposing credentials intended to remain private.

For browser applications, use public/project-scoped credentials intended for client-side use.

---

# Security

GN-Apex SDK credentials should be treated according to their privilege level.

### Client applications

Use public/client-safe credentials only.

### Server applications

Keep privileged credentials on the server.

Never commit secrets to:

```text
.env
source code
public repositories
client bundles
```

If a secret is accidentally exposed, revoke and rotate it immediately.

---

# Privacy

GN-Apex provides privacy controls through SDK configuration.

```ts
const nexus = createNexusClient({
  projectId: "your-project-id",
  apiKey: "your-public-api-key",

  privacy: {
    analytics: true,
    fingerprinting: false,
    redact: true,
  },
});
```

Applications are responsible for determining the appropriate consent and privacy configuration for their users, jurisdictions, and use cases.

---

# TypeScript

The SDK ships with TypeScript declarations.

```ts
import type {
  CollectionResponse,
  CollectionQuery,
  NexusConfig,
} from "@gn-apex/sdk";
```

This provides typed configuration, content responses, analytics APIs, errors, events, and other SDK interfaces.

---

# Module Usage

The main SDK:

```ts
import {
  createNexusClient,
  nexus,
} from "@gn-apex/sdk";
```

React integration:

```ts
import {
  NexusProvider,
  useNexus,
  useNexusAnalytics,
  NexusRenderer,
} from "@gn-apex/sdk/react";
```

---

# Default Endpoints

The SDK uses GN-Apex hosted services by default.

API:

```text
https://api.gnapex.com
```

Analytics:

```text
https://sentry.gnapex.com
```

Custom endpoints can be supplied through configuration when required.

---

# SDK Version

The SDK exposes its runtime version:

```ts
import {
  SDK_VERSION,
  VERSION,
} from "@gn-apex/sdk";

console.log(SDK_VERSION);
```

---

# Package Exports

The SDK provides the following major capabilities:

### Core

* `NexusClient`
* `createNexusClient`
* `nexus`
* `NexusHttpClient`
* `NexusError`

### Content

* `ContentEngine`
* `CollectionQuery`
* `CollectionResponse`
* `ContentResponse`

### Analytics

* `AnalyticsEngine`

### Caching

* `MemoryCache`
* `BrowserCache`
* `CacheTags`
* `CacheEntry`
* `CacheMetadata`

### Configuration

* `getEnvConfig`
* `getFullConfig`
* `mergeConfigs`
* `validateConfig`
* `hasRequiredConfig`

### Platform

* `FeatureFlags`
* `RemoteConfig`
* `NexusPushClient`

### Events

* `NexusEventBus`
* `NexusEventMap`

### React

* `NexusProvider`
* `useNexus`
* `useNexusAnalytics`
* `useNexusAuth`
* `useNexusLiveFeed`
* `AuthProvider`

### Rendering

* `NexusRenderer`
* `NexusRichText`
* `NexusLongText`
* `NexusImage`
* `NexusGallery`
* `NexusVideo`
* `NexusMap`
* `NexusIcon`
* `NexusColor`
* `NexusGradient`
* `NexusAddress`
* `NexusKeyValue`
* `NexusTags`
* `NexusProgress`
* `NexusBlendContainer`
* `NexusCode`
* `NexusBoolean`

---

# Compatibility

GN-Apex SDK is intended for modern web applications and JavaScript runtimes.

Test your specific framework/runtime combination in your application's CI pipeline before deploying to production.

---

# Troubleshooting

## Configuration errors

Verify:

```text
projectId
apiKey
apiUrl
analyticsUrl
```

and make sure the credentials belong to the intended GN-Apex project/environment.

---

## Content requests failing

Check:

1. Project configuration
2. Network connectivity
3. API endpoint
4. Authentication/public key configuration
5. Browser console
6. SDK diagnostics

Enable debugging where appropriate:

```ts
const nexus = createNexusClient({
  projectId: "your-project-id",
  apiKey: "your-public-api-key",
  debug: true,
});
```

---

## Analytics not appearing

Verify that:

```ts
privacy.analytics
```

is enabled and that your application's consent logic permits analytics collection.

Also verify that the browser is able to reach the configured analytics endpoint.

---

# Production Recommendations

Before deploying a production application:

* Use production project credentials.
* Keep privileged credentials server-side.
* Configure privacy and consent behavior.
* Enable caching where appropriate.
* Configure request timeouts.
* Configure retry behavior appropriate for your workload.
* Monitor SDK errors.
* Test SSR/client boundaries where applicable.
* Test authentication flows.
* Test offline and degraded-network behavior.
* Verify analytics events before launch.

---

# Contributing

This repository contains the **public distribution of the GN-Apex SDK**.

The internal implementation, development tooling, tests, and proprietary source code are maintained separately.

For:

* Bug reports
* Feature requests
* Documentation improvements
* Integration questions

please use the project's issue/discussion channels or contact the GN-Apex team.

---

# License

Copyright © GN-Apex.

All rights reserved unless otherwise stated in the applicable license or commercial agreement.

---

# Support

For GN-Apex support, integration assistance, or enterprise inquiries, contact the GN-Apex team.

**GN-Apex**

https://www.gnapex.com/

---

## Built for modern applications

GN-Apex SDK provides a unified client experience for applications that need content, analytics, identity, configuration, real-time capabilities, and rich content rendering without requiring developers to manage multiple platform integrations themselves.

**Build with GN-Apex.**
