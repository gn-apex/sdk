import {
  SDK_VERSION,
  buildQueryString,
  getFullConfig,
  measurePerformance,
  normalizeQuery,
  validateConfig,
  validateSlug
} from "./chunk-PB3YCBFH.js";

// src/components/NexusRenderer.tsx
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { createPortal } from "react-dom";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}
var DEFAULT_CHART = {
  chartType: "bar",
  title: "Untitled Chart",
  categories: ["Category A", "Category B", "Category C", "Category D"],
  series: [
    {
      label: "Series 1",
      color: "#6366f1",
      data: [40, 65, 30, 80]
    }
  ],
  showLegend: true,
  showGrid: true,
  width: 560,
  height: 320,
  sourceNote: null
};
var FALLBACK_CHART_COLORS = [
  "#6366f1",
  "#f97316",
  "#10b981",
  "#ec4899",
  "#0ea5e9",
  "#eab308",
  "#a855f7",
  "#ef4444",
  "#14b8a6",
  "#84cc16"
];
function decodeChartSpec(raw) {
  if (!raw) return null;
  try {
    const decoded = JSON.parse(
      decodeURIComponent(atob(raw))
    );
    if (!decoded || typeof decoded !== "object") return null;
    const categories = Array.isArray(decoded.categories) ? decoded.categories.map(String) : DEFAULT_CHART.categories;
    const series = Array.isArray(decoded.series) ? decoded.series.filter(Boolean).map((s, index) => ({
      label: typeof s.label === "string" ? s.label : `Series ${index + 1}`,
      color: typeof s.color === "string" ? s.color : FALLBACK_CHART_COLORS[index % FALLBACK_CHART_COLORS.length],
      data: Array.isArray(s.data) ? s.data.map((v) => {
        const n = Number(v);
        return Number.isFinite(n) ? n : 0;
      }) : []
    })) : DEFAULT_CHART.series;
    return {
      ...DEFAULT_CHART,
      ...decoded,
      categories,
      series: series.length ? series : DEFAULT_CHART.series,
      chartType: ["bar", "line", "pie", "donut", "area"].includes(decoded.chartType) ? decoded.chartType : DEFAULT_CHART.chartType,
      title: typeof decoded.title === "string" ? decoded.title : DEFAULT_CHART.title,
      showLegend: typeof decoded.showLegend === "boolean" ? decoded.showLegend : DEFAULT_CHART.showLegend,
      showGrid: typeof decoded.showGrid === "boolean" ? decoded.showGrid : DEFAULT_CHART.showGrid,
      width: typeof decoded.width === "number" && decoded.width > 0 ? decoded.width : DEFAULT_CHART.width,
      height: typeof decoded.height === "number" && decoded.height > 0 ? decoded.height : DEFAULT_CHART.height,
      sourceNote: typeof decoded.sourceNote === "string" ? decoded.sourceNote : null
    };
  } catch {
    return null;
  }
}
function recoverChartFromElement(element) {
  const spec = decodeChartSpec(element.getAttribute("data-chart-spec"));
  if (spec) return spec;
  const title = element.getAttribute("data-chart-title") || DEFAULT_CHART.title;
  const chartType = element.getAttribute("data-chart-type");
  return {
    ...DEFAULT_CHART,
    title,
    chartType: ["bar", "line", "pie", "donut", "area"].includes(chartType) ? chartType : "bar"
  };
}
function prepareDocumentHTML(html) {
  if (typeof window === "undefined") return html;
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  doc.querySelectorAll("script, noscript").forEach((node) => node.remove());
  doc.querySelectorAll("*").forEach((element) => {
    [...element.attributes].forEach((attr) => {
      if (attr.name.toLowerCase().startsWith("on")) {
        element.removeAttribute(attr.name);
      }
    });
    const href = element.getAttribute("href");
    const src = element.getAttribute("src");
    if (href && /^\s*javascript:/i.test(href)) element.removeAttribute("href");
    if (src && /^\s*javascript:/i.test(src)) element.removeAttribute("src");
  });
  return doc.body.innerHTML;
}
function NativeNexusChart({ chart }) {
  const [hoveredValue, setHoveredValue] = useState(null);
  const categories = chart.categories;
  const series = chart.series;
  const allNumbers = series.flatMap((s) => s.data);
  const maxVal = Math.max(...allNumbers, 10);
  const minVal = Math.min(0, ...allNumbers);
  const width = 560;
  const height = Math.max(220, Math.min(chart.height || 300, 450));
  const padLeft = 45;
  const padRight = 20;
  const padTop = 20;
  const padBottom = 35;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;
  const getY = (val) => {
    const range = maxVal - minVal;
    return padTop + plotH - (val - minVal) / range * plotH;
  };
  const getX = (catIndex) => {
    return padLeft + catIndex / Math.max(categories.length - 1, 1) * plotW;
  };
  const renderGridAndAxes = () => /* @__PURE__ */ jsxs(Fragment, { children: [
    chart.showGrid && /* @__PURE__ */ jsx(Fragment, { children: [0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
      const y = padTop + plotH * (1 - pct);
      const val = Math.round(minVal + (maxVal - minVal) * pct);
      return /* @__PURE__ */ jsxs("g", { children: [
        /* @__PURE__ */ jsx(
          "line",
          {
            x1: padLeft,
            y1: y,
            x2: width - padRight,
            y2: y,
            stroke: "currentColor",
            strokeOpacity: 0.08,
            strokeDasharray: "3 3"
          }
        ),
        /* @__PURE__ */ jsx(
          "text",
          {
            x: padLeft - 8,
            y: y + 3,
            textAnchor: "end",
            fontSize: 10,
            fill: "currentColor",
            opacity: 0.5,
            className: "font-mono",
            children: val
          }
        )
      ] }, `grid-${i}`);
    }) }),
    categories.map((cat, i) => {
      const x = categories.length === 1 ? padLeft + plotW / 2 : getX(i);
      return /* @__PURE__ */ jsx(
        "text",
        {
          x,
          y: height - 10,
          textAnchor: "middle",
          fontSize: 11,
          fill: "currentColor",
          opacity: 0.6,
          className: "font-mono",
          children: cat
        },
        `cat-${i}`
      );
    })
  ] });
  const renderBars = () => {
    const groupW = plotW / categories.length;
    const barWidth = Math.max(6, Math.min(28, groupW * 0.7 / series.length));
    return categories.map((cat, catIdx) => {
      const groupCenterX = padLeft + catIdx * groupW + groupW / 2;
      const startX = groupCenterX - series.length * barWidth / 2;
      return series.map((s, sIdx) => {
        const val = s.data[catIdx] || 0;
        const barH = (val - minVal) / (maxVal - minVal) * plotH;
        const x = startX + sIdx * barWidth;
        const y = padTop + plotH - barH;
        return /* @__PURE__ */ jsx(
          "rect",
          {
            x,
            y,
            width: barWidth - 2,
            height: Math.max(barH, 2),
            rx: 3,
            fill: s.color,
            opacity: 0.9,
            className: "transition-all duration-300 hover:opacity-100 cursor-pointer",
            onMouseEnter: () => setHoveredValue(`${cat} \u2022 ${s.label}: ${val.toLocaleString()}`),
            onMouseLeave: () => setHoveredValue(null)
          },
          `bar-${catIdx}-${sIdx}`
        );
      });
    });
  };
  const renderLinesOrArea = (isArea) => {
    return series.map((s, sIdx) => {
      const points = s.data.map((val, catIdx) => `${getX(catIdx)},${getY(val)}`).join(" ");
      const areaPoints = `${getX(0)},${padTop + plotH} ${points} ${getX(s.data.length - 1)},${padTop + plotH}`;
      return /* @__PURE__ */ jsxs("g", { children: [
        isArea && /* @__PURE__ */ jsx("polygon", { points: areaPoints, fill: s.color, fillOpacity: 0.15 }),
        /* @__PURE__ */ jsx(
          "polyline",
          {
            points,
            fill: "none",
            stroke: s.color,
            strokeWidth: 2.5,
            strokeLinecap: "round",
            strokeLinejoin: "round"
          }
        ),
        s.data.map((val, catIdx) => /* @__PURE__ */ jsx(
          "circle",
          {
            cx: getX(catIdx),
            cy: getY(val),
            r: 4,
            fill: s.color,
            className: "cursor-pointer transition-transform hover:scale-150",
            onMouseEnter: () => setHoveredValue(
              `${categories[catIdx]} \u2022 ${s.label}: ${val.toLocaleString()}`
            ),
            onMouseLeave: () => setHoveredValue(null)
          },
          `dot-${catIdx}`
        ))
      ] }, `series-${sIdx}`);
    });
  };
  const renderPieOrDonut = () => {
    const s = series[0] || { data: [] };
    const total = s.data.reduce((a, b) => a + (Number(b) || 0), 0) || 1;
    let accumulated = 0;
    const cx = width / 2;
    const cy = height / 2;
    const r = Math.min(cx, cy) - 30;
    const isDonut = chart.chartType === "donut";
    return /* @__PURE__ */ jsxs("g", { transform: `translate(${cx}, ${cy})`, children: [
      categories.map((cat, idx) => {
        const val = s.data[idx] || 0;
        const sliceAngle = val / total * 2 * Math.PI;
        const startAngle = accumulated;
        const endAngle = accumulated + sliceAngle;
        accumulated += sliceAngle;
        const x1 = Math.cos(startAngle) * r;
        const y1 = Math.sin(startAngle) * r;
        const x2 = Math.cos(endAngle) * r;
        const y2 = Math.sin(endAngle) * r;
        const largeArc = sliceAngle > Math.PI ? 1 : 0;
        const color = FALLBACK_CHART_COLORS[idx % FALLBACK_CHART_COLORS.length];
        return /* @__PURE__ */ jsx(
          "path",
          {
            d: `M 0 0 L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`,
            fill: color,
            className: "cursor-pointer transition-transform duration-200 hover:scale-105",
            onMouseEnter: () => setHoveredValue(
              `${cat}: ${val.toLocaleString()} (${Math.round(val / total * 100)}%)`
            ),
            onMouseLeave: () => setHoveredValue(null)
          },
          `pie-${idx}`
        );
      }),
      isDonut && /* @__PURE__ */ jsx(
        "circle",
        {
          cx: 0,
          cy: 0,
          r: r * 0.55,
          className: "fill-white dark:fill-zinc-900"
        }
      )
    ] });
  };
  return /* @__PURE__ */ jsxs("figure", { className: "nexus-chart-rendered my-6 w-full rounded-2xl border border-zinc-200 bg-white/70 p-4 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/60", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-2", children: [
      chart.title && /* @__PURE__ */ jsx("figcaption", { className: "text-sm font-semibold text-zinc-900 dark:text-zinc-100", children: chart.title }),
      hoveredValue && /* @__PURE__ */ jsx("span", { className: "font-mono text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded-md", children: hoveredValue })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "w-full overflow-hidden text-zinc-700 dark:text-zinc-300", children: /* @__PURE__ */ jsx(
      "svg",
      {
        viewBox: `0 0 ${width} ${height}`,
        className: "w-full h-auto max-h-[360px] overflow-visible",
        children: chart.chartType === "pie" || chart.chartType === "donut" ? renderPieOrDonut() : /* @__PURE__ */ jsxs(Fragment, { children: [
          renderGridAndAxes(),
          chart.chartType === "bar" && renderBars(),
          chart.chartType === "line" && renderLinesOrArea(false),
          chart.chartType === "area" && renderLinesOrArea(true)
        ] })
      }
    ) }),
    chart.showLegend && /* @__PURE__ */ jsx("div", { className: "flex flex-wrap items-center justify-center gap-3 mt-3 text-xs font-medium text-zinc-600 dark:text-zinc-400", children: (chart.chartType === "pie" || chart.chartType === "donut" ? categories : series).map((item, idx) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
      /* @__PURE__ */ jsx(
        "span",
        {
          className: "h-2.5 w-2.5 rounded-full",
          style: {
            backgroundColor: item.color || FALLBACK_CHART_COLORS[idx % FALLBACK_CHART_COLORS.length]
          }
        }
      ),
      /* @__PURE__ */ jsx("span", { children: item.label || item })
    ] }, `legend-${idx}`)) }),
    chart.sourceNote && /* @__PURE__ */ jsx("figcaption", { className: "mt-2 text-center text-xs text-zinc-400", children: chart.sourceNote })
  ] });
}
function NexusRenderer({
  content,
  className,
  onCommentClick,
  onImageClick,
  hydrateCharts = true,
  enableImageInteraction = true,
  documentClassName
}) {
  const containerRef = useRef(null);
  const mounted = typeof window !== "undefined";
  const preparedHTML = useMemo(
    () => prepareDocumentHTML(content || ""),
    [content]
  );
  const isEmpty = !content || content.trim() === "" || content.trim() === "<p></p>" || content.trim() === "<p><br></p>";
  const handleDocumentClick = useCallback(
    (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const commentElement = target.closest("[data-comment-id]");
      if (commentElement && onCommentClick) {
        const commentId = commentElement.getAttribute("data-comment-id");
        if (commentId) {
          event.preventDefault();
          onCommentClick(commentId);
          return;
        }
      }
      if (enableImageInteraction && onImageClick && target instanceof HTMLImageElement) {
        const src = target.currentSrc || target.src;
        if (src) {
          event.preventDefault();
          onImageClick(src, target.alt || void 0);
        }
      }
    },
    [enableImageInteraction, onCommentClick, onImageClick]
  );
  const [chartTargets, setChartTargets] = useState([]);
  const updateChartTargets = useCallback(() => {
    if (!hydrateCharts) {
      setChartTargets([]);
      return;
    }
    const container = containerRef.current;
    if (!container) return;
    setChartTargets(
      Array.from(
        container.querySelectorAll("[data-nexus-chart]")
      ).map((element) => ({
        element,
        chart: recoverChartFromElement(element)
      }))
    );
  }, [hydrateCharts]);
  useEffect(() => {
    updateChartTargets();
  }, [preparedHTML, updateChartTargets]);
  if (isEmpty) {
    return /* @__PURE__ */ jsx("p", { className: cn("text-sm italic text-zinc-500", className), children: "No descriptive data provisioned for this node." });
  }
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      "article",
      {
        ref: containerRef,
        onClick: handleDocumentClick,
        className: cn(
          "nexus-renderer max-w-none w-full min-w-0 text-[15px] leading-7 md:text-base text-zinc-700 dark:text-zinc-300",
          documentClassName,
          className
        ),
        dangerouslySetInnerHTML: { __html: preparedHTML }
      }
    ),
    mounted && hydrateCharts && chartTargets.map(
      ({ element, chart }, index) => createPortal(
        /* @__PURE__ */ jsx(NativeNexusChart, { chart }, `nexus-chart-${index}`),
        element
      )
    )
  ] });
}

