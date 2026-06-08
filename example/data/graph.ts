import type {ToastPosition, ToastType} from "vue-toasts-lite"

export type NodeKind = "root" | "concept" | "subsection" | "example" | "step" | "pattern"

export type DemoKind =
  | {kind: "type"; type: ToastType}
  | {kind: "position"; position: ToastPosition}
  | {kind: "autoClose"; value: boolean}
  | {kind: "closable-default"}
  | {kind: "closable-sticky"}
  | {kind: "closable-click"}
  | {kind: "closable-timer"}
  | {kind: "duration"; ms: number}
  | {kind: "update"}
  | {kind: "promise"}
  | {kind: "managing-create"}
  | {kind: "managing-update"}
  | {kind: "managing-remove"}
  | {kind: "clear"}
  | {kind: "monitoring"}
  | {kind: "basic"; type: ToastType}
  | {kind: "showAll"}
  | {kind: "multi-positions"}

export type ActionVariant = "default" | "success" | "error" | "warn" | "info" | "loading" | "accent" | "muted"

export type DemoAction = {
  label: string
  demo: DemoKind
  variant?: ActionVariant
}

export type TableSpec = {
  columns: string[]
  rows: string[][]
}

export type ActionsLayout = "flow" | "anchor-grid"

export type CodeLang = "javascript" | "bash" | "xml" | "css"

export type GraphNode = {
  id: string
  parent: string | null
  kind: NodeKind
  index?: string
  title: string
  subtitle?: string
  blurb?: string
  code?: string
  lang?: CodeLang
  table?: TableSpec
  actions?: DemoAction[]
  actionsLayout?: ActionsLayout
  width?: number
  monitor?: boolean
}

