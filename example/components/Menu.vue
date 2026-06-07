<script setup lang="ts">
import {computed} from "vue"

import {CHILDREN_OF, NODE_BY_ID, NODES} from "../data/graph"

import type {GraphNode} from "../data/graph"

defineProps<{activeId: string | null}>()

const emit = defineEmits<{(e: "jump", id: string): void}>()

const root = computed(() => NODES.find((n) => n.parent === null) || null)
const concepts = computed(() => (root.value ? CHILDREN_OF[root.value.id] || [] : []))
const childrenOf = (id: string): string[] => CHILDREN_OF[id] || []

const jump = (id: string) => emit("jump", id)

const kindGlyph = (n: GraphNode) => {
  if (n.kind === "root") return "◐"
  if (n.kind === "concept") return "◆"
  if (n.kind === "subsection") return "◇"
  if (n.kind === "example") return "▸"
  if (n.kind === "pattern") return "≋"
  if (n.kind === "step") return "·"
  return "·"
}
</script>

<template>
  <aside class="menu">
    <div class="menu-head">contents</div>

    <div class="menu-body">
      <ul class="m-list">
        <li v-for="cid in concepts" :key="cid" class="m-l1">
          <button class="m-link m-section" :class="{active: activeId === cid}" @click="jump(cid)">
            <span class="m-glyph">{{ kindGlyph(NODE_BY_ID[cid]) }}</span>
            <span class="m-num">{{ NODE_BY_ID[cid].index || "" }}</span>
            <span class="m-title">{{ NODE_BY_ID[cid].title }}</span>
          </button>

          <ul v-if="childrenOf(cid).length" class="m-list m-sub">
            <li v-for="kid in childrenOf(cid)" :key="kid" class="m-l2">
              <button class="m-link" :class="{active: activeId === kid}" @click="jump(kid)">
                <span class="m-glyph">{{ kindGlyph(NODE_BY_ID[kid]) }}</span>
                <span class="m-title">{{ NODE_BY_ID[kid].title }}</span>
              </button>
            </li>
          </ul>
        </li>
      </ul>
    </div>
  </aside>
</template>

<style scoped>
.menu {
  position: fixed;
  top: 56px;
  left: 20px;
  z-index: 90;
  background: var(--surface, #faf8f4);
  border: 1px solid var(--rule, #1a1a1a);
  border-radius: 6px;
  width: 240px;
  max-height: calc(100vh - 200px);
  display: flex;
  flex-direction: column;
  font-family: var(--mono, "Geist Mono", monospace);
  color: var(--ink, #0a0a0a);
  box-shadow: var(--shadow-card, 0 4px 24px rgba(0, 0, 0, 0.06));
  overflow: hidden;
}

.menu-head {
  border-bottom: 1px solid var(--rule, #1a1a1a);
  color: var(--muted, #6b6b6b);
  font-family: inherit;
  font-size: 10px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  padding: 10px 14px;
}

.menu-body {
  overflow-y: auto;
  flex: 1;
  padding: 8px 0;
}

.menu-body::-webkit-scrollbar {
  width: 4px;
}
.menu-body::-webkit-scrollbar-thumb {
  background: var(--border-card, rgba(10, 10, 10, 0.18));
  border-radius: 2px;
}

.m-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.m-link {
  display: flex;
  width: 100%;
  background: transparent;
  border: none;
  color: var(--ink, #0a0a0a);
  font-family: inherit;
  font-size: 11px;
  text-align: left;
  padding: 6px 12px;
  cursor: pointer;
  align-items: center;
  gap: 8px;
  min-width: 0;
  transition: background 0.15s ease, color 0.15s ease;
}

.m-link:hover {
  background: var(--surface-faint, rgba(10, 10, 10, 0.05));
}

.m-link.active {
  background: var(--ink, #0a0a0a);
  color: var(--paper, #faf8f4);
}

.m-link.active .m-glyph,
.m-link.active .m-num {
  color: inherit;
  opacity: 0.85;
}

.m-section {
  font-weight: 600;
  padding-top: 8px;
  padding-bottom: 8px;
}

.m-glyph {
  flex: 0 0 auto;
  font-size: 11px;
  width: 12px;
  text-align: center;
  color: var(--accent, #c2410c);
  opacity: 0.85;
}

.m-num {
  flex: 0 0 auto;
  font-size: 10px;
  font-weight: 500;
  color: var(--muted, #6b6b6b);
  letter-spacing: 0.04em;
  font-variant-numeric: tabular-nums;
  min-width: 18px;
}

.m-title {
  flex: 1 1 auto;
  font-size: 11px;
  letter-spacing: 0.02em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.m-sub {
  padding-left: 14px;
  border-left: 1px solid var(--border-soft, rgba(10, 10, 10, 0.08));
  margin-left: 18px;
  margin-bottom: 6px;
}

.m-l2 .m-link {
  font-size: 10.5px;
  padding: 4px 10px;
  color: var(--ink, rgba(10, 10, 10, 0.78));
  opacity: 0.85;
}

.m-l2 .m-link.active {
  color: var(--paper, #faf8f4);
  opacity: 1;
}

@media (max-width: 720px) {
  .menu {
    width: 200px;
    left: 12px;
    max-height: 50vh;
  }
}
</style>
