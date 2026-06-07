<script setup lang="ts">
import {computed} from "vue"

import {CHILDREN_OF, EDGES, pathToRoot} from "../data/graph"

import type {Dir, LayoutBounds, NodeLayout} from "../composables/useTreeLayout"

type Side = Dir

const props = defineProps<{
  positions: Record<string, NodeLayout>
  bounds: LayoutBounds
  directions: Record<string, Side>
  activeId: string | null
  hoverId: string | null
}>()

type Path = {
  id: string
  d: string
  px: number
  py: number
  cx: number
  cy: number
  mx: number
  my: number
  active: boolean
  hover: boolean
}

const activePath = computed(() => (props.activeId ? new Set(pathToRoot(props.activeId)) : new Set<string>()))
const hoverPath = computed(() => (props.hoverId ? new Set(pathToRoot(props.hoverId)) : new Set<string>()))

const fallbackSide = (p: NodeLayout, c: NodeLayout): Side => {
  const dx = c.cx - p.cx
  const dy = c.cy - p.cy
  return Math.abs(dx) >= Math.abs(dy) ? (dx >= 0 ? "E" : "W") : (dy >= 0 ? "S" : "N")
}

/**
 * Edge side comes from the layout (parent grew this child to the E/W/N/S),
 * so all children of one parent on one side share a consistent edge — no
 * top-attachments for cards that visually sit far above/below. Children are
 * then sorted along the orthogonal axis and the exit point is distributed
 * across the parent's grain.
 */
const edgeMeta = computed(() => {
  const meta: Record<string, {rank: number; total: number; side: Side}> = {}
  for (const parentId of Object.keys(CHILDREN_OF)) {
    const parent = props.positions[parentId]
    if (!parent) continue
    const kids = CHILDREN_OF[parentId] || []
    const groups: Record<Side, string[]> = {E: [], W: [], N: [], S: []}
    for (const kid of kids) {
      const c = props.positions[kid]
      if (!c) continue
      const side = props.directions[kid] ?? fallbackSide(parent, c)
      groups[side].push(kid)
    }
    for (const side of ["E", "W", "N", "S"] as Side[]) {
      const group = groups[side]
      if (!group.length) continue
      const sortKey: "cy" | "cx" = side === "E" || side === "W" ? "cy" : "cx"
      group.sort((a, b) => props.positions[a][sortKey] - props.positions[b][sortKey])
      group.forEach((kid, i) => {
        meta[`${parentId}::${kid}`] = {rank: i, total: group.length, side}
      })
    }
  }
  return meta
})

const ARM = 0.55

function curve(p: NodeLayout, c: NodeLayout, key: string) {
  const m = edgeMeta.value[key]
  const side: Side = m ? m.side : fallbackSide(p, c)
  const slot = m ? (m.rank + 1) / (m.total + 1) : 0.5

  let x1 = 0
  let y1 = 0
  let x2 = 0
  let y2 = 0
  let c1x = 0
  let c1y = 0
  let c2x = 0
  let c2y = 0

  if (side === "E") {
    x1 = p.x + p.width
    y1 = p.y + p.height * slot
    x2 = c.x
    y2 = c.cy
    const k = (x2 - x1) * ARM
    c1x = x1 + k
    c1y = y1
    c2x = x2 - k
    c2y = y2
  } else if (side === "W") {
    x1 = p.x
    y1 = p.y + p.height * slot
    x2 = c.x + c.width
    y2 = c.cy
    const k = (x1 - x2) * ARM
    c1x = x1 - k
    c1y = y1
    c2x = x2 + k
    c2y = y2
  } else if (side === "N") {
    x1 = p.x + p.width * slot
    y1 = p.y
    x2 = c.cx
    y2 = c.y + c.height
    const k = (y1 - y2) * ARM
    c1x = x1
    c1y = y1 - k
    c2x = x2
    c2y = y2 + k
  } else {
    x1 = p.x + p.width * slot
    y1 = p.y + p.height
    x2 = c.cx
    y2 = c.y
    const k = (y2 - y1) * ARM
    c1x = x1
    c1y = y1 + k
    c2x = x2
    c2y = y2 - k
  }

  return {
    x1,
    y1,
    x2,
    y2,
    d: `M ${x1} ${y1} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${x2} ${y2}`,
    mx: (x1 + x2) / 2,
    my: (y1 + y2) / 2,
  }
}

const paths = computed<Path[]>(() => {
  const out: Path[] = []
  for (const e of EDGES) {
    const p = props.positions[e.from]
    const c = props.positions[e.to]
    if (!p || !c) continue
    const key = `${e.from}::${e.to}`
    const cu = curve(p, c, key)
    out.push({
      id: key,
      d: cu.d,
      px: cu.x1,
      py: cu.y1,
      cx: cu.x2,
      cy: cu.y2,
      mx: cu.mx,
      my: cu.my,
      active: activePath.value.has(e.from) && activePath.value.has(e.to),
      hover: hoverPath.value.has(e.from) && hoverPath.value.has(e.to),
    })
  }
  return out
})

const viewBox = computed(() => `0 0 ${props.bounds.width} ${props.bounds.height}`)
</script>

<template>
  <svg
    class="edges-layer"
    :viewBox="viewBox"
    :width="bounds.width"
    :height="bounds.height"
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="none"
  >
    <g v-for="p in paths" :key="p.id" :class="['edge', {'edge-active': p.active, 'edge-hover': p.hover}]">
      <path :d="p.d" fill="none" />
      <circle class="port" :cx="p.px" :cy="p.py" :r="5" />
      <circle class="port" :cx="p.cx" :cy="p.cy" :r="5" />
    </g>
  </svg>
</template>

<style scoped>
.edges-layer {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
  overflow: visible;
  z-index: 0;
}

.edge path {
  stroke: var(--edge-stroke, rgba(10, 10, 10, 0.5));
  stroke-width: 1.4;
  transition: stroke 0.2s ease, stroke-width 0.2s ease;
  vector-effect: non-scaling-stroke;
}

.edge.edge-hover path {
  stroke: var(--ink, #0a0a0a);
  stroke-width: 2;
}

.edge.edge-active path {
  stroke: var(--accent, #c2410c);
  stroke-width: 2;
}

.edge .port {
  fill: var(--rule, #0a0a0a);
  transition: fill 0.18s ease;
}

.edge.edge-active .port {
  fill: var(--accent, #c2410c);
}
</style>
