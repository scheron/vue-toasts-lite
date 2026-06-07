<script setup lang="ts">
import {computed, nextTick, onBeforeUnmount, onMounted, ref, watch} from "vue"
import {toasts} from "vue-toasts-lite"

import {NODE_BY_ID} from "../data/graph"
import {highlightInto} from "../composables/useHljs"

import type {DemoKind, GraphNode} from "../data/graph"
import type {NodeLayout} from "../composables/useTreeLayout"

const props = defineProps<{
  node: GraphNode
  layout: NodeLayout
  active: boolean
  onPath: boolean
  stepIndex: number
}>()

const emit = defineEmits<{
  (e: "select", id: string): void
  (e: "demo", demo: DemoKind): void
  (e: "hover", id: string | null): void
  (e: "copy", payload: {text: string; ok: boolean}): void
}>()

const copied = ref(false)
let copyTimer: ReturnType<typeof setTimeout> | null = null

const liveCount = ref(0)
let unsubscribeMonitor: (() => void) | null = null

onMounted(() => {
  if (!props.node.monitor) return
  liveCount.value = toasts.toastList.length
  unsubscribeMonitor = toasts.onToastsListChange((list) => {
    liveCount.value = list.length
  })
})

onBeforeUnmount(() => {
  if (unsubscribeMonitor) unsubscribeMonitor()
})

const copyCode = async (e: MouseEvent) => {
  e.stopPropagation()
  const text = props.node.code
  if (!text) return
  let ok = true
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    ok = false
  }
  if (ok) {
    copied.value = true
    if (copyTimer) clearTimeout(copyTimer)
    copyTimer = setTimeout(() => (copied.value = false), 1400)
  }
  emit("copy", {text, ok})
}

const style = computed(() => ({
  transform: `translate3d(${props.layout.x}px, ${props.layout.y}px, 0)`,
  width: `${props.layout.width}px`,
  minHeight: `${props.layout.height}px`,
}))

const headerColor = computed(() => {
  const n = props.node
  if (n.kind === "root") return "var(--accent)"
  if (n.kind === "concept") return "#1a1a1a"
  if (n.kind === "subsection") return "#1e3a3a"
  if (n.kind === "example") return "#2d4a87"
  if (n.kind === "pattern") return "#4a2d56"
  if (n.kind === "step") return "#3a3a3a"
  return "#1a1a1a"
})

const kindLabel = computed(() => {
  const k = props.node.kind
  if (k === "root") return "lib"
  if (k === "concept") return "sec"
  if (k === "subsection") return "sub"
  if (k === "example") return "ex"
  if (k === "pattern") return "flow"
  if (k === "step") return "step"
  return "leaf"
})

const ancestorPath = computed(() => {
  const ids: string[] = []
  let cur = props.node.parent
  while (cur) {
    ids.unshift(cur)
    cur = NODE_BY_ID[cur]?.parent ?? null
  }
  return ids.join(" / ") || "root"
})
const stepLabel = computed(() => String(props.stepIndex + 1).padStart(2, "0"))

const hasCode = computed(() => !!props.node.code)
const hasTable = computed(() => !!props.node.table)
const codeLang = computed(() => props.node.lang ?? "javascript")
const codeRef = ref<HTMLElement | null>(null)

const runHighlight = () => {
  if (codeRef.value) highlightInto(codeRef.value)
}

onMounted(() => {
  if (!props.node.code) return
  nextTick(runHighlight)
})

watch(
  () => props.node.code,
  () => {
    if (!props.node.code) return
    nextTick(runHighlight)
  },
)
const actions = computed(() => props.node.actions || [])
const isAnchorGrid = computed(() => props.node.actionsLayout === "anchor-grid")

const anchorClass = (label: string) => {
  if (!isAnchorGrid.value) return ""
  switch (label) {
    case "top-left":
      return "anchor-tl"
    case "top-center":
      return "anchor-tc"
    case "top-right":
      return "anchor-tr"
    case "middle-center":
      return "anchor-mc"
    case "bottom-left":
      return "anchor-bl"
    case "bottom-center":
      return "anchor-bc"
    case "bottom-right":
      return "anchor-br"
    default:
      return "anchor-extra"
  }
}

