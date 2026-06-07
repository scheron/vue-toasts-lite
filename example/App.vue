<script setup lang="ts">
import {computed, onMounted, ref, watch} from "vue"
import {toasts, ToastsLiteProvider} from "vue-toasts-lite"

import Canvas from "./components/Canvas.vue"
import Menu from "./components/Menu.vue"

import "vue-toasts-lite/style.css"

import type {DemoKind} from "./data/graph"

type Theme = "light" | "dark"
const THEME_KEY = "tl-theme"
const theme = ref<Theme>("light")

const applyTheme = (t: Theme) => {
  document.documentElement.dataset.theme = t
}

onMounted(() => {
  const saved = (localStorage.getItem(THEME_KEY) as Theme | null) ?? "light"
  theme.value = saved === "dark" ? "dark" : "light"
  applyTheme(theme.value)
})

watch(theme, (t) => {
  applyTheme(t)
  try {
    localStorage.setItem(THEME_KEY, t)
  } catch {
    /* ignore */
  }
})

const toggleTheme = () => {
  theme.value = theme.value === "dark" ? "light" : "dark"
}

const canvas = ref<InstanceType<typeof Canvas> | null>(null)
const activeId = ref<string | null>(null)
const zoomPct = ref(100)
const step = ref<{index: number; total: number; id: string | null}>({index: -1, total: 0, id: null})

const stepLabel = computed(() => {
  if (step.value.index < 0) return `00 / ${String(step.value.total).padStart(2, "0")}`
  return `${String(step.value.index + 1).padStart(2, "0")} / ${String(step.value.total).padStart(2, "0")}`
})

const handleSelect = (id: string | null) => {
  activeId.value = id
}

const handleZoom = (pct: number) => {
  zoomPct.value = pct
}

const handleStep = (payload: {index: number; total: number; id: string | null}) => {
  step.value = payload
}

const explicitToastId = "graph-explicit-id"

const runDemo = (demo: DemoKind) => {
  switch (demo.kind) {
    case "basic":
      toasts[demo.type](`A ${demo.type} toast`, {duration: 3000})
      return
    case "type":
      toasts[demo.type](`type: ${demo.type}`, {duration: 3000})
      return
    case "position":
      toasts.success(`position: ${demo.position}`, {position: demo.position, duration: 3000})
      return
    case "duration":
      toasts.success(`duration: ${demo.ms}ms`, {duration: demo.ms})
      return
    case "autoClose":
      if (demo.value) toasts.success("autoClose: true — closes after 3s", {duration: 3000})
      else toasts.info("autoClose: false — stays until dismissed", {autoClose: false})
      return
    case "closable-default":
      toasts.success("Saved")
      return
    case "closable-sticky":
      toasts.warn("Sticky — no × button, no body click, no timer", {autoClose: false, closable: false})
      return
    case "closable-click":
      toasts.info("Click to dismiss — × or body click", {autoClose: false, closable: true})
      return
    case "closable-timer":
      toasts.success("Timer-only — auto-close, no × button", {closable: false})
      return
    case "update": {
      const id = toasts.loading("Uploading...")
      setTimeout(() => toasts.update(id, {type: "success", message: "Done!", duration: 3000}), 2000)
      return
    }
    case "promise": {
      const fakeFetch = () =>
        new Promise<string>((resolve, reject) => {
          setTimeout(() => (Math.random() > 0.5 ? resolve("ok") : reject("nope")), 1800)
        })
      toasts
        .promise(fakeFetch(), {
          loading: "Loading...",
          success: "Loaded!",
          error: "Failed!",
        })
        .catch(() => undefined)
      return
    }
    case "managing-create":
      toasts.add({id: explicitToastId, type: "warn", message: "Job running", autoClose: false})
      return
    case "managing-update":
      toasts.update(explicitToastId, {type: "success", message: "Job done!"})
      return
    case "managing-remove":
      toasts.remove(explicitToastId)
      return
    case "clear":
      toasts.clear()
      return
    case "monitoring":
      toasts.info("first", {duration: 1800})
      setTimeout(() => toasts.success("second", {duration: 1800}), 300)
      setTimeout(() => toasts.warn("third", {duration: 1800}), 600)
      return
    case "showAll":
      toasts.success("top-left", {position: "top-left"})
      toasts.error("top-center", {position: "top-center"})
      toasts.warn("top-right", {position: "top-right"})
      toasts.info("middle-center", {position: "middle-center"})
      toasts.loading("bottom-left", {position: "bottom-left"})
      toasts.success("bottom-center", {position: "bottom-center"})
      toasts.error("bottom-right", {position: "bottom-right"})
      return
    case "multi-positions":
      toasts.success("Top", {position: "top-center"})
      toasts.error("Bottom", {position: "bottom-right"})
      return
  }
}

