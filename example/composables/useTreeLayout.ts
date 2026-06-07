import {computed} from "vue"

import {CHILDREN_OF, NODE_BY_ID, NODES} from "../data/graph"

import type {ComputedRef} from "vue"
import type {GraphNode} from "../data/graph"

export type NodeSize = {width: number; height: number}

export type NodeLayout = NodeSize & {
  id: string
  x: number
  y: number
  cx: number
  cy: number
}

export type LayoutBounds = {minX: number; minY: number; maxX: number; maxY: number; width: number; height: number}

export type Dir = "E" | "W" | "N" | "S"

/**
 * Root spreads its concepts into different cardinal directions so the canvas
 * grows in every direction (the user said: don't compact everything into
 * one corner — let it breathe across the infinite plane).
 */
const ROOT_CHILD_DIRECTION: Record<string, Dir> = {
  "quick-start": "W",
  api: "N",
  options: "E",
  patterns: "S",
  styling: "W", // sits below quick-start in the W lane
}

const WIDTH_BY_KIND: Record<GraphNode["kind"], number> = {
  root: 320,
  concept: 320,
  subsection: 420,
  example: 320,
  pattern: 420,
  step: 380,
}

const HEADER_PX = 40
const TITLE_BLOCK_PX = 56
const BLURB_LINE_PX = 18
const BLURB_PAD_PX = 12
const CODE_LINE_PX = 18
const CODE_PAD_PX = 32
const METRICS_PX = 38
const BODY_PAD_PX = 30
const TABLE_HEAD_PX = 32
const TABLE_ROW_PX = 30
const ACTION_ROW_PX = 36
const ACTION_PILL_W = 96
const ACTIONS_GAP_PX = 12

function widthOf(n: GraphNode): number {
  return n.width ?? WIDTH_BY_KIND[n.kind] ?? 320
}

function nodeHeight(n: GraphNode): number {
  const w = widthOf(n)
  let h = HEADER_PX + BODY_PAD_PX + TITLE_BLOCK_PX + METRICS_PX
  if (n.blurb) {
    const avgChars = Math.max(1, Math.floor((w - 32) / 7.2))
    const blurbLines = Math.max(1, Math.ceil(n.blurb.length / avgChars))
    h += blurbLines * BLURB_LINE_PX + BLURB_PAD_PX
  }
  if (n.table) {
    h += TABLE_HEAD_PX + n.table.rows.length * TABLE_ROW_PX + 12
  }
  if (n.code) {
    const lines = n.code.split("\n").length
    h += lines * CODE_LINE_PX + CODE_PAD_PX
  }
  if (n.actions && n.actions.length) {
    if (n.actionsLayout === "anchor-grid") {
      h += 4 * ACTION_ROW_PX + ACTIONS_GAP_PX + 16
    } else {
      const innerW = w - 32
      const perRow = Math.max(1, Math.floor((innerW + 6) / (ACTION_PILL_W + 6)))
      const rows = Math.ceil(n.actions.length / perRow)
      h += rows * ACTION_ROW_PX + ACTIONS_GAP_PX
    }
  }
  if (n.monitor) h += 62
  return h
}

export function sizeOf(id: string): NodeSize {
  const n = NODE_BY_ID[id]
  return {width: widthOf(n), height: nodeHeight(n)}
}

const BASE_GAP = 240 // baseline gap in the direction-of-growth
const STAGGER = 110 // extra offset for staggered orbits
const STAGGER_CYCLE = 3 // children rotate through this many orbit lanes
const GAP_CROSS = 60 // gap between siblings on the cross-axis

// Each top-level concept's children land at its own characteristic distance —
// like planets at different orbital radii — so no two branches share a ring.
const CONCEPT_RADIUS: Record<string, number> = {
  "quick-start": 380,
  api: 520,
  options: 460,
  patterns: 360,
  styling: 260,
}

/** Lateral nudge for a top-level concept along its orbit's cross-axis
 *  (X for N/S branches, Y for E/W) — used to slide a section sideways
 *  when its column has more space than the layout could see. */
const CONCEPT_LATERAL_OFFSET: Record<string, number> = {
  patterns: 280,
}

/** Extra primary-axis gap injected between a concept card and its children
 *  — pushes the children further out from a particular parent. */
const CONCEPT_CHILD_GAP_BOOST: Record<string, number> = {
  patterns: 220,
}

const isHorizontal = (d: Dir) => d === "E" || d === "W"

/**
 * The cross-axis extent a subtree needs when planted in direction `dir`
 * (i.e. how tall it is when growing E/W; how wide it is when growing N/S).
 * Used to size sibling slots without overlap.
 */
function crossExtent(id: string, dir: Dir): number {
  const own = sizeOf(id)
  const ownCross = isHorizontal(dir) ? own.height : own.width
  const kids = CHILDREN_OF[id] || []
  if (!kids.length) return ownCross
  const childCross = kids.map((k) => crossExtent(k, dir))
  const total = childCross.reduce((a, b) => a + b, 0) + GAP_CROSS * (kids.length - 1)
  return Math.max(ownCross, total)
}