const handleClick = () => emit("select", props.node.id)
const handleAction = (e: MouseEvent, demo: DemoKind) => {
  e.stopPropagation()
  emit("demo", demo)
}
</script>

<template>
  <div
    data-tl-node
    class="node"
    :class="[`node-${node.kind}`, {'node-active': active, 'node-on-path': onPath && !active}]"
    :style="style"
    @click="handleClick"
    @pointerenter="emit('hover', node.id)"
    @pointerleave="emit('hover', null)"
  >
    <header class="head" :style="{background: headerColor}">
      <span class="head-step">{{ stepLabel }}</span>
      <span class="head-kind">{{ kindLabel }}</span>
    </header>

    <div class="body">
      <div class="title-row">
        <span v-if="node.index" class="title-index">{{ node.index }}</span>
        <h3 class="title">{{ node.title }}</h3>
      </div>
      <p v-if="node.subtitle" class="subtitle">{{ node.subtitle }}</p>
      <p v-if="node.blurb" class="blurb">{{ node.blurb }}</p>

      <table v-if="hasTable" class="ptable">
        <thead>
          <tr>
            <th v-for="col in node.table!.columns" :key="col">{{ col }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, ri) in node.table!.rows" :key="ri">
            <td v-for="(cell, ci) in row" :key="ci" :class="{'ptable-name': ci === 0}">{{ cell }}</td>
          </tr>
        </tbody>
      </table>

      <div v-if="hasCode" class="code-wrap">
        <pre class="code"><code ref="codeRef" :class="`language-${codeLang}`">{{ node.code }}</code></pre>
        <button class="code-copy" :class="{copied}" :aria-label="copied ? 'Copied' : 'Copy'" @click="copyCode">
          <svg v-if="!copied" width="11" height="11" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <rect x="3.5" y="3.5" width="7" height="7" rx="1" />
            <path d="M3.5 7.5V2.5h5" />
          </svg>
          <svg v-else width="11" height="11" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M3 7.5L6 10.5l5-6" />
          </svg>
          <span class="code-copy-text">{{ copied ? "copied" : "copy" }}</span>
        </button>
      </div>

      <div v-if="node.monitor" class="monitor">
        <span class="monitor-label">live toasts</span>
        <span class="monitor-count">{{ String(liveCount).padStart(2, "0") }}</span>
        <span class="monitor-dot" :class="{'monitor-dot-on': liveCount > 0}" aria-hidden="true" />
      </div>

      <div v-if="actions.length" :class="['actions', {'actions-anchor': isAnchorGrid}]">
        <button
          v-for="a in actions"
          :key="a.label"
          class="act"
          :class="[`act-${a.variant || 'default'}`, anchorClass(a.label)]"
          @click="(e) => handleAction(e, a.demo)"
        >
          <span class="act-bullet">▶</span>
          <span class="act-label">{{ a.label }}</span>
        </button>
      </div>
    </div>

    <footer class="metrics">
      <span class="metric-glyph">#</span>
      <span class="metric-path">{{ ancestorPath }}</span>
    </footer>
  </div>
</template>