const handleDemo = (demo: DemoKind) => runDemo(demo)

const handleCopy = (payload: {text: string; ok: boolean}) => {
  if (payload.ok) {
    toasts.success("Copied to clipboard", {duration: 1500, id: "copy-feedback"})
  } else {
    toasts.error("Copy failed — clipboard unavailable", {duration: 2200, id: "copy-feedback"})
  }
}

const fitAll = () => canvas.value?.fitAll()
const clearAll = () => toasts.clear()
const stepNext = () => canvas.value?.stepNext()
const stepPrev = () => canvas.value?.stepPrev()
const jumpTo = (id: string) => canvas.value?.goTo(id)

const canPrev = computed(() => step.value.index > 0)
const canNext = computed(() => step.value.index < step.value.total - 1)
</script>

<template>
  <div class="app">
    <Canvas
      ref="canvas"
      @select="handleSelect"
      @demo="handleDemo"
      @zoom-change="handleZoom"
      @step-change="handleStep"
      @copy="handleCopy"
    />
    <Menu :active-id="activeId" @jump="jumpTo" />

    <header class="chrome chrome-top-left">
      <div class="brand">
        <span class="brand-mark">◐</span>
        <span class="brand-name">vue-toasts-lite</span>
        <span class="brand-tag">v0.2.0</span>
      </div>
    </header>

    <div class="chrome chrome-top-right">
      <button class="ctl" @click="fitAll" title="Fit all">
        <span>fit all</span>
      </button>
      <button class="ctl" @click="clearAll" title="Clear all toasts">
        <span>clear all</span>
      </button>
      <button class="ctl ctl-icon" @click="toggleTheme" :title="theme === 'dark' ? 'Switch to light' : 'Switch to dark'" :aria-label="theme === 'dark' ? 'Switch to light' : 'Switch to dark'">
        <svg v-if="theme === 'dark'" width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="7" cy="7" r="3" />
          <path d="M7 1v1.5M7 11.5V13M1 7h1.5M11.5 7H13M2.6 2.6l1.1 1.1M10.3 10.3l1.1 1.1M2.6 11.4l1.1-1.1M10.3 3.7l1.1-1.1" />
        </svg>
        <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
        </svg>
      </button>
      <div class="zoom">
        <span class="zoom-pct">{{ zoomPct }}</span>
        <span class="zoom-sym">%</span>
      </div>
      <a class="ctl ctl-link" href="https://github.com/scheron/vue-toasts-lite" target="_blank" rel="noopener">
        <span>github</span>
        <span class="ctl-arrow">↗</span>
      </a>
    </div>

    <footer class="chrome chrome-bottom">
      <button class="arrow" :disabled="!canPrev" @click="stepPrev" aria-label="Previous step">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
          <path d="M10 3L5 8l5 5" />
        </svg>
      </button>
      <span class="step-label">{{ stepLabel }}</span>
      <button class="arrow" :disabled="!canNext" @click="stepNext" aria-label="Next step">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
          <path d="M6 3l5 5-5 5" />
        </svg>
      </button>
    </footer>

    <ToastsLiteProvider />
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --paper: #faf8f4;
  --ink: #0a0a0a;
  --muted: #6b6b6b;
  --rule: #1a1a1a;
  --rule-soft: #d9d4ca;
  --accent: #c2410c;
  --mono: "Geist Mono", "JetBrains Mono", "Consolas", "Monaco", monospace;

  /* Semantic surfaces & borders — switched by [data-theme="dark"] below. */
  --surface: var(--paper);
  --surface-soft: rgba(10, 10, 10, 0.03);
  --surface-faint: rgba(10, 10, 10, 0.05);
  --border-card: rgba(10, 10, 10, 0.18);
  --border-soft: rgba(10, 10, 10, 0.08);
  --shadow-card: 0 1px 3px rgba(0, 0, 0, 0.05), 0 8px 24px rgba(0, 0, 0, 0.06);
  --shadow-card-hover: 0 2px 4px rgba(0, 0, 0, 0.06), 0 16px 36px rgba(0, 0, 0, 0.1);
  --grid-dot: rgba(10, 10, 10, 0.1);
  --edge-stroke: rgba(10, 10, 10, 0.5);
}