/** Primary-axis gap used when placing `kid` (index `i`) under `parentId` in
 *  direction `dir`. Concepts have their own concept-specific radius from root;
 *  siblings at any other level orbit at staggered radii so the eye sees rings
 *  not walls. */
function primaryGapFor(parentId: string, kidId: string, i: number, isRoot: boolean): number {
  if (isRoot) {
    return CONCEPT_RADIUS[kidId] ?? BASE_GAP
  }
  const boost = CONCEPT_CHILD_GAP_BOOST[parentId] ?? 0
  const lane = i % STAGGER_CYCLE
  return BASE_GAP + lane * STAGGER + boost
}

function computeLayout(rootId: string): {positions: Record<string, NodeLayout>; bounds: LayoutBounds; directionOf: Record<string, Dir>} {
  const positions: Record<string, NodeLayout> = {}
  const directionOf: Record<string, Dir> = {}

  const writePos = (id: string, cx: number, cy: number) => {
    const own = sizeOf(id)
    positions[id] = {
      id,
      width: own.width,
      height: own.height,
      x: cx - own.width / 2,
      y: cy - own.height / 2,
      cx,
      cy,
    }
  }

  const placeChildrenInDir = (parentId: string, dir: Dir, parentCx: number, parentCy: number, kids: string[]) => {
    const parent = sizeOf(parentId)
    const parentPrimaryHalf = isHorizontal(dir) ? parent.width / 2 : parent.height / 2
    const isRoot = parentId === rootId

    const kidExtents = kids.map((k) => crossExtent(k, dir))
    const total = kidExtents.reduce((a, b) => a + b, 0) + GAP_CROSS * (kids.length - 1)
    const base = (isHorizontal(dir) ? parentCy : parentCx) - total / 2

    let cursor = base
    for (let i = 0; i < kids.length; i++) {
      const kid = kids[i]
      const ks = sizeOf(kid)
      const center = cursor + kidExtents[i] / 2
      const halfPrim = isHorizontal(dir) ? ks.width / 2 : ks.height / 2
      const primaryGap = primaryGapFor(parentId, kid, i, isRoot)

      let kx = 0
      let ky = 0
      if (dir === "E") {
        kx = parentCx + parentPrimaryHalf + primaryGap + halfPrim
        ky = center
      } else if (dir === "W") {
        kx = parentCx - parentPrimaryHalf - primaryGap - halfPrim
        ky = center
      } else if (dir === "N") {
        kx = center
        ky = parentCy - parentPrimaryHalf - primaryGap - halfPrim
      } else if (dir === "S") {
        kx = center
        ky = parentCy + parentPrimaryHalf + primaryGap + halfPrim
      }

      if (isRoot && CONCEPT_LATERAL_OFFSET[kid]) {
        const off = CONCEPT_LATERAL_OFFSET[kid]
        if (isHorizontal(dir)) ky += off
        else kx += off
      }

      directionOf[kid] = dir
      place(kid, dir, kx, ky)
      cursor += kidExtents[i] + GAP_CROSS
    }
  }

  const place = (id: string, inheritedDir: Dir, cx: number, cy: number) => {
    writePos(id, cx, cy)
    const kids = CHILDREN_OF[id] || []
    if (!kids.length) return

    if (id === rootId) {
      const byDir: Record<Dir, string[]> = {E: [], W: [], N: [], S: []}
      for (const k of kids) {
        const d = ROOT_CHILD_DIRECTION[k] ?? "E"
        byDir[d].push(k)
      }
      for (const dir of ["E", "W", "N", "S"] as Dir[]) {
        if (byDir[dir].length) placeChildrenInDir(id, dir, cx, cy, byDir[dir])
      }
      return
    }

    placeChildrenInDir(id, inheritedDir, cx, cy, kids)
  }

  place(rootId, "E", 0, 0)

  const all = Object.values(positions)
  const minX = Math.min(...all.map((n) => n.x))
  const minY = Math.min(...all.map((n) => n.y))
  const maxX = Math.max(...all.map((n) => n.x + n.width))
  const maxY = Math.max(...all.map((n) => n.y + n.height))

  for (const id in positions) {
    positions[id].x -= minX
    positions[id].cx -= minX
    positions[id].y -= minY
    positions[id].cy -= minY
  }

  return {
    positions,
    directionOf,
    bounds: {minX: 0, minY: 0, maxX: maxX - minX, maxY: maxY - minY, width: maxX - minX, height: maxY - minY},
  }
}

export function useTreeLayout(): {
  positions: ComputedRef<Record<string, NodeLayout>>
  bounds: ComputedRef<LayoutBounds>
  directionOf: ComputedRef<Record<string, Dir>>
} {
  const layout = computed(() => {
    const rootId = NODES.find((n) => n.parent === null)?.id
    if (!rootId) {
      return {positions: {}, bounds: {minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0}, directionOf: {}}
    }
    return computeLayout(rootId)
  })

  return {
    positions: computed(() => layout.value.positions),
    bounds: computed(() => layout.value.bounds),
    directionOf: computed(() => layout.value.directionOf),
  }
}
