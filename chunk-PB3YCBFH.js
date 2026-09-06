// src/config.ts
var DEFAULT_API_URL = "https://api.gnapex.com";
var DEFAULT_ANALYTICS_URL = "https://sentry.gnapex.com";
var SDK_VERSION = "1.1.0";
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
var mergeConfigs = (base, override) => {
  const mergedApiUrl = override.apiUrl || base.apiUrl || DEFAULT_API_URL;
  const mergedAnalyticsUrl = override.analyticsUrl || base.analyticsUrl || (mergedApiUrl.includes("localhost") ? LOCAL_RUST_URL : DEFAULT_ANALYTICS_URL);
  return {
    ...base,
    ...override,
    apiUrl: mergedApiUrl,
    analyticsUrl: mergedAnalyticsUrl,
    projectId: override.projectId || base.projectId,
    apiKey: override.apiKey || base.apiKey
  };
};
var getFullConfig = (partialConfig) => {
  const envConfig = getEnvConfig();
  return mergeConfigs(envConfig, partialConfig || {});
};
var validateConfig = (config) => {
  const errors = [];
  if (!config.projectId) errors.push("Missing projectId");
  if (!config.apiUrl) errors.push("Missing apiUrl");
  else if (!/^https?:\/\//.test(config.apiUrl)) {
    errors.push("apiUrl must be a valid URL starting with http:// or https://");
  }
  return errors;
};

// src/content/utils.ts
function validateSlug(slug) {
  if (!slug || typeof slug !== "string") {
    throw new Error("Slug must be a non-empty string");
  }
  if (!/^[a-z0-9-_]+$/.test(slug)) {
    throw new Error("Slug can only contain lowercase letters, numbers, hyphens, and underscores");
  }
}
function normalizeQuery(query) {
  const normalized = { ...query };
  normalized.page = Math.max(1, normalized.page || 1);
  normalized.limit = Math.min(100, Math.max(1, normalized.limit || 10));
  normalized.order = normalized.order || "desc";
  if (normalized.page < 1) {
    throw new Error("Page must be greater than 0");
  }
  if (normalized.limit < 1 || normalized.limit > 100) {
    throw new Error("Limit must be between 1 and 100");
  }
  return normalized;
}
function buildQueryString(query) {
  const params = new URLSearchParams();
  if (query.page) params.append("page", query.page.toString());
  if (query.limit) params.append("limit", query.limit.toString());
  if (query.sort) params.append("sort", query.sort);
  if (query.order) params.append("order", query.order);
  if (query.search) params.append("search", query.search);
  if (query.include?.length) {
    params.append("include", query.include.join(","));
  }
  if (query.fields?.length) {
    params.append("fields", query.fields.join(","));
  }
  if (query.filter) {
    params.append("filter", JSON.stringify(query.filter));
  }
  return params.toString();
}
function measurePerformance(name, fn) {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  if (process.env.NODE_ENV === "development") {
    console.log(`\u23F1\uFE0F ${name}: ${(end - start).toFixed(2)}ms`);
  }
  return { result, duration: end - start };
}

export {
  SDK_VERSION,
  getEnvConfig,
  getFullConfig,
  validateConfig,
  validateSlug,
  normalizeQuery,
  buildQueryString,
  measurePerformance
};