html[data-theme="dark"] {
  --paper: #14141a;
  --ink: #f4f4ef;
  --muted: #9a9a92;
  --rule: #e3e2da;
  --rule-soft: #2e2e36;
  --accent: #f97316;

  --surface: #1c1c24;
  --surface-soft: rgba(255, 255, 255, 0.04);
  --surface-faint: rgba(255, 255, 255, 0.06);
  --border-card: rgba(255, 255, 255, 0.12);
  --border-soft: rgba(255, 255, 255, 0.08);
  --shadow-card: 0 1px 3px rgba(0, 0, 0, 0.4), 0 12px 32px rgba(0, 0, 0, 0.45);
  --shadow-card-hover: 0 2px 5px rgba(0, 0, 0, 0.45), 0 18px 40px rgba(0, 0, 0, 0.55);
  --grid-dot: rgba(255, 255, 255, 0.08);
  --edge-stroke: rgba(255, 255, 255, 0.4);

  /* Library design tokens — re-skinned for dark canvas. The library reads
   * these and auto-derives bg/border/text variants via color-mix. */
  --tl-bg: hsl(240, 10%, 14%);
  --tl-text: hsl(40, 20%, 94%);
  --tl-border: hsl(240, 8%, 28%);
  --tl-shadow: hsla(0, 0%, 0%, 0.45);
  --tl-success: hsl(145, 60%, 58%);
  --tl-error: hsl(0, 75%, 66%);
  --tl-warn: hsl(40, 95%, 60%);
  --tl-info: hsl(210, 80%, 65%);
  --tl-icon-color: hsl(240, 10%, 10%);
  --tl-spinner-color: hsl(40, 20%, 90%);
}

html,
body,
#app {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

body {
  font-family: var(--mono);
  background: var(--paper);
  color: var(--ink);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-size: 13px;
}

.app {
  position: fixed;
  inset: 0;
}

.chrome {
  position: fixed;
  z-index: 100;
  pointer-events: auto;
  font-family: var(--mono);
  color: var(--ink);
}

.chrome-top-left {
  top: 20px;
  left: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: calc(100vw - 320px);
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
}

.brand-mark {
  font-size: 14px;
  color: var(--accent);
  line-height: 1;
}

.brand-name {
  font-size: 13px;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.brand-tag {
  font-size: 10px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--muted);
  padding: 3px 7px;
  border: 1px solid var(--rule-soft);
  border-radius: 3px;
}

.chrome-top-right {
  top: 20px;
  right: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.ctl {
  background: transparent;
  border: 1px solid var(--rule);
  font-family: var(--mono);
  font-size: 10px;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  padding: 7px 12px;
  cursor: pointer;
  color: var(--ink);
  display: inline-flex;
  align-items: center;
  gap: 6px;
  text-decoration: none;
  transition: background 0.15s ease, color 0.15s ease;
  border-radius: 3px;
}

.ctl:hover {
  background: var(--ink);
  color: var(--paper);
}

.ctl-arrow {
  font-size: 12px;
}

.zoom {
  display: inline-flex;
  align-items: baseline;
  gap: 2px;
  min-width: 56px;
  justify-content: flex-end;
}

.zoom-pct {
  font-size: 16px;
  font-weight: 500;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

.zoom-sym {
  font-size: 11px;
  color: var(--muted);
}

.chrome-bottom {
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--surface);
  border: 1px solid var(--rule);
  border-radius: 999px;
  padding: 6px 10px;
  box-shadow: var(--shadow-card);
}

.ctl-icon {
  padding: 7px 9px;
}

.arrow {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: 1px solid var(--rule);
  background: var(--surface);
  color: var(--ink);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
}

.arrow:hover:not(:disabled) {
  background: var(--ink);
  color: var(--paper);
}

.arrow:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.step-label {
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.08em;
  color: var(--muted);
  min-width: 60px;
  text-align: center;
}

@media (max-width: 720px) {
  .chrome-top-left {
    max-width: calc(100vw - 40px);
  }
  .brand-tag {
    display: none;
  }
  .ctl {
    padding: 6px 10px;
  }
  .zoom {
    min-width: 46px;
  }
}
</style>