// src/components/NexusProvider.tsx
import React3, {
  createContext as createContext2,
  useEffect as useEffect3,
  useRef as useRef2,
  useMemo as useMemo2,
  useState as useState3,
  useCallback as useCallback3,
  Suspense
} from "react";
import { usePathname, useSearchParams } from "next/navigation";

// src/content/cache-implementations.ts
var CacheTags = {
  project: (projectId) => `nexus_project_${projectId}`,
  content: (slug) => `content_${slug}`,
  collection: (collectionId) => `collection_${collectionId}`,
  global: "nexus_global_config",
  user: (userId) => `user_${userId}`,
  media: (mediaId) => `media_${mediaId}`
};
var MemoryCache = class {
  constructor(options = {}) {
    this.cache = /* @__PURE__ */ new Map();
    this.tagIndex = /* @__PURE__ */ new Map();
    this.stats = {
      size: 0,
      hits: 0,
      misses: 0,
      hitRate: 0,
      evictions: 0
    };
    this.maxSize = options.maxSize || 1e3;
    this.defaultTTL = options.ttl || 5 * 60 * 1e3;
  }
  set(key, data, options = {}) {
    if (this.cache.size >= this.maxSize) {
      this.evictLRU();
    }
    const metadata = {
      timestamp: Date.now(),
      expiresAt: Date.now() + (options.ttl || this.defaultTTL),
      tags: options.tags || [],
      size: this.calculateSize(data)
    };
    this.cache.set(key, { data, metadata });
    this.stats.size = this.cache.size;
    metadata.tags.forEach((tag) => {
      if (!this.tagIndex.has(tag)) {
        this.tagIndex.set(tag, /* @__PURE__ */ new Set());
      }
      this.tagIndex.get(tag).add(key);
    });
  }
  get(key) {
    const entry = this.cache.get(key);
    if (!entry) {
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }
    if (Date.now() > entry.metadata.expiresAt) {
      this.delete(key);
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }
    entry.metadata.timestamp = Date.now();
    this.stats.hits++;
    this.updateHitRate();
    return entry;
  }
  delete(key) {
    const entry = this.cache.get(key);
    if (!entry) return false;
    entry.metadata.tags.forEach((tag) => {
      const keys = this.tagIndex.get(tag);
      if (keys) {
        keys.delete(key);
        if (keys.size === 0) {
          this.tagIndex.delete(tag);
        }
      }
    });
    this.cache.delete(key);
    this.stats.size = this.cache.size;
    return true;
  }
  invalidateByTags(tags) {
    const keysToDelete = /* @__PURE__ */ new Set();
    tags.forEach((tag) => {
      const keys = this.tagIndex.get(tag);
      if (keys) {
        keys.forEach((key) => keysToDelete.add(key));
        this.tagIndex.delete(tag);
      }
    });
    keysToDelete.forEach((key) => this.delete(key));
    if (process.env.NODE_ENV === "development") {
      console.log(
        `[MemoryCache] Invalidated ${keysToDelete.size} entries by tags: ${tags.join(", ")}`
      );
    }
  }
  clear() {
    this.cache.clear();
    this.tagIndex.clear();
    this.stats = {
      size: 0,
      hits: 0,
      misses: 0,
      hitRate: 0,
      evictions: 0
    };
  }
  getStats() {
    return { ...this.stats };
  }
  evictLRU() {
    let oldestKey = null;
    let oldestTime = Infinity;
    for (const [key, entry] of this.cache.entries()) {
      if (entry.metadata.timestamp < oldestTime) {
        oldestTime = entry.metadata.timestamp;
        oldestKey = key;
      }
    }
    if (oldestKey) {
      this.delete(oldestKey);
      this.stats.evictions++;
    }
  }
  calculateSize(data) {
    try {
      const jsonString = JSON.stringify(data);
      return new Blob([jsonString]).size;
    } catch {
      return 0;
    }
  }
  updateHitRate() {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? this.stats.hits / total : 0;
  }
};
var BrowserCache = class {
  constructor(projectId) {
    this.projectId = projectId;
    this.prefix = "nexushub_";
    this.maxSize = 5 * 1024 * 1024;
    // 5MB standard LocalStorage limit
    this.currentSize = 0;
    if (typeof window !== "undefined") {
      this.calculateCurrentSize();
    }
  }
  set(key, data, ttl = 5 * 60 * 1e3) {
    if (typeof window === "undefined") return;
    const storageKey = this.getStorageKey(key);
    const entry = {
      data,
      metadata: {
        timestamp: Date.now(),
        expiresAt: Date.now() + ttl,
        size: this.calculateStorageSize(data)
      }
    };
    const serialized = JSON.stringify(entry);
    const newSize = new Blob([serialized]).size;
    if (this.currentSize + newSize > this.maxSize) {
      this.evictOldest();
    }
    try {
      localStorage.setItem(storageKey, serialized);
      this.currentSize += newSize;
    } catch (error) {
      console.warn("[BrowserCache] Failed to save to localStorage:", error);
      this.evictOldest();
      try {
        localStorage.setItem(storageKey, serialized);
      } catch (e) {
      }
    }
  }
  get(key) {
    if (typeof window === "undefined") return null;
    const storageKey = this.getStorageKey(key);
    const item = localStorage.getItem(storageKey);
    if (!item) return null;
    try {
      const entry = JSON.parse(item);
      if (Date.now() > entry.metadata.expiresAt) {
        this.delete(key);
        return null;
      }
      return entry.data;
    } catch {
      this.delete(key);
      return null;
    }
  }
  delete(key) {
    if (typeof window === "undefined") return;
    const storageKey = this.getStorageKey(key);
    const item = localStorage.getItem(storageKey);
    if (item) {
      this.currentSize -= new Blob([item]).size;
    }
    localStorage.removeItem(storageKey);
  }
  clear() {
    if (typeof window === "undefined") return;
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.prefix)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key));
    this.currentSize = 0;
  }
  getStorageKey(key) {
    return `${this.prefix}${this.projectId}_${key}`;
  }
  calculateCurrentSize() {
    this.currentSize = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.prefix)) {
        const item = localStorage.getItem(key);
        if (item) {
          this.currentSize += new Blob([item]).size;
        }
      }
    }
  }
  calculateStorageSize(data) {
    return new Blob([JSON.stringify(data)]).size;
  }
  evictOldest() {
    let oldestKey = null;
    let oldestTime = Infinity;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.prefix)) {
        const item = localStorage.getItem(key);
        if (item) {
          try {
            const entry = JSON.parse(item);
            if (entry.metadata.timestamp < oldestTime) {
              oldestTime = entry.metadata.timestamp;
              oldestKey = key;
            }
          } catch {
            localStorage.removeItem(key);
          }
        }
      }
    }
    if (oldestKey) {
      const item = localStorage.getItem(oldestKey);
      if (item) {
        this.currentSize -= new Blob([item]).size;
      }
      localStorage.removeItem(oldestKey);
    }
  }
};

// src/content/cache.ts
var LocalCacheProxy = class {
  constructor(cachePath) {
    this.instance = null;
    this.cachePath = cachePath;
  }
  async getInstance() {
    if (this.instance) return this.instance;
    if (typeof window === "undefined") {
      const mod = await import("./local-cache-server-ZPFV3ELS.js");
      this.instance = new mod.LocalCache(this.cachePath);
    } else {
      const mod = await import("./local-cache-client-I6UYVJJV.js");
      this.instance = new mod.LocalCache(this.cachePath);
    }
    return this.instance;
  }
  isLoaded() {
    return this.instance?.isLoaded() || false;
  }
  async getPage(slug) {
    const inst = await this.getInstance();
    return inst.getPage(slug);
  }
  async getCollection(id) {
    const inst = await this.getInstance();
    return inst.getCollection(id);
  }
  async getGlobals() {
    const inst = await this.getInstance();
    return inst.getGlobals();
  }
  async getAllData() {
    const inst = await this.getInstance();
    return inst.getAllData();
  }
};

// src/content/strategies.ts
var RateLimiter = class {
  constructor(config) {
    this.config = config;
    this.requests = [];
  }
  async checkLimit() {
    while (true) {
      const now = Date.now();
      const cutoff = now - this.config.timeWindow;
      this.requests = this.requests.filter((t) => t > cutoff);
      if (this.requests.length < this.config.maxRequests) {
        this.requests.push(now);
        return;
      }
      await new Promise((r) => setTimeout(r, Math.max(1, this.requests[0] + this.config.timeWindow - now)));
    }
  }
  getStats() {
    const now = Date.now();
    return { currentRequests: this.requests.filter((t) => t > now - this.config.timeWindow).length, limit: this.config.maxRequests };
  }
};
var ExponentialBackoff = class {
  constructor(config) {
    this.config = config;
    this.config = { jitter: true, ...config };
  }
  async execute(fn, onRetry) {
    let last;
    for (let a = 0; a <= this.config.maxRetries; a++) {
      try {
        return await fn();
      } catch (e) {
        last = e;
        if (e?.code === "ABORTED" || e?.code === "VALIDATION_ERROR" || e?.status >= 400 && e?.status < 500 && e?.status !== 429) throw e;
        if (a === this.config.maxRetries) break;
        let delay = Math.min(this.config.maxDelay, this.config.baseDelay * 2 ** a);
        if (this.config.jitter) delay *= 0.5 + Math.random();
        onRetry?.(a + 1, delay, e);
        await new Promise((r) => setTimeout(r, delay));
      }
    }
    throw last;
  }
};
var CircuitState = /* @__PURE__ */ ((CircuitState2) => {
  CircuitState2[CircuitState2["CLOSED"] = 0] = "CLOSED";
  CircuitState2[CircuitState2["OPEN"] = 1] = "OPEN";
  CircuitState2[CircuitState2["HALF_OPEN"] = 2] = "HALF_OPEN";
  return CircuitState2;
})(CircuitState || {});
var CircuitBreaker = class {
  constructor(threshold = 5, reset = 3e4) {
    this.threshold = threshold;
    this.reset = reset;
    this.state = 0 /* CLOSED */;
    this.failures = 0;
    this.lastFailure = 0;
  }
  isOpen() {
    if (this.state === 1 /* OPEN */ && Date.now() - this.lastFailure >= this.reset) {
      this.state = 2 /* HALF_OPEN */;
      return false;
    }
    return this.state === 1 /* OPEN */;
  }
  recordSuccess() {
    this.failures = 0;
    this.state = 0 /* CLOSED */;
  }
  recordFailure() {
    this.failures++;
    this.lastFailure = Date.now();
    if (this.failures >= this.threshold) this.state = 1 /* OPEN */;
  }
  getState() {
    return CircuitState[this.state];
  }
};
var RequestBatcher = class {
  constructor(windowMs = 10, maxBatchSize = 50) {
    this.windowMs = windowMs;
    this.maxBatchSize = maxBatchSize;
    this.pending = /* @__PURE__ */ new Map();
  }
  schedule(key, request) {
    const existing = this.pending.get(key);
    if (existing) return existing;
    const promise = new Promise((resolve, reject) => setTimeout(() => request().then(resolve, reject), this.windowMs));
    this.pending.set(key, promise);
    promise.finally(() => this.pending.delete(key)).catch(() => {
    });
    return promise;
  }
  clear() {
    this.pending.clear();
  }
};