<style scoped>
.node {
  position: absolute;
  top: 0;
  left: 0;
  background: var(--surface, #faf8f4);
  border: 1px solid var(--border-card, rgba(10, 10, 10, 0.18));
  border-radius: 10px;
  font-family: var(--mono, "Geist Mono", monospace);
  color: var(--ink, #0a0a0a);
  user-select: none;
  cursor: pointer;
  z-index: 1;
  will-change: transform;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: var(--shadow-card, 0 1px 3px rgba(0, 0, 0, 0.05), 0 8px 24px rgba(0, 0, 0, 0.06));
  transition: box-shadow 0.18s ease, border-color 0.18s ease;
}

.node:hover {
  box-shadow: var(--shadow-card-hover, 0 2px 4px rgba(0, 0, 0, 0.06), 0 16px 36px rgba(0, 0, 0, 0.1));
}

.node-on-path {
  border-color: color-mix(in srgb, var(--accent, #c2410c) 60%, var(--border-card, rgba(10, 10, 10, 0.2)));
}

.node-active {
  border-color: var(--accent, #c2410c);
  box-shadow: 0 0 0 2px var(--accent, #c2410c), 0 18px 48px rgba(0, 0, 0, 0.2);
  z-index: 10;
}

.head {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  color: #ffffff;
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.head-step {
  font-variant-numeric: tabular-nums;
  opacity: 0.85;
}

.head-kind {
  padding: 2px 8px;
  background: rgba(255, 255, 255, 0.18);
  border-radius: 3px;
  font-size: 9px;
}

.body {
  padding: 16px 16px 14px;
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
}

.title-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.title-index {
  font-size: 12px;
  color: var(--accent, #c2410c);
  font-weight: 600;
}

.title {
  font-size: 17px;
  font-weight: 600;
  line-height: 1.2;
  letter-spacing: -0.01em;
  word-break: break-word;
  margin: 0;
}

.node-root .title {
  font-size: 22px;
}

.node-concept .title {
  font-size: 19px;
}

.subtitle {
  font-size: 10px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--muted, #6b6b6b);
  margin: 0;
}

.blurb {
  font-size: 12px;
  line-height: 1.55;
  color: var(--ink, #0a0a0a);
  opacity: 0.82;
  margin: 0;
}

/* Parameter table */
.ptable {
  width: 100%;
  border-collapse: collapse;
  font-size: 10.5px;
  font-family: var(--mono, "Geist Mono", monospace);
}

.ptable thead th {
  text-align: left;
  font-weight: 500;
  font-size: 9.5px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--muted, #6b6b6b);
  padding: 6px 8px;
  border-top: 1px solid var(--border-card, rgba(10, 10, 10, 0.12));
  border-bottom: 1px solid var(--border-card, rgba(10, 10, 10, 0.12));
}

.ptable tbody td {
  padding: 7px 8px;
  border-bottom: 1px solid var(--border-soft, rgba(10, 10, 10, 0.06));
  color: var(--ink, #0a0a0a);
  opacity: 0.9;
  vertical-align: top;
  line-height: 1.4;
}

.ptable tbody tr:last-child td {
  border-bottom: none;
}

.ptable-name {
  font-weight: 600;
  color: var(--ink, #0a0a0a);
}

.code-wrap {
  position: relative;
}

.code {
  background: #0d1117;
  color: #e6edf3;
  padding: 11px 13px;
  border-radius: 4px;
  margin: 0;
  overflow-x: auto;
  font-family: var(--mono, "Geist Mono", monospace);
  font-size: 10.5px;
  line-height: 1.55;
  white-space: pre;
  max-width: 100%;
}

.code code {
  font-family: inherit;
}

.code-copy {
  position: absolute;
  top: 6px;
  right: 6px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: rgba(230, 237, 243, 0.85);
  font-family: var(--mono, "Geist Mono", monospace);
  font-size: 9.5px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  padding: 4px 7px 4px 6px;
  border-radius: 3px;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease, opacity 0.15s ease;
  opacity: 0;
}

.code-wrap:hover .code-copy,
.code-copy:focus-visible,
.code-copy.copied {
  opacity: 1;
}

.code-copy:hover {
  background: rgba(255, 255, 255, 0.16);
  color: #fff;
  border-color: rgba(255, 255, 255, 0.22);
}

.code-copy.copied {
  background: rgba(46, 125, 79, 0.22);
  border-color: rgba(46, 125, 79, 0.55);
  color: #b6e7c8;
}

.code-copy-text {
  line-height: 1;
}

.monitor {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: var(--surface-faint, rgba(10, 10, 10, 0.04));
  border: 1px solid var(--border-soft, rgba(10, 10, 10, 0.1));
  border-radius: 4px;
  font-family: var(--mono, "Geist Mono", monospace);
  align-self: flex-start;
}

.monitor-label {
  font-size: 9.5px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--muted, #6b6b6b);
}

.monitor-count {
  font-size: 22px;
  font-weight: 600;
  line-height: 1;
  color: var(--ink, #0a0a0a);
  font-variant-numeric: tabular-nums;
}

.monitor-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--border-card, rgba(10, 10, 10, 0.18));
  transition: background 0.2s ease, box-shadow 0.2s ease;
}

.monitor-dot-on {
  background: #2e7d4f;
  box-shadow: 0 0 0 3px rgba(46, 125, 79, 0.18);
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 2px;
}

.actions-anchor {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-areas:
    "tl tc tr"
    ".  mc . "
    "bl bc br"
    "ex ex ex";
  gap: 8px;
}

.actions-anchor .act {
  justify-content: center;
}

.anchor-tl {
  grid-area: tl;
}
.anchor-tc {
  grid-area: tc;
}
.anchor-tr {
  grid-area: tr;
}
.anchor-mc {
  grid-area: mc;
}
.anchor-bl {
  grid-area: bl;
}
.anchor-bc {
  grid-area: bc;
}
.anchor-br {
  grid-area: br;
}
.anchor-extra {
  grid-area: ex;
  justify-self: center;
}

.act {
  background: transparent;
  border: 1px solid var(--border-card, rgba(10, 10, 10, 0.2));
  color: var(--ink, #0a0a0a);
  font-family: var(--mono, "Geist Mono", monospace);
  font-size: 10px;
  font-weight: 500;
  text-transform: lowercase;
  letter-spacing: 0.04em;
  padding: 6px 10px;
  cursor: pointer;
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease, transform 0.1s ease;
}

.act:hover {
  background: var(--ink, #0a0a0a);
  color: var(--paper, #faf8f4);
  border-color: var(--ink, #0a0a0a);
}

.act:active {
  transform: translateY(1px);
}

.act-bullet {
  font-size: 7.5px;
  opacity: 0.5;
}

.act:hover .act-bullet {
  opacity: 0.85;
}

.act-success {
  border-color: rgba(46, 125, 79, 0.4);
}
.act-success:hover {
  background: #2e7d4f;
  border-color: #2e7d4f;
  color: var(--paper);
}

.act-error {
  border-color: rgba(179, 51, 28, 0.4);
}
.act-error:hover {
  background: #b3331c;
  border-color: #b3331c;
  color: var(--paper);
}

.act-warn {
  border-color: rgba(184, 120, 0, 0.4);
}
.act-warn:hover {
  background: #b87800;
  border-color: #b87800;
  color: var(--paper);
}

.act-info {
  border-color: rgba(40, 100, 168, 0.4);
}
.act-info:hover {
  background: #2864a8;
  border-color: #2864a8;
  color: var(--paper);
}

.act-loading {
  border-color: rgba(64, 64, 64, 0.4);
}
.act-loading:hover {
  background: #404040;
  border-color: #404040;
  color: var(--paper);
}

.act-accent {
  border-color: rgba(194, 65, 12, 0.5);
  color: var(--accent, #c2410c);
}
.act-accent:hover {
  background: var(--accent, #c2410c);
  border-color: var(--accent, #c2410c);
  color: var(--paper);
}

.act-muted {
  color: var(--muted, #6b6b6b);
  border-color: var(--border-soft, rgba(10, 10, 10, 0.1));
}
.act-muted:hover {
  background: var(--muted, #6b6b6b);
  border-color: var(--muted, #6b6b6b);
  color: var(--paper);
}

.metrics {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: var(--surface-soft, rgba(10, 10, 10, 0.03));
  border-top: 1px solid var(--border-soft, rgba(10, 10, 10, 0.08));
  font-size: 10px;
  letter-spacing: 0.04em;
  color: var(--muted, rgba(10, 10, 10, 0.65));
  min-width: 0;
}

.metric-glyph {
  flex: 0 0 auto;
  font-size: 11px;
  color: var(--muted, rgba(10, 10, 10, 0.5));
  opacity: 0.85;
}

.metric-path {
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