export const NODES: GraphNode[] = [
  {
    id: "root",
    parent: null,
    kind: "root",
    title: "vue-toasts-lite",
    subtitle: "the library map",
    blurb: "A lightweight toast notifications library for Vue 3.",
    width: 340,
  },

  // ─── 01 · QUICK START ──────────────────────────────────────────
  {
    id: "quick-start",
    parent: "root",
    kind: "concept",
    index: "01",
    title: "Quick Start",
    subtitle: "install · mount · use",
    blurb: "Three small steps from npm install to your first toast.",
    width: 320,
  },
  {
    id: "install",
    parent: "quick-start",
    kind: "step",
    index: "1.",
    title: "Install the package",
    subtitle: "via npm",
    code: "npm install vue-toasts-lite",
    lang: "bash",
    width: 340,
  },
  {
    id: "provider",
    parent: "quick-start",
    kind: "step",
    index: "2.",
    title: "Add ToastsLiteProvider",
    subtitle: "once, at app root",
    code: `<script setup>
import { ToastsLiteProvider } from 'vue-toasts-lite'
import 'vue-toasts-lite/style.css'
</script>

<template>
  <div>
    <RouterView />
    <ToastsLiteProvider />
  </div>
</template>`,
    lang: "xml",
    width: 400,
  },
  {
    id: "use",
    parent: "quick-start",
    kind: "step",
    index: "3.",
    title: "Use anywhere in your app",
    subtitle: "five voices",
    code: `<script setup>
import { toasts } from 'vue-toasts-lite'

toasts.success('Hello!')
toasts.error('Something went wrong')
toasts.loading('Loading...')
toasts.warn('Warning message')
toasts.info('Info message')
</script>`,
    lang: "xml",
    width: 400,
    actions: [
      {label: "success", demo: {kind: "basic", type: "success"}, variant: "success"},
      {label: "error", demo: {kind: "basic", type: "error"}, variant: "error"},
      {label: "loading", demo: {kind: "basic", type: "loading"}, variant: "loading"},
      {label: "warn", demo: {kind: "basic", type: "warn"}, variant: "warn"},
      {label: "info", demo: {kind: "basic", type: "info"}, variant: "info"},
    ],
  },

  // ─── 02 · API ──────────────────────────────────────────────────
  {
    id: "api",
    parent: "root",
    kind: "concept",
    index: "02",
    title: "API",
    subtitle: "the full surface",
    blurb: "Five quick voices, four control methods, one live subscription.",
    width: 320,
  },
  {
    id: "api-basic",
    parent: "api",
    kind: "subsection",
    title: "Basic methods",
    subtitle: "5 voices · same shape",
    code: `// Basic methods
toasts.success(message, options?)
toasts.error(message, options?)
toasts.loading(message, options?)
toasts.warn(message, options?)
toasts.info(message, options?)`,
    width: 440,
    actions: [
      {label: "success", demo: {kind: "basic", type: "success"}, variant: "success"},
      {label: "error", demo: {kind: "basic", type: "error"}, variant: "error"},
      {label: "loading", demo: {kind: "basic", type: "loading"}, variant: "loading"},
      {label: "warn", demo: {kind: "basic", type: "warn"}, variant: "warn"},
      {label: "info", demo: {kind: "basic", type: "info"}, variant: "info"},
    ],
  },
  {
    id: "api-advanced",
    parent: "api",
    kind: "subsection",
    title: "Advanced methods",
    subtitle: "create · mutate · dismiss",
    code: `// Advanced methods
toasts.add(options)              // Create custom toast
toasts.update(id, options)       // Update existing toast
toasts.remove(id?)               // Remove toast(s)
toasts.clear()                   // Clear all toasts
toasts.promise(promise, options) // Handle promise states

// Monitoring methods
toasts.toastList                 // Get array of all active toasts
toasts.onToastsListChange(callback) // Subscribe to toast list changes`,
    width: 500,
    actions: [
      {label: "add", demo: {kind: "managing-create"}, variant: "warn"},
      {label: "update", demo: {kind: "managing-update"}, variant: "success"},
      {label: "remove", demo: {kind: "managing-remove"}, variant: "error"},
      {label: "clear", demo: {kind: "clear"}, variant: "muted"},
      {label: "promise", demo: {kind: "promise"}, variant: "info"},
      {label: "monitor", demo: {kind: "monitoring"}, variant: "accent"},
    ],
  },

  // ─── 03 · OPTIONS ──────────────────────────────────────────────
  {
    id: "options",
    parent: "root",
    kind: "concept",
    index: "03",
    title: "Options",
    subtitle: "every parameter",
    blurb: "Every toast accepts the same options. Pass them inline. Live examples on the right.",
    width: 560,
    table: {
      columns: ["option", "type", "default", "description"],
      rows: [
        ["message", "string", "—", "Message to display"],
        ["type", "5 variants", "'success'", "Toast type"],
        ["duration", "number", "3000", "Duration in milliseconds"],
        ["autoClose", "boolean", "true", "Auto-close behavior"],
        ["position", "ToastPosition", "'top-center'", "Toast position"],
        ["closable", "boolean", "true", "Show × button and allow body click to dismiss"],
        ["id", "string", "auto", "Custom ID"],
      ],
    },
  },
  {
    id: "ex-type",
    parent: "options",
    kind: "example",
    title: "type",
    subtitle: "pick a voice",
    blurb: "Five variants change icon and color. Click to fire each.",
    code: `toasts.success('Saved')
toasts.error('Failed')
toasts.warn('Warning')
toasts.info('FYI')
toasts.loading('Working...')`,
    width: 340,
    actions: [
      {label: "success", demo: {kind: "type", type: "success"}, variant: "success"},
      {label: "error", demo: {kind: "type", type: "error"}, variant: "error"},
      {label: "loading", demo: {kind: "type", type: "loading"}, variant: "loading"},
      {label: "warn", demo: {kind: "type", type: "warn"}, variant: "warn"},
      {label: "info", demo: {kind: "type", type: "info"}, variant: "info"},
    ],
  },
  {
    id: "ex-position",
    parent: "options",
    kind: "example",
    title: "position",
    subtitle: "seven anchors",
    blurb: "Toasts can appear at any of seven anchors — and multiple positions can be active at once.",
    code: `toasts.success('Top', { position: 'top-center' })
toasts.error('Bottom', { position: 'bottom-right' })`,
    width: 460,
    actionsLayout: "anchor-grid",
    actions: [
      {label: "top-left", demo: {kind: "position", position: "top-left"}},
      {label: "top-center", demo: {kind: "position", position: "top-center"}},
      {label: "top-right", demo: {kind: "position", position: "top-right"}},
      {label: "middle-center", demo: {kind: "position", position: "middle-center"}, variant: "accent"},
      {label: "bottom-left", demo: {kind: "position", position: "bottom-left"}},
      {label: "bottom-center", demo: {kind: "position", position: "bottom-center"}},
      {label: "bottom-right", demo: {kind: "position", position: "bottom-right"}},
      {label: "show all", demo: {kind: "showAll"}, variant: "accent"},
    ],
  },
  {
    id: "ex-duration",
    parent: "options",
    kind: "example",
    title: "duration",
    subtitle: "ms · auto-close timer",
    code: `// With options
toasts.success('Success!', { duration: 5000, position: 'bottom-right' })`,
    width: 540,
    actions: [
      {label: "1s", demo: {kind: "duration", ms: 1000}},
      {label: "3s (default)", demo: {kind: "duration", ms: 3000}},
      {label: "5s", demo: {kind: "duration", ms: 5000}},
      {label: "10s", demo: {kind: "duration", ms: 10000}},
    ],
  },
  {
    id: "ex-autoClose",
    parent: "options",
    kind: "example",
    title: "autoClose",
    subtitle: "boolean · default true",
    blurb: "False = the toast stays on screen until removed.",
    code: `// Auto-close after 3000 ms (default)
toasts.success('Auto close')

// Sticky — no timer
toasts.success('Stays', { autoClose: false })`,
    width: 380,
    actions: [
      {label: "true", demo: {kind: "autoClose", value: true}, variant: "success"},
      {label: "false", demo: {kind: "autoClose", value: false}, variant: "warn"},
    ],
  },
  {
    id: "ex-closable",
    parent: "options",
    kind: "example",
    title: "closable",
    subtitle: "boolean · default true",
    blurb:
      "The closable flag controls both the × button on the right and click-to-dismiss on the toast body. When false, the toast can only be closed by the auto-close timer or programmatically via toasts.remove(id).",
    code: `// Default — × button visible, body click closes
toasts.success('Saved')

// Sticky — no button, no body click, no timer
toasts.warn('Sticky', { autoClose: false, closable: false })

// No timer but user can still dismiss via × or body click
toasts.info('Click to dismiss', { autoClose: false, closable: true })

// Auto-close only, no × button
toasts.success('Timer-only', { closable: false })`,
    width: 580,
    actions: [
      {label: "default", demo: {kind: "closable-default"}, variant: "success"},
      {label: "sticky", demo: {kind: "closable-sticky"}, variant: "warn"},
      {label: "click to dismiss", demo: {kind: "closable-click"}, variant: "info"},
      {label: "timer only", demo: {kind: "closable-timer"}, variant: "success"},
    ],
  },
  {
    id: "ex-id",
    parent: "options",
    kind: "example",
    title: "id",
    subtitle: "string · auto",
    blurb: "Reach the same toast over time — create with a custom ID, then update or remove it.",
    code: `toasts.add({ id: 'job', type: 'warn', autoClose: false, message: 'Running' })
toasts.update('job', { type: 'success', message: 'Done' })
toasts.remove('job')`,
    width: 580,
    actions: [
      {label: "create", demo: {kind: "managing-create"}, variant: "warn"},
      {label: "update", demo: {kind: "managing-update"}, variant: "success"},
      {label: "remove", demo: {kind: "managing-remove"}, variant: "error"},
    ],
  },

  // ─── 04 · PATTERNS ─────────────────────────────────────────────
  {
    id: "patterns",
    parent: "root",
    kind: "concept",
    index: "04",
    title: "Patterns",
    subtitle: "composite flows",
    blurb: "Four ready-made flows: loading → done, promise tracking, manage by ID, live monitor.",
    width: 340,
  },
  {
    id: "pat-update",
    parent: "patterns",
    kind: "pattern",
    title: "Update Toasts",
    subtitle: "loading → done",
    code: `const id = toasts.loading('Uploading...')
// Later
toasts.update(id, { type: 'success', message: 'Done!' })`,
    width: 440,
    actions: [{label: "run", demo: {kind: "update"}, variant: "accent"}],
  },
  {
    id: "pat-promise",
    parent: "patterns",
    kind: "pattern",
    title: "Promise Support",
    subtitle: "tracks loading / success / error",
    code: `await toasts.promise(
  fetchData(),
  {
    loading: 'Loading...',
    success: 'Loaded!',
    error: 'Failed!'
  }
)`,
    width: 440,
    actions: [{label: "try (50% success)", demo: {kind: "promise"}, variant: "accent"}],
  },
  {
    id: "pat-manage",
    parent: "patterns",
    kind: "pattern",
    title: "Manage by ID",
    subtitle: "create · update · remove",
    code: `// Create a sticky toast with a known ID
toasts.add({ id: 'job', type: 'warn', autoClose: false, message: 'Running' })

// Mutate it in place later
toasts.update('job', { type: 'success', message: 'Done' })

// Dismiss it
toasts.remove('job')`,
    width: 600,
    actions: [
      {label: "create", demo: {kind: "managing-create"}, variant: "warn"},
      {label: "update", demo: {kind: "managing-update"}, variant: "success"},
      {label: "remove", demo: {kind: "managing-remove"}, variant: "error"},
    ],
  },
  {
    id: "pat-monitor",
    parent: "patterns",
    kind: "pattern",
    title: "Live Monitor",
    subtitle: "subscribe to toast list changes",
    blurb: "The counter below is wired live to onToastsListChange. Fire some toasts and watch it tick.",
    code: `const off = toasts.onToastsListChange((list) => {
  badge.value = list.length
})

// Stop listening later
off()`,
    width: 460,
    monitor: true,
    actions: [{label: "fire 3 toasts", demo: {kind: "monitoring"}, variant: "accent"}],
  },

  // ─── 05 · STYLING ──────────────────────────────────────────────
  {
    id: "styling",
    parent: "root",
    kind: "concept",
    index: "05",
    title: "Styling",
    subtitle: "tokens & classes",
    blurb: "Customize colors, radius, and typography with CSS variables or by passing custom classes to ToastsLiteProvider.",
    width: 340,
  },
  {
    id: "s-classes",
    parent: "styling",
    kind: "step",
    title: "Custom Classes",
    subtitle: "container · wrapper · item",
    blurb:
      "container-class for the toast container; wrapper-class for the toast wrapper; item-class for individual toast items.",
    code: `<ToastsLiteProvider
  container-class="custom-container"
  wrapper-class="custom-wrapper"
  item-class="custom-item"
/>`,
    lang: "xml",
    width: 400,
  },
  {
    id: "s-hide-close",
    parent: "styling",
    kind: "step",
    title: "Hide × on every toast",
    subtitle: "provider · hide-close-button",
    blurb:
      "Hides the × on every toast at once without disabling click-to-dismiss. Per-toast closable: false always wins.",
    code: `<ToastsLiteProvider :hide-close-button="true" />`,
    lang: "xml",
    width: 400,
  },
  {
    id: "s-vars",
    parent: "styling",
    kind: "step",
    title: "CSS Variables",
    subtitle: "design tokens",
    code: `:root {
  --tl-font-family: system-ui, -apple-system, sans-serif;
  --tl-font-size: 14px;
  --tl-radius: 20px;
  --tl-bg: hsl(0, 0%, 100%);
  --tl-text: hsl(0, 0%, 20%);
  --tl-border: hsl(0, 0%, 85%);
  --tl-shadow: hsla(0, 0%, 0%, 0.1);
  --tl-success: hsl(145, 63%, 42%);
  --tl-error: hsl(0, 79%, 63%);
  --tl-warn: hsl(45, 100%, 51%);
  --tl-info: hsl(210, 80%, 55%);
  --tl-icon-color: hsl(0, 0%, 100%);
  --tl-spinner-color: hsl(0, 0%, 15%);

  --tl-bg-success: color-mix(in srgb, var(--tl-success) 20%, var(--tl-bg));
  --tl-bg-error: color-mix(in srgb, var(--tl-error) 20%, var(--tl-bg));
  --tl-bg-warn: color-mix(in srgb, var(--tl-warn) 20%, var(--tl-bg));
  --tl-bg-info: color-mix(in srgb, var(--tl-info) 20%, var(--tl-bg));
  --tl-bg-loading: var(--tl-bg);

  --tl-border-success: color-mix(in srgb, var(--tl-success) 40%, var(--tl-border));
  --tl-border-error: color-mix(in srgb, var(--tl-error) 40%, var(--tl-border));
  --tl-border-warn: color-mix(in srgb, var(--tl-warn) 40%, var(--tl-border));
  --tl-border-info: color-mix(in srgb, var(--tl-info) 40%, var(--tl-border));

  --tl-text-success: color-mix(in srgb, var(--tl-success) 20%, var(--tl-text));
  --tl-text-error: color-mix(in srgb, var(--tl-error) 20%, var(--tl-text));
  --tl-text-warn: color-mix(in srgb, var(--tl-warn) 20%, var(--tl-text));
  --tl-text-info: color-mix(in srgb, var(--tl-info) 20%, var(--tl-text));
  --tl-text-loading: var(--tl-text);
}`,
    lang: "css",
    width: 620,
  },
]

export type GraphEdge = {from: string; to: string}

export const EDGES: GraphEdge[] = NODES.filter((n) => n.parent !== null).map((n) => ({from: n.parent!, to: n.id}))

export const NODE_BY_ID: Record<string, GraphNode> = Object.fromEntries(NODES.map((n) => [n.id, n]))

export const CHILDREN_OF: Record<string, string[]> = NODES.reduce<Record<string, string[]>>((acc, n) => {
  if (n.parent) {
    if (!acc[n.parent]) acc[n.parent] = []
    acc[n.parent].push(n.id)
  }
  return acc
}, {})

export function pathToRoot(id: string): string[] {
  const out: string[] = []
  let cur: string | null = id
  while (cur) {
    out.push(cur)
    cur = NODE_BY_ID[cur]?.parent ?? null
  }
  return out.reverse()
}

export function edgeId(e: GraphEdge): string {
  return `${e.from}::${e.to}`
}