// src/content/index.ts
var ContentEngine = class {
  constructor(config) {
    this.config = config;
    this.isServer = typeof window === "undefined";
    this.localCache = new LocalCacheProxy();
    this.memoryCache = new MemoryCache({
      maxSize: 500,
      ttl: 5 * 1e3
      // 👈 5 seconds
    });
    if (!this.isServer) {
      this.browserCache = new BrowserCache(config.projectId);
    }
    this.rateLimiter = new RateLimiter({
      maxRequests: config.debug ? 200 : 100,
      timeWindow: 6e4
    });
    this.backoff = new ExponentialBackoff({
      maxRetries: config.retries || 3,
      baseDelay: 100,
      maxDelay: 5e3,
      jitter: true
    });
    this.requestBatcher = new RequestBatcher(20, 50);
    this.circuitBreaker = new CircuitBreaker();
    this.defaultRevalidate = config.revalidateTime ?? false;
    this.cacheStrategy = config.cacheStrategy || "memory";
    if (!this.isServer) {
      window.addEventListener("beforeunload", this.cleanup.bind(this));
    }
  }
  updateConfig(config) {
    this.config = config;
    this.defaultRevalidate = config.revalidateTime ?? false;
    this.cacheStrategy = config.cacheStrategy || "memory";
  }
  async getPage(slug, options = {}) {
    const { result, duration } = measurePerformance(
      `getPage("${slug}")`,
      () => this._getPage(slug, options)
    );
    if (this.config.debug && duration > 100) {
      console.warn(
        `[GnApex] \u26A0\uFE0F getPage("${slug}") took ${duration.toFixed(2)}ms`
      );
    }
    return result;
  }
  async _getPage(slug, options = {}) {
    validateSlug(slug);
    const {
      revalidate = this.defaultRevalidate,
      tags = [],
      forceRefresh = false,
      includeMetadata = false
    } = options;
    const cacheKey = `page:${slug}`;
    if (!this.isServer && !forceRefresh && this.cacheStrategy === "memory") {
      const cached = this.memoryCache.get(cacheKey);
      if (cached && this.isCacheValid(cached.metadata)) {
        return includeMetadata ? cached : cached.data;
      }
    }
    if (!forceRefresh && process.env.NODE_ENV === "development") {
      try {
        const local = await this.localCache.getPage(slug);
        if (local) {
          return includeMetadata ? {
            data: local,
            metadata: {
              timestamp: Date.now(),
              expiresAt: Infinity,
              tags: []
            }
          } : local;
        }
      } catch {
      }
    }
    if (this.circuitBreaker.isOpen()) {
      throw new Error("[GnApex] Circuit open. API is unavailable.");
    }
    try {
      await this.rateLimiter.checkLimit();
      const data = await this.backoff.execute(async () => {
        return this.fetchPage(
          slug,
          cacheKey,
          tags,
          revalidate,
          forceRefresh
        );
      });
      this.circuitBreaker.recordSuccess();
      return includeMetadata ? data : data.data;
    } catch (error) {
      this.circuitBreaker.recordFailure();
      if (process.env.NODE_ENV === "development") {
        try {
          const local = await this.localCache.getPage(slug);
          if (local) {
            return includeMetadata ? {
              data: local,
              metadata: {
                timestamp: Date.now(),
                expiresAt: Infinity,
                tags: []
              }
            } : local;
          }
        } catch {
        }
      }
      throw this.normalizeError(error, `Failed to fetch page '${slug}'`);
    }
  }
  async getCollection(collectionId, query = {}, options = {}) {
    const normalizedQuery = normalizeQuery(query);
    const {
      revalidate = this.defaultRevalidate,
      tags = [],
      forceRefresh = false,
      includeMetadata = false
    } = options;
    const queryString = buildQueryString(normalizedQuery);
    const cacheKey = `collection:${collectionId}:${queryString}`;
    if (!this.isServer && !forceRefresh && this.cacheStrategy === "memory") {
      const cached = this.memoryCache.get(cacheKey);
      if (cached && this.isCacheValid(cached.metadata)) {
        return includeMetadata ? cached : cached.data;
      }
    }
    if (!forceRefresh && process.env.NODE_ENV === "development") {
      try {
        const localCollection = await this.localCache.getCollection(collectionId);
        if (localCollection) {
          const result = this.applyLocalQuery(
            localCollection,
            normalizedQuery
          );
          return result;
        }
      } catch {
      }
    }
    if (this.circuitBreaker.isOpen()) {
      throw new Error("[GnApex] Circuit open. API is unavailable.");
    }
    try {
      await this.rateLimiter.checkLimit();
      const result = await this.backoff.execute(async () => {
        return this.fetchCollection(
          collectionId,
          normalizedQuery,
          cacheKey,
          tags,
          revalidate,
          forceRefresh
        );
      });
      this.circuitBreaker.recordSuccess();
      return includeMetadata ? result : result.data;
    } catch (error) {
      this.circuitBreaker.recordFailure();
      if (process.env.NODE_ENV === "development") {
        try {
          const localCollection = await this.localCache.getCollection(collectionId);
          if (localCollection) {
            return this.applyLocalQuery(
              localCollection,
              normalizedQuery
            );
          }
        } catch {
        }
      }
      throw this.normalizeError(
        error,
        `Failed to fetch collection '${collectionId}'`
      );
    }
  }
  async getGlobals(options = {}) {
    const {
      include = [],
      revalidate = this.defaultRevalidate,
      forceRefresh = false
    } = options;
    const cacheKey = `globals:${include.join(",")}`;
    if (!this.isServer && !forceRefresh && this.cacheStrategy === "memory") {
      const cached = this.memoryCache.get(cacheKey);
      if (cached && this.isCacheValid(cached.metadata)) {
        return cached.data;
      }
    }
    if (!forceRefresh && process.env.NODE_ENV === "development") {
      try {
        const localGlobals = await this.localCache.getGlobals();
        if (localGlobals) {
          return localGlobals;
        }
      } catch {
      }
    }
    try {
      await this.rateLimiter.checkLimit();
      const url = `${this.config.apiUrl}/content/${this.config.projectId}/globals`;
      const params = include.length > 0 ? `?include=${include.join(",")}` : "";
      const fetchTags = [
        CacheTags.project(this.config.projectId),
        CacheTags.global,
        ...options.tags || []
      ];
      const res = await this.fetchWithTimeout(`${url}${params}`, {
        method: "GET",
        headers: this.getHeaders(),
        tags: fetchTags,
        revalidate,
        forceRefresh
      });
      if (!res.ok) {
        throw new Error(`API Error ${res.status}: ${res.statusText}`);
      }
      const json = await res.json();
      const data = json.data || json;
      if (!this.isServer) {
        this.writeCache(cacheKey, data, {
          revalidate,
          tags: fetchTags
        });
      }
      return data;
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        try {
          const localGlobals = await this.localCache.getGlobals();
          if (localGlobals) {
            return localGlobals;
          }
        } catch {
        }
      }
      throw this.normalizeError(error, "Failed to fetch globals");
    }
  }
  async getItem(collectionId, itemId, options = {}) {
    const { forceRefresh = false } = options;
    const cacheKey = `item:${collectionId}:${itemId}`;
    if (!this.isServer && !forceRefresh && this.cacheStrategy === "memory") {
      const cached = this.memoryCache.get(cacheKey);
      if (cached && this.isCacheValid(cached.metadata)) {
        return cached.data;
      }
    }
    return this.requestBatcher.schedule(
      forceRefresh ? `${cacheKey}:refresh:${Date.now()}` : cacheKey,
      async () => {
        const params = new URLSearchParams();
        if (options.include?.length) {
          params.append("include", options.include.join(","));
        }
        const url = `${this.config.apiUrl}/content/${this.config.projectId}/collection/${collectionId}/${itemId}?${params}`;
        const fetchTags = [
          CacheTags.project(this.config.projectId),
          CacheTags.collection(collectionId),
          `item_${itemId}`,
          ...options.tags || []
        ];
        const res = await this.fetchWithTimeout(url, {
          method: "GET",
          headers: this.getHeaders(),
          tags: fetchTags,
          revalidate: options.revalidate ?? this.defaultRevalidate,
          forceRefresh
        });
        if (!res.ok) {
          throw new Error(`API Error ${res.status}: ${res.statusText}`);
        }
        const json = await res.json();
        const data = json.data || json;
        if (!this.isServer) {
          this.writeCache(cacheKey, data, {
            revalidate: options.revalidate ?? this.defaultRevalidate,
            tags: fetchTags
          });
        }
        return data;
      }
    );
  }
  async search(query, options = {}) {
    const params = new URLSearchParams({
      q: query,
      limit: (options.limit || 20).toString()
    });
    if (options.collections?.length) {
      params.append("collections", options.collections.join(","));
    }
    if (options.fields?.length) {
      params.append("fields", options.fields.join(","));
    }
    const url = `${this.config.apiUrl}/content/${this.config.projectId}/search?${params}`;
    const fetchTags = [
      CacheTags.project(this.config.projectId),
      ...(options.collections || []).map(
        (collection) => CacheTags.collection(collection)
      )
    ];
    const res = await this.fetchWithTimeout(url, {
      method: "GET",
      headers: this.getHeaders(),
      tags: fetchTags,
      revalidate: options.revalidate ?? this.defaultRevalidate,
      forceRefresh: options.forceRefresh ?? false
    });
    if (!res.ok) {
      throw new Error(`API Error ${res.status}: ${res.statusText}`);
    }
    return await res.json();
  }
  async prefetch(urls) {
    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      requestIdleCallback(async () => {
        await Promise.allSettled(
          urls.map(
            (url) => fetch(url, {
              priority: "low"
            })
          )
        );
      });
    }
  }
  subscribeToUpdates(callback) {
    if (this.isServer || typeof EventSource === "undefined") {
      return () => {
      };
    }
    if (!this.config.apiKey) {
      return () => {
      };
    }
    let eventSource = null;
    let retryCount = 0;
    let isClosed = false;
    const connect = () => {
      if (isClosed) return;
      const url = `${this.config.apiUrl}/content/${this.config.projectId}/updates?key=${this.config.apiKey ?? ""}`;
      eventSource = new EventSource(url);
      eventSource.onopen = () => {
        retryCount = 0;
      };
      eventSource.onmessage = (event) => {
        let data;
        try {
          data = JSON.parse(event.data);
        } catch {
          return;
        }
        if (!data || typeof data.type !== "string") {
          return;
        }
        if (data.type === "content.updated" && data.slug) {
          this.invalidateCache([CacheTags.content(data.slug)]);
        }
        if (data.type === "collection.updated" && data.collectionId) {
          this.invalidateCache([CacheTags.collection(data.collectionId)]);
        }
        if (data.type === "globals.updated") {
          this.invalidateCache([CacheTags.global]);
        }
        if (data.type === "schema.updated") {
          this.clearCache();
        }
        callback(data);
      };
      eventSource.onerror = () => {
        eventSource?.close();
        if (isClosed) return;
        const timeout = Math.min(1e3 * Math.pow(2, retryCount), 3e4);
        retryCount++;
        setTimeout(connect, timeout);
      };
    };
    connect();
    return () => {
      isClosed = true;
      eventSource?.close();
    };
  }
  writeCache(key, data, options) {
    const ttlSeconds = options.revalidate === false ? 60 : Math.max(1, options.revalidate);
    if (this.cacheStrategy === "memory") {
      this.memoryCache.set(key, data, {
        tags: options.tags,
        ttl: ttlSeconds * 1e3
      });
    }
  }
  invalidateCache(tags) {
    this.memoryCache.invalidateByTags(tags);
    if (this.browserCache) {
      this.browserCache.clear();
    }
  }
  clearCache() {
    this.memoryCache.clear();
    if (this.browserCache) {
      this.browserCache.clear();
    }
  }
  getCacheStats() {
    return {
      memory: this.memoryCache.getStats(),
      local: {
        loaded: this.localCache.isLoaded()
      }
    };
  }
  async fetchPage(slug, cacheKey, tags, revalidate, forceRefresh) {
    const url = `${this.config.apiUrl}/content/${this.config.projectId}/page/${slug}`;
    const fetchTags = [
      CacheTags.project(this.config.projectId),
      CacheTags.content(slug),
      ...tags
    ];
    const res = await this.fetchWithTimeout(url, {
      method: "GET",
      headers: this.getHeaders(),
      tags: fetchTags,
      revalidate,
      forceRefresh
    });
    if (!res.ok) {
      if (res.status === 404) {
        throw new Error(`Page '${slug}' not found.`);
      }
      if (res.status === 408) {
        throw new Error("Request timeout");
      }
      throw new Error(`API Error ${res.status}: ${res.statusText}`);
    }
    const json = await res.json();
    const etag = res.headers.get("etag");
    const cacheEntry = {
      data: json.data,
      metadata: {
        timestamp: Date.now(),
        etag: etag || void 0,
        expiresAt: revalidate === false ? Infinity : Date.now() + revalidate * 1e3,
        tags: fetchTags
      }
    };
    if (!this.isServer) {
      this.writeCache(cacheKey, cacheEntry.data, {
        revalidate,
        tags: fetchTags
      });
    }
    return cacheEntry;
  }
  async fetchCollection(collectionId, query, cacheKey, tags, revalidate, forceRefresh) {
    const params = buildQueryString(query);
    const url = `${this.config.apiUrl}/content/${this.config.projectId}/collection/${collectionId}?${params}`;
    const fetchTags = [
      CacheTags.project(this.config.projectId),
      CacheTags.collection(collectionId),
      ...tags
    ];
    const res = await this.fetchWithTimeout(url, {
      method: "GET",
      headers: this.getHeaders(),
      tags: fetchTags,
      revalidate,
      forceRefresh
    });
    if (!res.ok) {
      if (res.status === 408) {
        throw new Error("Request timeout");
      }
      throw new Error(`API Error ${res.status}: ${res.statusText}`);
    }
    const json = await res.json();
    const etag = res.headers.get("etag");
    const cacheEntry = {
      data: json,
      metadata: {
        timestamp: Date.now(),
        etag: etag || void 0,
        expiresAt: revalidate === false ? Infinity : Date.now() + revalidate * 1e3,
        tags: fetchTags
      }
    };
    if (!this.isServer) {
      this.writeCache(cacheKey, cacheEntry.data, {
        revalidate,
        tags: fetchTags
      });
    }
    return cacheEntry;
  }
  applyLocalQuery(items, query) {
    let filtered = [...items];
    if (query.search) {
      const searchLower = query.search.toLowerCase();
      filtered = filtered.filter(
        (item) => JSON.stringify(item).toLowerCase().includes(searchLower)
      );
    }
    if (query.filter) {
      filtered = filtered.filter((item) => {
        return Object.entries(query.filter).every(([key, value]) => {
          const itemValue = item[key];
          if (itemValue === void 0) {
            return false;
          }
          if (Array.isArray(value)) {
            return value.includes(itemValue);
          }
          return itemValue === value;
        });
      });
    }
    if (query.sort) {
      filtered.sort((a, b) => {
        const aVal = a[query.sort];
        const bVal = b[query.sort];
        const order = query.order === "asc" ? 1 : -1;
        if (aVal < bVal) {
          return -1 * order;
        }
        if (aVal > bVal) {
          return 1 * order;
        }
        return 0;
      });
    }
    const page = query.page || 1;
    const limit = query.limit || 10;
    const start = (page - 1) * limit;
    const end = start + limit;
    const total = filtered.length;
    return {
      items: filtered.slice(start, end),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNext: end < total,
      hasPrev: start > 0
    };
  }
  async fetchWithTimeout(url, options = {}) {
    const {
      timeout = this.config.timeout || 1e4,
      tags = [],
      revalidate,
      forceRefresh = false,
      ...fetchOptions
    } = options;
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    const nextConfig = this.isServer ? {
      cache: forceRefresh || revalidate === 0 ? "no-store" : "force-cache",
      ...forceRefresh ? {} : {
        next: {
          tags,
          revalidate: revalidate === false ? false : revalidate
        }
      }
    } : {};
    try {
      const response = await fetch(url, {
        ...fetchOptions,
        ...nextConfig,
        signal: controller.signal
      });
      clearTimeout(id);
      return response;
    } catch (error) {
      clearTimeout(id);
      throw error;
    }
  }
  getHeaders() {
    const headers = {
      "Content-Type": "application/json",
      "X-GN-Apex-Client": `gnapex-sdk/${this.config.sdkVersion ?? "1.1.6"}`,
      "X-GN-Apex-Request-ID": typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `nx_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      "X-GN-Apex-Project": this.config.projectId
    };
    if (this.config.apiKey) {
      headers["Authorization"] = `Bearer ${this.config.apiKey}`;
    }
    return headers;
  }
  isCacheValid(metadata) {
    return Date.now() < metadata.expiresAt;
  }
  normalizeError(error, context) {
    if (error instanceof Error) {
      const msg = error.message.toLowerCase();
      if (error.name === "AbortError" || error.message.includes("408") || msg.includes("timeout") || msg.includes("aborted")) {
        return new Error(`${context}: Request timeout`);
      }
      return error;
    }
    const str = String(error).toLowerCase();
    if (str.includes("408") || str.includes("timeout") || str.includes("aborted")) {
      return new Error(`${context}: Request timeout`);
    }
    return new Error(`${context}: ${String(error)}`);
  }
  cleanup() {
    if (!this.isServer) {
      window.removeEventListener("beforeunload", this.cleanup.bind(this));
    }
  }
};

// src/analytics/fingerprint.ts
var cachedEntropy = null;
var getDeviceEntropy = async (allowFingerprinting = true) => {
  if (cachedEntropy) return cachedEntropy;
  if (typeof window === "undefined") return {};
  const nav = window.navigator;
  cachedEntropy = {
    screen_resolution: `${window.screen.width}x${window.screen.height}`,
    color_depth: window.screen.colorDepth,
    pixel_ratio: window.devicePixelRatio || 1,
    hardware_concurrency: nav.hardwareConcurrency,
    device_memory: nav.deviceMemory,
    // Chrome/Edge only
    timezone_offset: (/* @__PURE__ */ new Date()).getTimezoneOffset(),
    platform: nav.platform,
    language: nav.language,
    touch_support: "ontouchstart" in window || nav.maxTouchPoints > 0,
    canvas_hash: allowFingerprinting ? await generateCanvasHash() : void 0
  };
  return cachedEntropy;
};
var generateCanvasHash = async () => {
  try {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return "";
    canvas.width = 200;
    canvas.height = 50;
    ctx.textBaseline = "top";
    ctx.font = '16px "Arial"';
    ctx.fillStyle = "#f60";
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = "#069";
    ctx.fillText("GnApex Rocks! <canvas> 1.0", 2, 15);
    ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
    ctx.fillText("GnApex Rocks! <canvas> 1.0", 4, 17);
    const dataUrl = canvas.toDataURL();
    let hash = 0;
    for (let i = 0; i < dataUrl.length; i++) {
      const char = dataUrl.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return hash.toString(16);
  } catch {
    return "";
  }
};
var getVisitorId = async (allowFingerprinting = true) => {
  if (typeof window === "undefined") return "server_visitor";
  const STORAGE_KEY = "nexus_vid";
  let vid = localStorage.getItem(STORAGE_KEY);
  if (!vid) {
    const entropy = await getDeviceEntropy(allowFingerprinting);
    const random = Math.random().toString(36).substring(2, 15);
    const timestamp = Date.now().toString(36);
    const fingerprint = [
      entropy.screen_resolution,
      entropy.hardware_concurrency,
      entropy.timezone_offset,
      entropy.platform,
      entropy.canvas_hash || "standard_entropy"
    ].join("|");
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
      hash = (hash << 5) - hash + fingerprint.charCodeAt(i);
      hash |= 0;
    }
    vid = `vis_${hash.toString(16)}_${timestamp}_${random}`;
    localStorage.setItem(STORAGE_KEY, vid);
  }
  return vid;
};

// src/analytics/vitals.ts
import { onCLS, onLCP, onTTFB, onINP, onFCP } from "web-vitals";
var METRIC_KEY_MAP = {
  CLS: "cls",
  LCP: "lcp",
  INP: "inp",
  TTFB: "ttfb",
  FCP: "fcp"
};
var VitalsCollector = class {
  constructor() {
    this.metrics = {};
    this.hasUpdates = false;
    if (typeof window !== "undefined") {
      this.init();
    }
  }
  init() {
    const recordMetric = (metric) => {
      const key = METRIC_KEY_MAP[metric.name];
      this.metrics[key] = metric.value;
      this.hasUpdates = true;
    };
    onCLS(recordMetric);
    onLCP(recordMetric);
    onTTFB(recordMetric);
    onINP(recordMetric);
    onFCP(recordMetric);
    const navEntry = performance.getEntriesByType("navigation")[0];
    if (navEntry) {
      this.metrics.navigation_timing = {
        dns_lookup: navEntry.domainLookupEnd - navEntry.domainLookupStart,
        tcp_connect: navEntry.connectEnd - navEntry.connectStart,
        request_time: navEntry.responseEnd - navEntry.requestStart,
        dom_load: navEntry.domComplete - navEntry.domInteractive,
        domain_lookup_start: navEntry.domainLookupStart,
        domain_lookup_end: navEntry.domainLookupEnd,
        connect_start: navEntry.connectStart,
        connect_end: navEntry.connectEnd,
        secure_connection_start: navEntry.secureConnectionStart > 0 ? navEntry.secureConnectionStart : void 0
      };
      this.hasUpdates = true;
    }
    const resourceEntries = performance.getEntriesByType(
      "resource"
    );
    if (resourceEntries.length > 0) {
      this.metrics.resources = resourceEntries.filter(
        (r) => !r.name.includes("/api/collect") && !r.name.includes("/analytics") && !r.name.includes("sentry.gnapex.com")
      ).sort((a, b) => b.duration - a.duration).slice(0, 5).map((r) => ({
        name: r.name.length > 120 ? r.name.substring(0, 120) + "..." : r.name,
        initiatorType: r.initiatorType,
        duration: Math.round(r.duration),
        transferSize: r.transferSize > 0 ? r.transferSize : void 0,
        encodedBodySize: r.encodedBodySize > 0 ? r.encodedBodySize : void 0,
        decodedBodySize: r.decodedBodySize > 0 ? r.decodedBodySize : void 0,
        startTime: Math.round(r.startTime),
        responseEnd: Math.round(r.responseEnd)
      }));
      this.hasUpdates = true;
    }
    const mem = performance.memory;
    if (mem) {
      this.metrics.memory_usage = {
        used_js_heap_size: mem.usedJSHeapSize,
        total_js_heap_size: mem.totalJSHeapSize,
        js_heap_size_limit: mem.jsHeapSizeLimit
      };
      this.hasUpdates = true;
    }
  }
  getMetricsSnapshot() {
    if (!this.hasUpdates) return null;
    this.hasUpdates = false;
    const snapshot = { ...this.metrics };
    this.metrics.resources = void 0;
    return snapshot;
  }
};
var vitalsCollector = new VitalsCollector();
var initVitals = (_tracker) => {
  if (process.env.NODE_ENV === "development") {
    console.log("[GN-Apex] Web Vitals monitoring active");
  }
};

// src/analytics/storage.ts
var DB_NAME = "GnApex_Analytics";
var STORE_NAME = "events_queue";
var DB_VERSION = 2;
var MAX_QUEUE_SIZE = 500;
var EventStorage = class {
  constructor() {
    this.db = null;
    this.isReady = this.init();
  }
  init() {
    if (typeof window === "undefined" || !window.indexedDB) {
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onerror = () => {
        console.warn(
          "[GnApex] Failed to open IndexedDB. Falling back to memory."
        );
        resolve();
      };
      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve();
      };
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (db.objectStoreNames.contains(STORE_NAME)) {
          db.deleteObjectStore(STORE_NAME);
        }
        db.createObjectStore(STORE_NAME, {
          keyPath: "id",
          autoIncrement: true
        });
      };
    });
  }
  /**
   * Add an event to the persistent queue.
   * Evicts the oldest entry if the queue is already at MAX_QUEUE_SIZE.
   */
  async enqueue(payload) {
    await this.isReady;
    if (!this.db) return;
    const currentCount = await this.count();
    if (currentCount >= MAX_QUEUE_SIZE) {
      const oldest = await this.peek(1);
      if (oldest.length > 0 && oldest[0].id !== void 0) {
        await this.remove([oldest[0].id]);
      }
    }
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.add({
        payload,
        timestamp: Date.now(),
        retryCount: 0
      });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
  /**
   * Get a batch of the oldest events without removing them.
   */
  async peek(limit = 20) {
    await this.isReady;
    if (!this.db) return [];
    return new Promise((resolve) => {
      const transaction = this.db.transaction([STORE_NAME], "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll(null, limit);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve([]);
    });
  }
  /**
   * Remove events by ID after a successful upload.
   */
  async remove(ids) {
    await this.isReady;
    if (!this.db || ids.length === 0) return;
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(new Error("Delete transaction aborted"));
      ids.forEach((id) => {
        store.delete(id);
      });
    });
  }
  /**
   * Count pending events in the queue.
   */
  async count() {
    await this.isReady;
    if (!this.db) return 0;
    return new Promise((resolve) => {
      const transaction = this.db.transaction([STORE_NAME], "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.count();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(0);
    });
  }
};
var eventStorage = new EventStorage();

// src/analytics/tracker.ts
var safeGetItem = (key) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};
var safeSetItem = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch {
  }
};
var safeRemoveItem = (key) => {
  try {
    localStorage.removeItem(key);
  } catch {
  }
};
var generateUUID = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === "x" ? r : r & 3 | 8;
    return v.toString(16);
  });
};
var Tracker = class {
  constructor(config) {
    this.sessionId = "";
    this.visitorId = "";
    this.anonymousId = "";
    this.isFlushing = false;
    this.flushPromise = null;
    // 🛡️ Batch size set to 10 to keep payloads strictly under Actix 32KB limit
    this.batchSize = 10;
    this.config = config;
    this.endpoint = `${this.config.analyticsUrl}/api/collect`;
    this.circuitBreaker = new CircuitBreaker();
    this.sessionStart = Date.now();
    if (typeof window !== "undefined") {
      this.initSession();
      this.startFlushing();
    }
  }
  async initSession() {
    this.visitorId = await getVisitorId(
      this.config.privacy?.fingerprinting ?? true
    );
    let anonId = safeGetItem("nexus_anon_id");
    if (!anonId) {
      anonId = `anon_${generateUUID().replace(/-/g, "")}`;
      safeSetItem("nexus_anon_id", anonId);
    }
    this.anonymousId = anonId;
    let sid = safeGetItem("nexus_sid");
    const lastActivity = safeGetItem("nexus_last_active");
    const now = Date.now();
    const SESSION_TIMEOUT = 30 * 60 * 1e3;
    const isExpired = !sid || !lastActivity || now - parseInt(lastActivity, 10) > SESSION_TIMEOUT;
    if (isExpired) {
      const uuid2 = generateUUID().replace(/-/g, "").substring(0, 16);
      sid = `sess_${uuid2}_${now}`;
      safeSetItem("nexus_sid", sid);
      this.sessionStart = now;
    }
    safeSetItem("nexus_last_active", now.toString());
    this.sessionId = sid;
  }
  async send(eventType, data = {}, eventName, ecommerce) {
    if (typeof window === "undefined") return;
    safeSetItem("nexus_last_active", Date.now().toString());
    const entropy = await getDeviceEntropy(
      this.config.privacy?.fingerprinting ?? true
    );
    const isPageView = eventType === "page_view" || eventType === "performance";
    const perfMetrics = isPageView ? vitalsCollector.getMetricsSnapshot() : void 0;
    const utmParams = isPageView ? extractUtmParams(window.location.href) : void 0;
    const payload = {
      projectId: this.config.projectId,
      sessionId: this.sessionId,
      visitorId: this.visitorId,
      anonymousId: this.anonymousId,
      messageId: generateUUID(),
      sentAt: (/* @__PURE__ */ new Date()).toISOString(),
      version: SDK_VERSION,
      url: window.location.href,
      referrer: isPageView ? document.referrer : void 0,
      userAgent: isPageView ? window.navigator.userAgent : void 0,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      language: window.navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      eventType,
      eventName,
      eventData: data,
      ecommerce: ecommerce ?? void 0,
      performance: perfMetrics || void 0,
      context: {
        device: {
          hardwareConcurrency: entropy.hardware_concurrency,
          deviceMemory: entropy.device_memory,
          pixelRatio: entropy.pixel_ratio,
          platform: entropy.platform,
          ...this.config.privacy?.fingerprinting ? { canvasFingerprint: entropy.canvas_hash } : {}
        },
        visitorIdLocal: this.visitorId,
        utm: utmParams
      },
      clientTimestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
    await eventStorage.enqueue(payload);
    const count = await eventStorage.count();
    if (count >= 10 || eventType === "purchase" || eventType === "identify") {
      this.flushQueue();
    }
  }
  startFlushing() {
    this.flushInterval = setInterval(() => this.flushQueue(), 5e3);
    window.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") this.flushQueue(true);
    });
  }
  async flushQueue(useBeacon = false) {
    if (this.flushPromise) return this.flushPromise;
    this.flushPromise = (async () => {
      if (this.circuitBreaker.isOpen()) return;
      try {
        const storedEvents = await eventStorage.peek(this.batchSize);
        if (!storedEvents.length) return;
        const payloads = storedEvents.map((e) => e.payload);
        const headers = {
          "Content-Type": "application/json",
          Authorization: this.config.apiKey ? `Bearer ${this.config.apiKey}` : "",
          "X-Nexus-Client": `analytics/${SDK_VERSION}`,
          "X-Nexus-Project": this.config.projectId
        };
        let response;
        try {
          response = await fetch(
            `${this.config.analyticsUrl}/api/collect/batch`,
            {
              method: "POST",
              headers,
              body: JSON.stringify({ events: payloads }),
              keepalive: useBeacon
            }
          );
        } catch {
          response = void 0;
        }
        if (response && response.status === 413) {
          await eventStorage.remove(storedEvents.map((e) => e.id));
          return;
        }
        if (!response || response.status === 404 || response.status === 405) {
          const results = await Promise.allSettled(
            payloads.map(
              (event) => fetch(this.endpoint, {
                method: "POST",
                headers,
                body: JSON.stringify(event),
                keepalive: useBeacon
              })
            )
          );
          const successIds = results.flatMap(
            (r, i) => r.status === "fulfilled" && (r.value.ok || r.value.status === 413) ? [storedEvents[i].id] : []
          );
          if (successIds.length) await eventStorage.remove(successIds);
          if (successIds.length === storedEvents.length) {
            this.circuitBreaker.recordSuccess();
          } else {
            this.circuitBreaker.recordFailure();
          }
        } else if (response.ok) {
          await eventStorage.remove(storedEvents.map((e) => e.id));
          this.circuitBreaker.recordSuccess();
        } else {
          this.circuitBreaker.recordFailure();
        }
      } catch (err) {
        this.circuitBreaker.recordFailure();
        if (this.config.debug) {
          console.warn("[GN-Apex] Analytics flush deferred:", err);
        }
      } finally {
        this.flushPromise = null;
      }
    })();
    return this.flushPromise;
  }
  getSession() {
    return this.sessionId;
  }
  getVisitorId() {
    return this.visitorId;
  }
  getAnonymousId() {
    return this.anonymousId;
  }
  getSessionDuration() {
    return Date.now() - this.sessionStart;
  }
  clearIdentity() {
    safeRemoveItem("nexus_anon_id");
    this.anonymousId = "";
  }
  stop() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    this.flushQueue(true);
  }
};
function extractUtmParams(url) {
  try {
    const params = new URL(url).searchParams;
    const utmKeys = [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_term",
      "utm_content"
    ];
    const result = {};
    utmKeys.forEach((key) => {
      const val = params.get(key);
      if (val) result[key] = val;
    });
    return result;
  } catch {
    return {};
  }
}

// src/analytics/index.ts
var safeRemoveItem2 = (key) => {
  try {
    localStorage.removeItem(key);
  } catch {
  }
};
var AnalyticsEngine = class {
  constructor(config) {
    this.cleanupFns = [];
    this.isInitialized = false;
    this.maxScrollDepth = 0;
    this.scrollThresholdsFired = /* @__PURE__ */ new Set();
    this.lastPath = typeof window !== "undefined" ? window.location.pathname : "";
    this.clickBuffer = [];
    this.tracker = new Tracker(config);
  }
  start() {
    if (this.isInitialized || typeof window === "undefined") return;
    this.isInitialized = true;
    this.pageView();
    initVitals(this.tracker);
    this.setupClickTracking();
    this.setupFormTracking();
    this.setupRouteTracking();
    this.setupShareTracking();
    this.setupScrollTracking();
    this.setupOutboundTracking();
    this.setupVideoTracking();
    this.setupErrorTracking();
    if (process.env.NODE_ENV === "development") {
      console.log("[GnApex] \u{1F680} Analytics Engine Started");
    }
  }
  pageView(customReferrer) {
    if (typeof window === "undefined") return;
    const currentPath = window.location.pathname;
    this.maxScrollDepth = 0;
    this.scrollThresholdsFired.clear();
    this.tracker.send("page_view", {
      path: currentPath,
      search: window.location.search,
      title: document.title,
      timezone_offset: (/* @__PURE__ */ new Date()).getTimezoneOffset(),
      referrer: customReferrer || (this.lastPath !== currentPath ? this.lastPath : document.referrer)
    });
    this.lastPath = currentPath;
  }
  setupShareTracking() {
    if (typeof window === "undefined") return;
    const copyHandler = () => {
      this.tracker.send("social_share", {
        method: "clipboard_copy",
        url: window.location.href
      });
    };
    window.addEventListener("copy", copyHandler, { passive: true });
    this.cleanupFns.push(() => window.removeEventListener("copy", copyHandler));
    if (typeof navigator !== "undefined" && navigator.share) {
      const originalShare = navigator.share.bind(navigator);
      navigator.share = (data) => {
        this.tracker.send("social_share", {
          method: "native_share_menu",
          url: data?.url || window.location.href,
          title: data?.title
        });
        return originalShare(data);
      };
      this.cleanupFns.push(() => {
        navigator.share = originalShare;
      });
    }
  }
  setupScrollTracking() {
    if (typeof window === "undefined") return;
    const THRESHOLDS = [25, 50, 75, 100];
    const scrollHandler = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (docHeight <= 0) return;
      const pct = Math.round(scrollTop / docHeight * 100);
      if (pct > this.maxScrollDepth) {
        this.maxScrollDepth = pct;
      }
      clearTimeout(this.scrollTimer);
      this.scrollTimer = setTimeout(() => {
        for (const threshold of THRESHOLDS) {
          if (this.maxScrollDepth >= threshold && !this.scrollThresholdsFired.has(threshold)) {
            this.scrollThresholdsFired.add(threshold);
            this.tracker.send("scroll", {
              depth: threshold / 100,
              depth_percent: threshold,
              path: window.location.pathname
            });
          }
        }
      }, 300);
    };
    window.addEventListener("scroll", scrollHandler, { passive: true });
    this.cleanupFns.push(() => {
      window.removeEventListener("scroll", scrollHandler);
      clearTimeout(this.scrollTimer);
    });
  }
  setupClickTracking() {
    if (typeof window === "undefined") return;
    const clickHandler = (e) => {
      const target = e.target;
      const link = target.closest("a");
      if (link) {
        this.tracker.send("click", {
          element_type: "link",
          href: link.href,
          text: link.innerText?.substring(0, 50),
          id: link.id,
          classes: link.className,
          dataset: { ...link.dataset },
          coordinates: { x: e.clientX, y: e.clientY }
        });
      }
      const button = target.closest("button");
      if (button) {
        this.tracker.send("click", {
          element_type: "button",
          text: button.innerText?.substring(0, 50),
          id: button.id,
          classes: button.className,
          coordinates: { x: e.clientX, y: e.clientY }
        });
      }
      const now = Date.now();
      const ZONE = 400;
      const WINDOW_MS = 1e3;
      const RAGE_THRESHOLD = 3;
      this.clickBuffer.push({ x: e.clientX, y: e.clientY, t: now });
      this.clickBuffer = this.clickBuffer.filter((c) => now - c.t < WINDOW_MS);
      const zone = {
        x: Math.floor(e.clientX / ZONE),
        y: Math.floor(e.clientY / ZONE)
      };
      const zoneClicks = this.clickBuffer.filter(
        (c) => Math.floor(c.x / ZONE) === zone.x && Math.floor(c.y / ZONE) === zone.y
      );
      if (zoneClicks.length >= RAGE_THRESHOLD) {
        this.tracker.send(
          "click",
          {
            element_type: target.tagName.toLowerCase(),
            event_name: "rage_click",
            coordinates: { x: e.clientX, y: e.clientY },
            click_count: zoneClicks.length,
            path: window.location.pathname
          },
          "rage_click"
        );
        this.clickBuffer = [];
      }
      const isInteractive = target.closest(
        "a, button, input, select, textarea, [onclick], [role='button']"
      );
      if (!isInteractive) {
        const pathBefore = window.location.pathname;
        setTimeout(() => {
          const pathAfter = window.location.pathname;
          if (pathBefore === pathAfter) {
            this.tracker.send(
              "click",
              {
                element_type: target.tagName.toLowerCase(),
                event_name: "dead_click",
                selector: getSelector(target),
                coordinates: { x: e.clientX, y: e.clientY },
                path: window.location.pathname
              },
              "dead_click"
            );
          }
        }, 300);
      }
    };
    window.addEventListener("click", clickHandler, { passive: true });
    this.cleanupFns.push(
      () => window.removeEventListener("click", clickHandler)
    );
  }
  setupFormTracking() {
    if (typeof document === "undefined") return;
    const submitHandler = (e) => {
      const form = e.target;
      if (form) {
        this.tracker.send("form_submit", {
          form_id: form.id || form.name || "unknown_form",
          action: form.action,
          method: form.method,
          field_count: form.elements.length
        });
      }
    };
    document.addEventListener("submit", submitHandler, { passive: true });
    this.cleanupFns.push(
      () => document.removeEventListener("submit", submitHandler)
    );
  }
  setupOutboundTracking() {
    if (typeof window === "undefined") return;
    const outboundHandler = (e) => {
      const link = e.target.closest("a");
      if (!link || !link.href) return;
      try {
        const linkHost = new URL(link.href).hostname;
        if (linkHost && linkHost !== window.location.hostname) {
          this.tracker.send(
            "click",
            {
              event_name: "outbound_click",
              href: link.href,
              text: link.innerText?.substring(0, 50),
              destination_host: linkHost,
              coordinates: { x: e.clientX, y: e.clientY }
            },
            "outbound_click"
          );
        }
      } catch {
      }
    };
    window.addEventListener("click", outboundHandler, { passive: true });
    this.cleanupFns.push(
      () => window.removeEventListener("click", outboundHandler)
    );
  }
  setupVideoTracking() {
    if (typeof document === "undefined") return;
    const attach = (video) => {
      const v = video;
      if (v.__gnexusTracked) return;
      v.__gnexusTracked = true;
      v.__gnexusMilestones = /* @__PURE__ */ new Set();
      const src = () => video.currentSrc || video.src || "unknown";
      const emit = (name, data = {}) => this.tracker.send("media", { media_type: "video", event_name: name, src: src(), ...data }, name);
      video.addEventListener("loadedmetadata", () => emit("video_loaded", { duration_seconds: Number.isFinite(video.duration) ? Math.round(video.duration) : void 0 }));
      video.addEventListener("play", () => emit("video_play", { position_seconds: Math.round(video.currentTime) }));
      video.addEventListener("pause", () => emit("video_pause", { position_seconds: Math.round(video.currentTime) }));
      video.addEventListener("seeking", () => emit("video_seek", { position_seconds: Math.round(video.currentTime) }));
      video.addEventListener("ended", () => emit("video_complete", { duration_seconds: Math.round(video.duration) }));
      video.addEventListener("error", () => emit("video_error"));
      video.addEventListener("timeupdate", () => {
        if (!Number.isFinite(video.duration) || video.duration <= 0) return;
        for (const milestone of [25, 50, 75, 90, 100]) {
          if (video.currentTime / video.duration * 100 >= milestone && !v.__gnexusMilestones.has(milestone)) {
            v.__gnexusMilestones.add(milestone);
            emit(`video_${milestone}_percent`, { progress: milestone / 100 });
          }
        }
      });
    };
    document.querySelectorAll("video").forEach((v) => attach(v));
    const observer = new MutationObserver((ms) => ms.forEach((m) => m.addedNodes.forEach((n) => {
      if (n instanceof HTMLVideoElement) attach(n);
      if (n instanceof Element) n.querySelectorAll("video").forEach((v) => attach(v));
    })));
    if (document.body) observer.observe(document.body, { childList: true, subtree: true });
    this.cleanupFns.push(() => observer.disconnect());
  }
  setupErrorTracking() {
    if (typeof window === "undefined") return;
    const errorHandler = (e) => {
      this.tracker.send("error", {
        message: e.message,
        filename: e.filename,
        lineno: e.lineno,
        colno: e.colno,
        stack: e.error?.stack,
        url: window.location.href,
        type: "uncaught_error"
      });
    };
    const rejectionHandler = (e) => {
      const reason = e.reason instanceof Error ? e.reason.message : String(e.reason);
      const stack = e.reason instanceof Error ? e.reason.stack : void 0;
      this.tracker.send("error", {
        message: reason,
        stack,
        url: window.location.href,
        type: "unhandled_rejection"
      });
    };
    window.addEventListener("error", errorHandler);
    window.addEventListener("unhandledrejection", rejectionHandler);
    this.cleanupFns.push(() => {
      window.removeEventListener("error", errorHandler);
      window.removeEventListener("unhandledrejection", rejectionHandler);
    });
  }
  setupRouteTracking() {
    if (typeof window === "undefined" || typeof window.history === "undefined")
      return;
    const originalPushState = history.pushState.bind(history);
    const originalReplaceState = history.replaceState.bind(history);
    history.pushState = (...args) => {
      const prevPath = window.location.pathname;
      originalPushState(...args);
      if (!this.isInitializedByReactProvider()) {
        this.pageView(prevPath);
      }
    };
    history.replaceState = (...args) => {
      originalReplaceState(...args);
    };
    const popStateHandler = () => {
      if (!this.isInitializedByReactProvider()) {
        this.pageView();
      }
    };
    window.addEventListener("popstate", popStateHandler);
    this.cleanupFns.push(() => {
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
      window.removeEventListener("popstate", popStateHandler);
    });
  }
  isInitializedByReactProvider() {
    return !!document.getElementById("__nexus_react_active");
  }
  async identify(userId, traits = {}) {
    return this.sendIdentityRequest("identify", { user_id: userId, traits });
  }
  async group(groupId, traits = {}) {
    return this.sendIdentityRequest("group", { group_id: groupId, traits });
  }
  async alias(newId) {
    return this.sendIdentityRequest("alias", {
      previous_id: this.tracker.getSession(),
      user_id: newId
    });
  }
  reset(performGdprScrub = false) {
    const config = this.tracker.config;
    this.tracker.stop();
    localStorage.removeItem("nexus_sid");
    localStorage.removeItem("nexus_vid");
    safeRemoveItem2("nexus_anon_id");
    this.tracker.clearIdentity();
    if (performGdprScrub) {
      const endpoint = `${config.analyticsUrl}/api/privacy/scrub`;
      const userId = this.tracker.getVisitorId();
      fetch(endpoint, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.apiKey}`
        },
        body: JSON.stringify({
          project_id: config.projectId,
          user_id: userId
        })
      }).catch((err) => console.error("[GnApex] Privacy scrub failed:", err));
    }
    window.location.reload();
  }
  track(eventName, properties = {}) {
    this.tracker.send(
      "custom_event",
      { event_name: eventName, ...properties },
      eventName
    );
  }
  trackPurchase(orderData) {
    const ecommerce = {
      orderId: orderData.orderId,
      total: orderData.total,
      revenue: orderData.revenue ?? orderData.total,
      currency: orderData.currency || "USD",
      products: orderData.products.map((p) => ({
        productId: p.id,
        sku: p.sku,
        name: p.name,
        price: p.price,
        quantity: p.quantity
      }))
    };
    this.tracker.send(
      "purchase",
      { order_id: orderData.orderId },
      "purchase",
      ecommerce
    );
  }
  trackError(error, context) {
    this.tracker.send("error", {
      message: error.message,
      stack: error.stack,
      context,
      url: typeof window !== "undefined" ? window.location.href : "",
      type: "manual"
    });
  }
  async sendIdentityRequest(type, data) {
    try {
      const config = this.tracker.config;
      const endpoint = `${config.analyticsUrl}/api/${type}`;
      const payload = {
        projectId: config.projectId,
        sessionId: this.tracker.getSession(),
        visitorId: this.tracker.getVisitorId(),
        anonymousId: this.tracker.getAnonymousId(),
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        ...data
      };
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.apiKey}`
        },
        body: JSON.stringify(payload)
      });
      return response.ok;
    } catch (error) {
      console.error(`[GnApex] ${type} failed:`, error);
      return false;
    }
  }
  getSessionId() {
    return this.tracker.getSession();
  }
  stop(isFinalShutdown = false) {
    this.cleanupFns.forEach((fn) => fn());
    this.cleanupFns = [];
    if (isFinalShutdown) {
      this.tracker.send("session_end", {
        session_id: this.tracker.getSession(),
        duration: this.tracker.getSessionDuration(),
        max_scroll_depth: this.maxScrollDepth / 100
      });
    }
    this.tracker.stop();
    this.isInitialized = false;
  }
};
function getSelector(el, depth = 0) {
  if (!el || depth > 2) return "";
  const tag = el.tagName.toLowerCase();
  const id = el.id ? `#${el.id}` : "";
  const cls = el.className && typeof el.className === "string" ? `.${el.className.trim().split(/\s+/).slice(0, 2).join(".")}` : "";
  const self = `${tag}${id}${cls}`;
  const parent = el.parentElement && depth < 2 ? `${getSelector(el.parentElement, depth + 1)} > ` : "";
  return `${parent}${self}`;
}

// src/errors.ts
var NexusError = class extends Error {
  constructor(message, code = "UNKNOWN", status, requestId, details, retryable = false, cause) {
    super(message);
    this.code = code;
    this.status = status;
    this.requestId = requestId;
    this.details = details;
    this.retryable = retryable;
    this.cause = cause;
    this.name = "NexusError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
};

// src/events.ts
var NexusEventBus = class {
  constructor() {
    this.listeners = /* @__PURE__ */ new Map();
  }
  on(event, listener) {
    const set = this.listeners.get(event) ?? /* @__PURE__ */ new Set();
    set.add(listener);
    this.listeners.set(event, set);
    return () => set.delete(listener);
  }
  emit(event, payload) {
    this.listeners.get(event)?.forEach((l) => {
      try {
        l(payload);
      } catch {
      }
    });
  }
  clear() {
    this.listeners.clear();
  }
};

// src/http.ts
var uuid = () => typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `nx_${Date.now()}_${Math.random().toString(36).slice(2)}`;
var NexusHttpClient = class {
  constructor(config, events = new NexusEventBus()) {
    this.config = config;
    this.events = events;
    this.breaker = new CircuitBreaker();
    this.limiter = new RateLimiter({
      maxRequests: config.debug ? 200 : 100,
      timeWindow: 6e4
    });
    this.backoff = new ExponentialBackoff({
      maxRetries: config.retries ?? 3,
      baseDelay: 150,
      maxDelay: 8e3,
      jitter: true
    });
  }
  updateConfig(config) {
    this.config = config;
  }
  async request(input, options = {}) {
    if (this.breaker.isOpen()) {
      throw new NexusError(
        "GN-Apex service circuit is open",
        "CIRCUIT_OPEN",
        void 0,
        void 0,
        void 0,
        true
      );
    }
    const requestId = uuid();
    const url = input;
    const started = Date.now();
    const headers = new Headers(options.headers);
    headers.set("X-Nexus-Request-ID", requestId);
    headers.set(
      "X-Nexus-Client",
      `gnexus-sdk/${this.config.sdkVersion ?? "1.1.0"}`
    );
    headers.set("X-Nexus-Project", this.config.projectId);
    if (this.config.apiKey)
      headers.set("Authorization", `Bearer ${this.config.apiKey}`);
    this.events.emit("request:start", {
      requestId,
      url,
      method: options.method ?? "GET"
    });
    try {
      await this.limiter.checkLimit();
      const response = await this.backoff.execute(async () => {
        const controller = new AbortController();
        const timeout = options.timeout ?? this.config.timeout ?? 1e4;
        const timer = setTimeout(() => controller.abort(), timeout);
        try {
          return await fetch(url, {
            ...options,
            headers,
            signal: options.signal ?? controller.signal
          });
        } catch (e) {
          if (e?.name === "AbortError") {
            throw new NexusError(
              `Request timed out after ${timeout}ms`,
              "TIMEOUT",
              void 0,
              requestId,
              void 0,
              true,
              e
            );
          }
          throw new NexusError(
            "Network request failed",
            "NETWORK_ERROR",
            void 0,
            requestId,
            void 0,
            true,
            e
          );
        } finally {
          clearTimeout(timer);
        }
      });
      if (!response.ok) {
        const retryable = response.status === 408 || response.status === 429 || response.status >= 500;
        let details;
        try {
          details = await response.clone().json();
        } catch {
        }
        const code = response.status === 404 ? "NOT_FOUND" : response.status === 429 ? "RATE_LIMITED" : "HTTP_ERROR";
        const err = new NexusError(
          `API request failed (${response.status})`,
          code,
          response.status,
          response.headers.get("x-nexus-request-id") ?? requestId,
          details,
          retryable
        );
        throw err;
      }
      this.breaker.recordSuccess();
      this.events.emit("request:end", {
        requestId,
        url,
        status: response.status,
        duration: Date.now() - started
      });
      return response;
    } catch (e) {
      if (e instanceof NexusError) {
        if (e.retryable || e.status && (e.status >= 500 || e.status === 429)) {
          this.breaker.recordFailure();
        } else {
          this.breaker.recordSuccess();
        }
      } else {
        this.breaker.recordFailure();
      }
      this.events.emit("error", { error: e });
      throw e;
    }
  }
  getStats() {
    return {
      rateLimit: this.limiter.getStats(),
      circuit: this.breaker.getState()
    };
  }
};

// src/flags.ts
var FeatureFlags = class {
  constructor(initial) {
    this.values = {};
    this.values = { ...initial };
  }
  set(values) {
    this.values = { ...this.values, ...values };
  }
  isEnabled(key, fallback = false) {
    const v = this.values[key];
    return typeof v === "boolean" ? v : fallback;
  }
  get(key, fallback) {
    return this.values[key] ?? fallback;
  }
  all() {
    return { ...this.values };
  }
};
var RemoteConfig = class {
  constructor() {
    this.values = {};
  }
  set(values) {
    this.values = { ...this.values, ...values };
  }
  get(key, fallback) {
    return this.values[key] ?? fallback;
  }
  all() {
    return { ...this.values };
  }
};

// src/diagnostics.ts
var getDiagnostics = (version, environment) => ({ version, environment, online: typeof navigator === "undefined" ? true : navigator.onLine, userAgent: typeof navigator === "undefined" ? void 0 : navigator.userAgent, memory: typeof performance !== "undefined" && "memory" in performance ? performance.memory?.usedJSHeapSize : void 0 });

// src/client.ts
var NexusClient = class {
  constructor(config = {}) {
    const full = getFullConfig(config);
    this.config = {
      debug: false,
      cacheStrategy: "memory",
      revalidateTime: false,
      timeout: 1e4,
      retries: 3,
      sdkVersion: SDK_VERSION,
      cacheInvalidation: "platform",
      environment: typeof process !== "undefined" && process.env?.NODE_ENV === "development" ? "development" : "production",
      autoTracking: true,
      publicKeyOnly: true,
      // 🚀 Default: fingerprinting: true (Active by default for high-precision analytics)
      privacy: { analytics: true, fingerprinting: true, redact: true },
      ...full,
      ...config
    };
    const errors = validateConfig(this.config);
    if (errors.length && this.config.debug) {
      console.warn("[GN-Apex] Configuration warnings:", errors);
    }
    this.events = new NexusEventBus();
    this.http = new NexusHttpClient(this.config, this.events);
    this.flags = new FeatureFlags();
    this.remoteConfig = new RemoteConfig();
    this.content = new ContentEngine(this.config);
    if (typeof window !== "undefined" && this.config.autoTracking !== false && this.config.privacy?.analytics !== false) {
      this.analytics = new AnalyticsEngine(this.config);
      this.analytics.start();
    }
  }
  /**
   * Helper alias for cleaner page content fetching.
   */
  getPage(slug, options) {
    return this.content.getPage(slug, options);
  }
  /**
   * Returns a readonly snapshot of the active configuration.
   */
  getConfig() {
    return Object.freeze({
      ...this.config,
      privacy: { ...this.config.privacy }
    });
  }
  /**
   * Updates runtime configuration dynamically without breaking active listeners.
   */
  updateConfig(updates) {
    this.config = {
      ...this.config,
      ...updates,
      privacy: { ...this.config.privacy, ...updates.privacy }
    };
    this.http.updateConfig(this.config);
    this.content.updateConfig?.(this.config);
    if (typeof window !== "undefined" && this.config.autoTracking !== false && this.config.privacy?.analytics !== false && !this.analytics) {
      this.analytics = new AnalyticsEngine(this.config);
      this.analytics.start();
    }
    if (this.config.privacy?.analytics === false) {
      this.analytics?.stop();
    }
  }
  /**
   * Returns deep system diagnostics including HTTP and cache performance.
   */
  diagnostics() {
    return {
      ...getDiagnostics(SDK_VERSION, this.config.environment ?? "production"),
      cache: this.content.getCacheStats(),
      http: this.http.getStats(),
      analyticsQueue: this.analytics ? void 0 : 0
    };
  }
  /**
   * Gracefully terminates background tasks and cleans up listeners.
   */
  destroy() {
    this.analytics?.stop(true);
    this.content.cleanup?.();
    this.events.clear();
  }
};
var nexus = new NexusClient();

// src/auth/context.tsx
import {
  createContext,
  useContext,
  useEffect as useEffect2,
  useState as useState2,
  useCallback as useCallback2
} from "react";
import { jsx as jsx2 } from "react/jsx-runtime";
var AuthContext = createContext(null);
var AuthProvider = ({
  children,
  config
}) => {
  const [user, setUser] = useState2(null);
  const [isLoading, setIsLoading] = useState2(true);
  const [error, setError] = useState2(null);
  const AUTH_BASE = `${config.apiUrl}/auth/project/${config.projectId}`;
  const checkSession = useCallback2(async () => {
    try {
      const res = await fetch(`${AUTH_BASE}/me`, {
        headers: getHeaders(config)
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        if (nexus.analytics) {
          nexus.analytics.identify(data.user.id, {
            email: data.user.email,
            role: data.user.role,
            ...data.user.metadata
          });
        }
      } else {
        setUser(null);
      }
    } catch (err) {
      console.debug("[GnApex Auth] Session check failed:", err);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [AUTH_BASE, config]);
  useEffect2(() => {
    checkSession();
  }, [checkSession]);
  const login = async (creds) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${AUTH_BASE}/login`, {
        method: "POST",
        headers: getHeaders(config),
        body: JSON.stringify(creds)
      });
      if (!res.ok) throw await parseError(res);
      const data = await res.json();
      setUser(data.user);
      if (nexus.analytics) {
        await nexus.analytics.identify(data.user.id, {
          email: data.user.email,
          role: data.user.role,
          login_method: "email",
          ...data.user.metadata
        });
      }
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  const register = async (creds) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${AUTH_BASE}/register`, {
        method: "POST",
        headers: getHeaders(config),
        body: JSON.stringify(creds)
      });
      if (!res.ok) throw await parseError(res);
      const data = await res.json();
      setUser(data.user);
      if (nexus.analytics) {
        nexus.analytics.track("signup", { method: "email" });
        nexus.analytics.identify(data.user.id, {
          email: data.user.email,
          role: data.user.role,
          ...data.user.metadata
        });
      }
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  const logout = async () => {
    setIsLoading(true);
    try {
      await fetch(`${AUTH_BASE}/logout`, {
        method: "POST",
        headers: getHeaders(config)
      });
    } catch (e) {
      console.warn("Logout network error", e);
    } finally {
      setUser(null);
      setIsLoading(false);
      if (nexus.analytics) {
        nexus.analytics.track("logout");
      }
    }
  };
  const updateProfile = async (updates) => {
    try {
      const res = await fetch(`${AUTH_BASE}/profile`, {
        method: "PATCH",
        headers: getHeaders(config),
        body: JSON.stringify(updates)
      });
      if (!res.ok) throw await parseError(res);
      const data = await res.json();
      setUser(data.user);
      if (nexus.analytics) {
        nexus.analytics.identify(data.user.id, updates);
      }
    } catch (err) {
      setError(err);
      throw err;
    }
  };
  const requestPasswordReset = async (email) => {
    const res = await fetch(`${AUTH_BASE}/password/reset-request`, {
      method: "POST",
      headers: getHeaders(config),
      body: JSON.stringify({ email })
    });
    if (!res.ok) throw await parseError(res);
  };
  return /* @__PURE__ */ jsx2(
    AuthContext.Provider,
    {
      value: {
        user,
        isLoading,
        error,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateProfile,
        requestPasswordReset
      },
      children
    }
  );
};
var useNexusAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useNexusAuth must be used within a NexusProvider");
  }
  return context;
};
function getHeaders(config) {
  return {
    "Content-Type": "application/json",
    "x-nexus-project": config.projectId,
    Authorization: `Bearer ${config.apiKey}`
    // 👈 CRITICAL: Send the nx_pk_ key
    // Note: We do NOT send the Master API Key here.
    // This is client-side. The backend uses Cookies or public tokens.
  };
}
async function parseError(res) {
  try {
    const json = await res.json();
    return {
      status: res.status,
      code: json.code || "UNKNOWN_ERROR",
      message: json.message || "An error occurred during authentication"
    };
  } catch {
    return {
      status: res.status,
      code: "NETWORK_ERROR",
      message: res.statusText
    };
  }
}

// src/notifications/push-client.ts
var NexusPushClient = class {
  constructor(config) {
    this.config = config;
  }
  /**
   * Helper to convert Base64 VAPID key to Uint8Array for WebPush security
   */
  urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
  /**
   * Requests browser notification permissions and registers the WebPush subscription
   */
  async requestSubscription(serviceWorkerPath = "/sw.js") {
    if (typeof window === "undefined" || !("serviceWorker" in navigator) || !("PushManager" in window)) {
      console.warn(
        "[GnApex] Push notifications are not supported in this browser environment."
      );
      return false;
    }
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        console.warn("[GnApex] Notification permission denied by user.");
        return false;
      }
      const vapidRes = await fetch(
        `${this.config.apiUrl}/notifications/vapid-key`,
        {
          headers: {
            Authorization: `Bearer ${this.config.apiKey}`,
            "x-nexus-project": this.config.projectId
          }
        }
      );
      if (!vapidRes.ok) throw new Error("Failed to fetch VAPID public key.");
      const { publicKey } = await vapidRes.json();
      const registration = await navigator.serviceWorker.register(serviceWorkerPath);
      await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        // 🚀 RESOLVED: Cast as 'any' to bypass strict DOM BufferSource typings
        applicationServerKey: this.urlBase64ToUint8Array(publicKey)
      });
      const rawSub = subscription.toJSON();
      if (!rawSub.endpoint || !rawSub.keys?.auth || !rawSub.keys?.p256dh) {
        throw new Error(
          "Malformed subscription payload received from browser."
        );
      }
      const res = await fetch(
        `${this.config.apiUrl}/notifications/project/${this.config.projectId}/subscribe`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.config.apiKey}`,
            "x-nexus-project": this.config.projectId
          },
          body: JSON.stringify({
            endpoint: rawSub.endpoint,
            auth: rawSub.keys.auth,
            p256dh: rawSub.keys.p256dh,
            provider: "WEB_PUSH"
          })
        }
      );
      return res.ok;
    } catch (err) {
      console.error("[GnApex] WebPush subscription failed:", err);
      return false;
    }
  }
};

// src/components/NexusProvider.tsx
import { jsx as jsx3, jsxs as jsxs2 } from "react/jsx-runtime";
var NexusContext = createContext2(nexus);
var NexusLiveFeedContext = createContext2({
  latestEvent: null,
  isConnected: false
});
var useNexusLiveFeed = () => React3.useContext(NexusLiveFeedContext);
function NexusAnalyticsTracker({
  disableAnalytics
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const prevPathRef = useRef2("");
  const searchParamsString = searchParams.toString();
  useEffect3(() => {
    if (nexus.analytics && !disableAnalytics) {
      nexus.analytics.pageView(prevPathRef.current || document.referrer);
      prevPathRef.current = pathname;
    }
  }, [pathname, searchParamsString, disableAnalytics]);
  return /* @__PURE__ */ jsx3("div", { id: "__nexus_react_active", style: { display: "none" } });
}
var NexusProvider = ({
  children,
  projectId,
  disableAnalytics = false,
  hasConsent = true,
  enableLiveFeed = false,
  onLiveEvent,
  autoPromptPush = true
  // 🚀 Default: true for zero-config automatic visitor subscription
}) => {
  const isInitialized = useRef2(false);
  const socketRef = useRef2(null);
  const [latestEvent, setLatestEvent] = useState3(
    null
  );
  const [isConnected, setIsConnected] = useState3(false);
  const liveFeedValue = useMemo2(
    () => ({ latestEvent, isConnected }),
    [latestEvent, isConnected]
  );
  const config = useMemo2(() => {
    if (projectId && nexus.getConfig().projectId !== projectId) {
      nexus.updateConfig({ projectId });
    }
    return nexus.getConfig();
  }, [projectId]);
  useEffect3(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator))
      return;
    navigator.serviceWorker.register("/sw.js").then(async (registration) => {
      if (nexus.getConfig().debug) {
        console.log("[GnApex] \u26A1 Sovereign Service Worker Active.");
      }
      if (autoPromptPush && "Notification" in window && Notification.permission === "default") {
        const pushClient = new NexusPushClient(nexus.getConfig());
        await pushClient.requestSubscription("/sw.js");
        return;
      }
      if ("Notification" in window && Notification.permission === "granted") {
        try {
          const pushClient = new NexusPushClient(nexus.getConfig());
          await pushClient.requestSubscription("/sw.js");
        } catch {
        }
      }
    }).catch((err) => {
      console.warn("[GnApex] Service Worker registration failed:", err);
    });
  }, [autoPromptPush]);
  useEffect3(() => {
    if (typeof window === "undefined" || disableAnalytics || !hasConsent)
      return;
    if (!isInitialized.current) {
      if (!nexus.analytics) {
        nexus.analytics = new AnalyticsEngine(nexus.getConfig());
      }
      nexus.analytics.start();
      isInitialized.current = true;
      if (nexus.getConfig().debug) {
        console.log("[GnApex] \u{1F680} Provider initialized analytics");
      }
    }
    return () => {
      if (nexus.analytics) {
        nexus.analytics.stop();
        isInitialized.current = false;
      }
    };
  }, [disableAnalytics, hasConsent]);
  const connectLiveFeed = useCallback3(async () => {
    if (typeof window === "undefined" || !enableLiveFeed) return;
    try {
      const { io } = await import("socket.io-client");
      const cfg = nexus.getConfig();
      const wsUrl = cfg.apiUrl || "https://gnapex.co.tz";
      const socket = io(`${wsUrl}/analytics`, {
        auth: { token: cfg.apiKey },
        query: { projectId: cfg.projectId },
        transports: ["websocket"],
        reconnectionAttempts: 5,
        reconnectionDelay: 2e3
      });
      socket.on("connect", () => {
        setIsConnected(true);
        if (cfg.debug) console.log("[GnApex] \u{1F534} Live feed connected");
      });
      socket.on("disconnect", () => {
        setIsConnected(false);
        if (cfg.debug) console.log("[GnApex] Live feed disconnected");
      });
      socket.on("live_event", (event) => {
        setLatestEvent(event);
        onLiveEvent?.(event);
      });
      socketRef.current = socket;
    } catch (err) {
      console.error("[GnApex] Live feed connection failed:", err);
    }
  }, [enableLiveFeed, onLiveEvent]);
  useEffect3(() => {
    if (enableLiveFeed) {
      connectLiveFeed();
    }
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      }
    };
  }, [enableLiveFeed, connectLiveFeed]);
  return /* @__PURE__ */ jsx3(NexusContext.Provider, { value: nexus, children: /* @__PURE__ */ jsx3(NexusLiveFeedContext.Provider, { value: liveFeedValue, children: /* @__PURE__ */ jsxs2(AuthProvider, { config, children: [
    /* @__PURE__ */ jsx3(Suspense, { fallback: null, children: /* @__PURE__ */ jsx3(NexusAnalyticsTracker, { disableAnalytics }) }),
    children
  ] }) }) });
};
var useNexus = () => {
  const context = React3.useContext(NexusContext);
  if (!context) {
    throw new Error("useNexus must be used within a NexusProvider");
  }
  return context;
};
var useNexusAnalytics = () => {
  const client = useNexus();
  if (!client.analytics) {
    return {
      track: () => {
      },
      identify: async () => false,
      group: async () => false,
      alias: async () => false,
      trackPurchase: () => {
      },
      trackError: () => {
      },
      reset: () => {
      }
    };
  }
  return {
    track: client.analytics.track.bind(client.analytics),
    identify: client.analytics.identify.bind(client.analytics),
    group: client.analytics.group.bind(client.analytics),
    alias: client.analytics.alias.bind(client.analytics),
    trackPurchase: client.analytics.trackPurchase.bind(client.analytics),
    trackError: client.analytics.trackError.bind(client.analytics),
    reset: client.analytics.reset.bind(client.analytics)
  };
};

// src/components/NexusRenders.tsx
import { useState as useState4 } from "react";
import * as LucideIcons from "lucide-react";
import { Fragment as Fragment2, jsx as jsx4, jsxs as jsxs3 } from "react/jsx-runtime";
function sanitizeHtml(html) {
  if (!html) return "";
  if (typeof window === "undefined") {
    return html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "").replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, "").replace(/\bon\w+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi, "").replace(/href\s*=\s*['"]\s*javascript:[^'"]*['"]/gi, 'href="#"').replace(/src\s*=\s*['"]\s*javascript:[^'"]*['"]/gi, 'src=""');
  }
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  doc.querySelectorAll("script, noscript").forEach((n) => n.remove());
  doc.querySelectorAll("*").forEach((el) => {
    [...el.attributes].forEach((attr) => {
      if (attr.name.toLowerCase().startsWith("on")) {
        el.removeAttribute(attr.name);
      }
    });
    const href = el.getAttribute("href");
    const src = el.getAttribute("src");
    if (href && /^\s*javascript:/i.test(href)) el.removeAttribute("href");
    if (src && /^\s*javascript:/i.test(src)) el.removeAttribute("src");
  });
  return doc.body.innerHTML;
}
function NexusRichText({
  value,
  className = "",
  hydrateCharts = true,
  onCommentClick,
  onImageClick
}) {
  if (!value) return null;
  return /* @__PURE__ */ jsx4(
    NexusRenderer,
    {
      content: value,
      className,
      hydrateCharts,
      onCommentClick,
      onImageClick
    }
  );
}
function NexusLongText({ value, className = "" }) {
  if (!value) return null;
  return /* @__PURE__ */ jsx4(
    "p",
    {
      className: `text-sm text-muted-foreground whitespace-pre-line leading-relaxed ${className}`,
      dangerouslySetInnerHTML: { __html: sanitizeHtml(value) }
    }
  );
}
function NexusIcon({
  name,
  className = "",
  size = 20,
  strokeWidth = 2
}) {
  if (!name) return null;
  const IconComponent = LucideIcons[name];
  if (!IconComponent) {
    const Fallback = LucideIcons.HelpCircle;
    return /* @__PURE__ */ jsx4(Fallback, { className, size, strokeWidth });
  }
  return /* @__PURE__ */ jsx4(
    IconComponent,
    {
      className,
      size,
      strokeWidth
    }
  );
}
function NexusImage({
  value,
  className = "",
  alt = "",
  ...props
}) {
  if (!value) return null;
  const imageUrl = typeof value === "string" ? value : value.url;
  const imageAlt = typeof value === "string" ? alt : value.alt || alt;
  if (!imageUrl) return null;
  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    /* @__PURE__ */ jsx4(
      "img",
      {
        src: imageUrl,
        alt: imageAlt,
        loading: "lazy",
        decoding: "async",
        className: `max-w-full h-auto object-cover rounded-xl ${className}`,
        ...props
      }
    )
  );
}
function NexusGallery({
  value,
  className = "",
  imageClassName = ""
}) {
  if (!value || value.length === 0) return null;
  return /* @__PURE__ */ jsx4(
    "div",
    {
      className: `grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 ${className}`,
      children: value.map((img, idx) => /* @__PURE__ */ jsx4(
        "div",
        {
          className: "overflow-hidden rounded-xl aspect-square bg-muted/20 border border-border",
          children: /* @__PURE__ */ jsx4(
            NexusImage,
            {
              value: img,
              className: `w-full h-full object-cover hover:scale-105 transition-transform duration-500 ${imageClassName}`
            }
          )
        },
        idx
      ))
    }
  );
}
function NexusVideo({
  value,
  className = "",
  autoplay = false
}) {
  if (!value) return null;
  const isYouTube = value.includes("youtube.com") || value.includes("youtu.be");
  const isVimeo = value.includes("vimeo.com");
  if (isYouTube) {
    const videoId = value.includes("youtu.be") ? value.split("/").pop()?.split("?")[0] : value.split("v=")[1]?.split("&")[0];
    return /* @__PURE__ */ jsx4(
      "iframe",
      {
        src: `https://www.youtube.com/embed/${videoId}?autoplay=${autoplay ? 1 : 0}`,
        className: `w-full aspect-video rounded-xl border-0 ${className}`,
        allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",
        allowFullScreen: true,
        title: "YouTube Video"
      }
    );
  }
  if (isVimeo) {
    const videoId = value.split("/").pop()?.split("?")[0];
    return /* @__PURE__ */ jsx4(
      "iframe",
      {
        src: `https://player.vimeo.com/video/${videoId}?autoplay=${autoplay ? 1 : 0}`,
        className: `w-full aspect-video rounded-xl border-0 ${className}`,
        allow: "autoplay; fullscreen; picture-in-picture",
        allowFullScreen: true,
        title: "Vimeo Video"
      }
    );
  }
  return /* @__PURE__ */ jsx4(
    "video",
    {
      src: value,
      controls: true,
      autoPlay: autoplay,
      muted: autoplay,
      playsInline: true,
      className: `w-full rounded-xl border border-border object-contain ${className}`
    }
  );
}
function NexusMap({ value, className = "" }) {
  if (!value || !value.lat || !value.lng) return null;
  const query = encodeURIComponent(
    value.address || `${value.lat},${value.lng}`
  );
  const embedUrl = `https://maps.google.com/maps?q=${query}&t=&z=13&ie=UTF8&iwloc=&output=embed`;
  return /* @__PURE__ */ jsx4(
    "div",
    {
      className: `overflow-hidden rounded-xl border border-border aspect-video w-full ${className}`,
      children: /* @__PURE__ */ jsx4(
        "iframe",
        {
          title: "Embedded Map",
          width: "100%",
          height: "100%",
          src: embedUrl,
          className: "border-0",
          allowFullScreen: true,
          loading: "lazy"
        }
      )
    }
  );
}
function NexusColor({
  value,
  className = "",
  showHexLabel = true
}) {
  if (!value) return null;
  return /* @__PURE__ */ jsxs3("div", { className: `flex items-center gap-2.5 ${className}`, children: [
    /* @__PURE__ */ jsx4(
      "div",
      {
        className: "h-6 w-6 rounded-full border border-border/80 shadow-xs shrink-0",
        style: { backgroundColor: value }
      }
    ),
    showHexLabel && /* @__PURE__ */ jsx4("span", { className: "font-mono text-xs font-semibold text-foreground/80 uppercase", children: value })
  ] });
}
function NexusGradient({
  value,
  children,
  className = "",
  asTextMask = false
}) {
  if (!value) return /* @__PURE__ */ jsx4(Fragment2, { children });
  if (asTextMask) {
    return /* @__PURE__ */ jsx4(
      "span",
      {
        className: `bg-clip-text text-transparent font-bold ${className}`,
        style: { backgroundImage: value, WebkitBackgroundClip: "text" },
        children
      }
    );
  }
  return /* @__PURE__ */ jsx4(
    "div",
    {
      className: `rounded-xl ${className}`,
      style: { backgroundImage: value },
      children
    }
  );
}
function NexusAddress({ value, className = "" }) {
  if (!value) return null;
  const lines = [
    value.street,
    [value.city, value.state, value.postalCode].filter(Boolean).join(", "),
    value.country
  ].filter(Boolean);
  if (lines.length === 0) return null;
  return /* @__PURE__ */ jsxs3(
    "div",
    {
      className: `flex items-start gap-2.5 p-3 rounded-xl border border-border bg-card/50 ${className}`,
      children: [
        /* @__PURE__ */ jsx4(LucideIcons.MapPin, { className: "h-4 w-4 text-muted-foreground shrink-0 mt-0.5" }),
        /* @__PURE__ */ jsx4("div", { className: "text-xs text-foreground/80 leading-relaxed font-medium", children: lines.map((line, i) => /* @__PURE__ */ jsx4("div", { children: line }, i)) })
      ]
    }
  );
}
function NexusKeyValue({ value, className = "" }) {
  if (!value || Object.keys(value).length === 0) return null;
  return /* @__PURE__ */ jsx4(
    "div",
    {
      className: `border border-border rounded-xl overflow-hidden bg-card/30 divide-y divide-border ${className}`,
      children: Object.entries(value).map(([k, v]) => /* @__PURE__ */ jsxs3("div", { className: "flex text-xs px-4 py-3 gap-4", children: [
        /* @__PURE__ */ jsx4("div", { className: "w-1/3 font-bold text-muted-foreground select-none uppercase tracking-wider text-[10px]", children: k }),
        /* @__PURE__ */ jsx4("div", { className: "flex-1 font-medium text-foreground", children: v })
      ] }, k))
    }
  );
}
function NexusTags({
  value,
  className = "",
  badgeClassName = ""
}) {
  if (!value || value.length === 0) return null;
  return /* @__PURE__ */ jsx4("div", { className: `flex flex-wrap gap-1.5 ${className}`, children: value.map((tag) => /* @__PURE__ */ jsx4(
    "span",
    {
      className: `inline-flex items-center rounded-lg border border-border bg-muted/40 px-2.5 py-1 text-xs font-semibold text-foreground/80 ${badgeClassName}`,
      children: tag
    },
    tag
  )) });
}
function NexusProgress({
  value,
  max = 100,
  className = "",
  color = "bg-primary"
}) {
  if (value === null) return null;
  const percent = Math.min(Math.max(value / max * 100, 0), 100);
  return /* @__PURE__ */ jsx4("div", { className: `w-full ${className}`, children: /* @__PURE__ */ jsx4("div", { className: "h-2 w-full rounded-full bg-muted overflow-hidden border border-border/30", children: /* @__PURE__ */ jsx4(
    "div",
    {
      className: `h-full rounded-full transition-all duration-500 ${color}`,
      style: { width: `${percent}%` }
    }
  ) }) });
}
function NexusBlendContainer({
  mode,
  children,
  className = ""
}) {
  const blendStyle = mode ? { mixBlendMode: mode } : {};
  return /* @__PURE__ */ jsx4("div", { className, style: blendStyle, children });
}
function NexusCode({
  value,
  language = "json",
  className = "",
  showLineNumbers = false
}) {
  const [copied, setCopied] = useState4(false);
  if (!value) return null;
  const handleCopy = () => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(value);
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = value;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand("copy");
      } catch {
      }
      textArea.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2e3);
  };
  const lines = value.split("\n");
  return /* @__PURE__ */ jsxs3(
    "div",
    {
      className: `relative rounded-xl border border-border bg-[#090A0F] overflow-hidden ${className}`,
      children: [
        /* @__PURE__ */ jsxs3("div", { className: "flex items-center justify-between px-4 py-2 border-b border-border bg-white/2 select-none", children: [
          /* @__PURE__ */ jsx4("span", { className: "text-[10px] font-black uppercase text-muted-foreground tracking-wider", children: language }),
          /* @__PURE__ */ jsx4(
            "button",
            {
              onClick: handleCopy,
              className: "flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground hover:text-primary transition-colors cursor-pointer",
              children: copied ? /* @__PURE__ */ jsxs3(Fragment2, { children: [
                /* @__PURE__ */ jsx4(LucideIcons.Check, { className: "h-3 w-3 text-emerald-400" }),
                /* @__PURE__ */ jsx4("span", { className: "text-emerald-400", children: "Copied!" })
              ] }) : /* @__PURE__ */ jsxs3(Fragment2, { children: [
                /* @__PURE__ */ jsx4(LucideIcons.Copy, { className: "h-3 w-3" }),
                /* @__PURE__ */ jsx4("span", { children: "Copy Code" })
              ] })
            }
          )
        ] }),
        /* @__PURE__ */ jsxs3("div", { className: "flex overflow-x-auto p-4 font-mono text-[11px] leading-relaxed text-emerald-400 select-text", children: [
          showLineNumbers && /* @__PURE__ */ jsx4("div", { className: "flex flex-col text-right text-gray-600 select-none pr-3.5 border-r border-border/30 mr-3.5", children: lines.map((_, i) => /* @__PURE__ */ jsx4("span", { children: i + 1 }, i)) }),
          /* @__PURE__ */ jsx4("pre", { className: "flex-1 whitespace-pre", children: value })
        ] })
      ]
    }
  );
}
function NexusBoolean({
  value,
  className = "",
  trueLabel = "Active",
  falseLabel = "Inactive"
}) {
  if (value === null) return null;
  return /* @__PURE__ */ jsxs3(
    "span",
    {
      className: `inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider border shadow-sm ${value ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400" : "border-muted-foreground/20 bg-muted-foreground/10 text-muted-foreground"} ${className}`,
      children: [
        /* @__PURE__ */ jsx4(
          "span",
          {
            className: `h-1.5 w-1.5 rounded-full ${value ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground"}`
          }
        ),
        value ? trueLabel : falseLabel
      ]
    }
  );
}
export {
  AuthProvider,
  NexusAddress,
  NexusBlendContainer,
  NexusBoolean,
  NexusCode,
  NexusColor,
  NexusGallery,
  NexusGradient,
  NexusIcon,
  NexusImage,
  NexusKeyValue,
  NexusLongText,
  NexusMap,
  NexusProgress,
  NexusProvider,
  NexusRenderer,
  NexusRichText,
  NexusTags,
  NexusVideo,
  useNexus,
  useNexusAnalytics,
  useNexusAuth,
  useNexusLiveFeed
};
