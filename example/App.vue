<script setup lang="ts">
import { onMounted, nextTick } from 'vue'
import type { ToastPosition, ToastType } from 'vue-toasts-lite'
import { toasts, ToastsLiteProvider } from 'vue-toasts-lite'
import 'vue-toasts-lite/style.css'
import hljs from 'highlight.js/lib/core'
import javascript from 'highlight.js/lib/languages/javascript'
import xml from 'highlight.js/lib/languages/xml'
import css from 'highlight.js/lib/languages/css'
import bash from 'highlight.js/lib/languages/bash'
import 'highlight.js/styles/github-dark.css'

// Register languages
hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('xml', xml)
hljs.registerLanguage('css', css)
hljs.registerLanguage('bash', bash)

// Highlight code blocks
const highlightCode = () => {
  nextTick(() => {
    document.querySelectorAll('pre code').forEach((block) => {
      // Remove existing highlighting
      block.removeAttribute('data-highlighted')
      hljs.highlightElement(block as HTMLElement)
    })
  })
}

onMounted(() => {
  highlightCode()
})

const showToast = (type: ToastType) => {
  if (type === 'success') {
    toasts.success(`This is a ${type} toast`, { duration: 3000 })
  } else if (type === 'error') {
    toasts.error(`This is an ${type} toast`, { duration: 3000 })
  } else if (type === 'loading') {
    toasts.loading(`This is a ${type} toast`, { duration: 3000 })
  } else {
    toasts.warn(`This is a ${type} toast`, { duration: 3000 })
  }
}

const showPosition = (position: ToastPosition) => {
  const messages: Record<ToastPosition, string> = {
    'top-left': 'Top Left',
    'top-center': 'Top Center',
    'top-right': 'Top Right',
    'bottom-left': 'Bottom Left',
    'bottom-center': 'Bottom Center',
    'bottom-right': 'Bottom Right',
    'middle-center': 'Middle Center'
  }
  toasts.success(messages[position], { position, duration: 3000 })
}

const showPositionDemo = () => {
  toasts.success('Top Left', { position: 'top-left' })
  toasts.error('Top Center', { position: 'top-center' })
  toasts.warn('Top Right', { position: 'top-right' })
  toasts.loading('Bottom Left', { position: 'bottom-left' })
  toasts.success('Bottom Center', { position: 'bottom-center' })
  toasts.error('Bottom Right', { position: 'bottom-right' })
}

const showUpdateDemo = () => {
  const id = toasts.loading('Uploading...')
  setTimeout(() => {
    toasts.update(id, { type: 'success', message: 'Done!', duration: 3000 })
  }, 2000)
}

const showPromiseDemo = async () => {
  const fetchData = () => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        Math.random() > 0.5 ? resolve('Data loaded!') : reject('Failed to load')
      }, 2000)
    })
  }

  try {
    await toasts.promise(fetchData(), {
      loading: 'Loading...',
      success: 'Loaded!',
      error: 'Failed!'
    })
  } catch (error) {
    // Error is handled by promise toast
  }
}

const showCustomDuration = () => {
  toasts.success('Success!', { duration: 5000, position: 'bottom-right' })
}

let customToastId: string | null = null

const showCustomId = () => {
  if (customToastId) {
    toasts.remove(customToastId)
  }
  customToastId = toasts.add({
    message: 'Custom toast',
    type: 'success',
    id: 'my-custom-id',
    autoClose: false
  })
}

const updateCustomToast = () => {
  if (customToastId) {
    toasts.update(customToastId, { type: 'success', message: 'Done!' })
  }
}

const removeCustomId = () => {
  if (customToastId) {
    toasts.remove(customToastId)
    customToastId = null
  }
}

const clearAll = () => {
  toasts.clear()
}
</script>

<template>
  <div class="docs-container">
    <!-- Hero Section -->
    <header class="hero">
      <h1 class="title">Vue Toasts Lite</h1>
      <p class="subtitle">A lightweight toast notifications library for Vue 3</p>
      <div class="badges">
        <a href="https://www.npmjs.com/package/vue-toasts-lite" target="_blank" class="badge">
          <img src="https://badge.fury.io/js/vue-toasts-lite.svg" alt="npm version">
        </a>
      </div>
    </header>

    <!-- Quick Start -->
    <section class="section">
      <h2>Quick Start</h2>
        <h3>1. Install the package</h3>
      <pre class="code-block"><code class="language-bash">npm install vue-toasts-lite</code></pre>
        <h3>2. Add <code class="inline-code">ToastsLiteProvider</code> & <code class="inline-code">vue-toasts-lite/style.css</code> to your app</h3>
      <pre class="code-block"><code class="language-xml">&lt;script setup&gt;
import { ToastsLiteProvider } from 'vue-toasts-lite'
import 'vue-toasts-lite/style.css'
&lt;/script&gt;

&lt;template&gt;
  &lt;div&gt;
    &lt;RouterView /&gt;
    &lt;ToastsLiteProvider /&gt;
  &lt;/div&gt;
&lt;/template&gt;</code></pre>

      <h3>3. Use anywhere in your app:</h3>
      <pre class="code-block"><code class="language-xml">&lt;script setup&gt;
import { toasts } from 'vue-toasts-lite'

toasts.success('Hello!')
toasts.error('Something went wrong')
toasts.loading('Loading...')
toasts.warn('Warning message')
&lt;/script&gt;</code></pre>

      <div class="demo-buttons">
        <button class="btn btn-success" @click="showToast('success')">Try Success</button>
        <button class="btn btn-error" @click="showToast('error')">Try Error</button>
        <button class="btn btn-warn" @click="showToast('warn')">Try Warning</button>
        <button class="btn btn-loading" @click="showToast('loading')">Try Loading</button>
      </div>
    </section>

    <!-- API -->
    <section class="section">
      <h2>API</h2>
      <pre class="code-block"><code class="language-javascript">// Basic methods
toasts.success(message, options?)
toasts.error(message, options?)
toasts.loading(message, options?)
toasts.warn(message, options?)

// Advanced methods
toasts.add(options)              // Create custom toast
toasts.update(id, options)       // Update existing toast
toasts.remove(id?)               // Remove toast(s)
toasts.clear()                   // Clear all toasts
toasts.promise(promise, options) // Handle promise states</code></pre>
    </section>

    <!-- Options -->
    <section class="section">
      <h2>Options</h2>
      <div class="table-wrapper">
        <table class="options-table">
          <thead>
            <tr>
              <th>Option</th>
              <th>Type</th>
              <th>Default</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code class="inline-code">message</code></td>
              <td><code class="inline-code">string</code></td>
              <td>-</td>
              <td>Message to display</td>
            </tr>
            <tr>
              <td><code class="inline-code">type</code></td>
              <td><code class="inline-code">'success' | 'error' | 'loading' | 'warn'</code></td>
              <td><code class="inline-code">'success'</code></td>
              <td>Toast type</td>
            </tr>
            <tr>
              <td><code class="inline-code">duration</code></td>
              <td><code class="inline-code">number</code></td>
              <td><code class="inline-code">3000</code></td>
              <td>Duration in milliseconds</td>
            </tr>
            <tr>
              <td><code class="inline-code">autoClose</code></td>
              <td><code class="inline-code">boolean</code></td>
              <td><code class="inline-code">true</code></td>
              <td>Auto-close behavior</td>
            </tr>
            <tr>
              <td><code class="inline-code">position</code></td>
              <td><code class="inline-code">ToastPosition</code></td>
              <td><code class="inline-code">'top-center'</code></td>
              <td>Toast position</td>
            </tr>
            <tr>
              <td><code class="inline-code">id</code></td>
              <td><code class="inline-code">string</code></td>
              <td>auto</td>
              <td>Custom ID</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3>Available Positions</h3>
      <pre class="code-block"><code class="language-javascript">type ToastPosition = "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right" | "middle-center"</code></pre>
      
      <div class="positions-grid">
        <div class="positions-row">
          <button class="btn btn-primary" @click="showPosition('top-left')">Top Left</button>
          <button class="btn btn-primary" @click="showPosition('top-center')">Top Center</button>
          <button class="btn btn-primary" @click="showPosition('top-right')">Top Right</button>
        </div>
        <div class="positions-row">
          <div class="positions-spacer"></div>
          <button class="btn btn-primary" @click="showPosition('middle-center')">Middle Center</button>
          <div class="positions-spacer"></div>
        </div>
        <div class="positions-row">
          <button class="btn btn-primary" @click="showPosition('bottom-left')">Bottom Left</button>
          <button class="btn btn-primary" @click="showPosition('bottom-center')">Bottom Center</button>
          <button class="btn btn-primary" @click="showPosition('bottom-right')">Bottom Right</button>
        </div>
      </div>

      <div class="demo-buttons" style="margin-top: 1.5rem; flex-direction: column;">
        <button class="btn btn-primary" @click="showPositionDemo" style="width: 100%;">Show All</button>
        <button class="btn btn-clear" @click="clearAll">Clear</button>
      </div>
    </section>

    <!-- Examples -->
    <section class="section">
      <h2>Examples</h2>

      <!-- Basic Usage -->
      <h3>Basic Usage</h3>
      <pre class="code-block"><code class="language-javascript">// With options
toasts.success('Success!', { duration: 5000, position: 'bottom-right' })

// Multiple positions at once
toasts.success('Top', { position: 'top-center' })
toasts.error('Bottom', { position: 'bottom-right' })</code></pre>

      <div class="demo-buttons">
        <button class="btn btn-primary" @click="showCustomDuration">Custom Duration (5s)</button>
        <button class="btn btn-primary" @click="showPositionDemo">Multiple Positions</button>
      </div>

      <!-- Update Toasts -->
      <h3>Update Toasts</h3>
      <pre class="code-block"><code class="language-javascript">const id = toasts.loading('Uploading...')
// Later
toasts.update(id, { type: 'success', message: 'Done!' })</code></pre>

      <div class="demo-buttons">
        <button class="btn btn-primary" @click="showUpdateDemo">Loading → Success</button>
      </div>

      <!-- Promise Support -->
      <h3>Promise Support</h3>
      <pre class="code-block"><code class="language-javascript">await toasts.promise(
  fetchData(),
  {
    loading: 'Loading...',
    success: 'Loaded!',
    error: 'Failed!'
  }
)</code></pre>

      <div class="demo-buttons">
        <button class="btn btn-primary" @click="showPromiseDemo">Try Promise (50% success)</button>
      </div>

      <!-- Advanced: Custom ID and Remove -->
      <h3>Advanced: Custom ID and Remove</h3>
      <pre class="code-block"><code class="language-javascript">// Create with custom ID
const id = toasts.add({
  message: 'Custom toast',
  type: 'success',
  id: 'my-custom-id',
  autoClose: false
})

// Update by ID
toasts.update(id, { type: 'success', message: 'Done!' })

// Remove by ID
toasts.remove(id)

// Clear all
toasts.clear()</code></pre>

      <div class="demo-buttons">
        <button class="btn btn-primary" @click="showCustomId">Add (Custom ID)</button>
        <button class="btn btn-warn" @click="updateCustomToast">Update by ID</button>
        <button class="btn btn-error" @click="removeCustomId">Remove by ID</button>
      </div>
    </section>

    <!-- Styling -->
    <section class="section">
      <h2>Styling</h2>
      <p>Customize colors and appearance with CSS variables:</p>

      <h3>CSS Variables</h3>
      <pre class="code-block"><code class="language-css">:root {
  --tl-font-family: system-ui, -apple-system, sans-serif;
  --tl-bg: hsl(0, 0%, 100%);
  --tl-text: hsl(0, 0%, 20%);
  --tl-border: hsl(0, 0%, 85%);
  --tl-shadow: hsla(0, 0%, 0%, 0.1);
  --tl-success: hsl(145, 63%, 42%);
  --tl-error: hsl(0, 79%, 63%);
  --tl-warn: hsl(45, 100%, 51%);
  --tl-icon-color: hsl(0, 0%, 100%);
  --tl-loading-border: hsl(0, 0%, 15%);
  --tl-loading-bg: hsl(0, 0%, 98%);
}</code></pre>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <p>Docs Vibe Coded with Claude</p>
      <p>
        <a href="https://github.com/scheron/vue-toasts-lite" target="_blank" class="link">GitHub</a>
        ·
        <a href="https://www.npmjs.com/package/vue-toasts-lite" target="_blank" class="link">npm</a>
      </p>
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

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
  background: #fafafa;
  min-height: 100vh;
  color: #1a1a1a;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.docs-container {
  max-width: 680px;
  margin: 0 auto;
  padding: 4rem 2rem;
  line-height: 1.6;
}

/* Hero Section */
.hero {
  text-align: center;
  padding: 0 0 4rem;
  border-bottom: 1px solid #e5e5e5;
  margin-bottom: 2.5rem;
}

.title {
  font-size: 2.5rem;
  font-weight: 300;
  letter-spacing: -0.02em;
  margin-bottom: 0.5rem;
  color: #1a1a1a;
  line-height: 1.2;
}

.subtitle {
  font-size: 0.95rem;
  font-weight: 400;
  color: #666;
  margin-bottom: 2rem;
  letter-spacing: 0.01em;
}

.badges {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  align-items: center;
}

.badge img {
  height: 20px;
}

/* Sections */
.section {
  margin-bottom: 2.5rem;
  padding-bottom: 2.5rem;
  border-bottom: 1px solid #e5e5e5;
}

.section:last-of-type {
  border-bottom: none;
}

.section h2 {
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #999;
  margin-bottom: 1.5rem;
}

.section h3 {
  font-size: 0.875rem;
  font-weight: 500;
  margin: 2rem 0 1rem;
  color: #666;
}

.section p {
  margin-bottom: 1rem;
  color: #666;
  font-size: 0.9375rem;
}

/* Lists */
.steps-list {
  padding-left: 1.5rem;
  margin-bottom: 1.5rem;
}

.steps-list li {
  margin-bottom: 0.5rem;
  color: #666;
  font-size: 0.9375rem;
}

/* Code Blocks */
.code-block {
  background: #0d1117;
  padding: 1.25rem;
  border-radius: 4px;
  overflow-x: auto;
  margin: 1rem 0 1.5rem;
  border: 1px solid #e5e5e5;
}

.code-block code {
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 0.8125rem;
  line-height: 1.6;
  color: #e6edf3;
}

.code-block code.hljs {
  padding: 0;
  background: transparent;
}

.inline-code {
  background: #f5f5f5;
  color: #1a1a1a;
  padding: 0.15rem 0.4rem;
  border-radius: 3px;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 0.875em;
  border: 1px solid #e5e5e5;
}

/* Table */
.table-wrapper {
  overflow-x: auto;
  margin: 1.5rem 0;
}

.options-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border: 1px solid #e5e5e5;
  border-radius: 4px;
}

.options-table thead {
  background: #fafafa;
}

.options-table th {
  padding: 0.625rem 0.875rem;
  text-align: left;
  font-weight: 500;
  color: #1a1a1a;
  border-bottom: 1px solid #e5e5e5;
  font-size: 0.8125rem;
}

.options-table td {
  padding: 0.625rem 0.875rem;
  border-bottom: 1px solid #f5f5f5;
  color: #666;
  font-size: 0.8125rem;
}

.options-table tbody tr:last-child td {
  border-bottom: none;
}

.options-table tbody tr:hover {
  background: #fafafa;
}

/* Buttons */
.demo-buttons {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin: 1.5rem 0;
}

.btn {
  padding: 0.625rem 1.25rem;
  border: 1px solid #e5e5e5;
  border-radius: 4px;
  background: #ffffff;
  color: #1a1a1a;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 400;
  transition: all 0.15s ease;
  font-family: inherit;
  letter-spacing: 0.01em;
}

.btn:hover {
  border-color: #d0d0d0;
  background: #fafafa;
}

.btn:active {
  background: #f5f5f5;
}

.btn-success {
  border-color: #e5e5e5;
  color: #1a1a1a;
}

.btn-success:hover {
  border-color: #4CAF50;
  color: #4CAF50;
}

.btn-error {
  border-color: #e5e5e5;
  color: #1a1a1a;
}

.btn-error:hover {
  border-color: #f44336;
  color: #f44336;
}

.btn-warn {
  border-color: #e5e5e5;
  color: #1a1a1a;
}

.btn-warn:hover {
  border-color: #ff9800;
  color: #ff9800;
}

.btn-loading {
  border-color: #e5e5e5;
  color: #1a1a1a;
}

.btn-loading:hover {
  border-color: #2196F3;
  color: #2196F3;
}

.btn-primary {
  border-color: #e5e5e5;
  color: #1a1a1a;
}

.btn-primary:hover {
  border-color: #1a1a1a;
  background: #1a1a1a;
  color: #ffffff;
}

.btn-clear {
  border-color: #e5e5e5;
  color: #999;
}

.btn-clear:hover {
  border-color: #999;
  background: #999;
  color: #ffffff;
}

/* Positions Grid */
.positions-grid {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  margin: 1.5rem 0;
}

.positions-row {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  align-items: center;
}

.positions-spacer {
  width: calc(0.625rem + 1.25rem * 2 + 1px);
  height: calc(0.625rem * 2 + 1em * 0.875 * 1.2);
}

/* Footer */
.footer {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid #e5e5e5;
  text-align: center;
  color: #999;
}

.footer p {
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.link {
  color: #1a1a1a;
  text-decoration: none;
  transition: color 0.2s;
}

.link:hover {
  color: #666;
}

/* Responsive */
@media (max-width: 600px) {
  .docs-container {
    padding: 3rem 1.5rem;
  }

  .hero {
    padding: 0 0 3rem;
  }

  .title {
    font-size: 2rem;
  }

  .subtitle {
    font-size: 0.875rem;
  }

  .section {
    padding-bottom: 2rem;
  }

  .section h2 {
    font-size: 0.7rem;
    margin-bottom: 1.25rem;
  }

  .section h3 {
    font-size: 0.8125rem;
  }

  .code-block {
    padding: 1rem;
  }

  .code-block code {
    font-size: 0.75rem;
  }

  .btn {
    padding: 0.5625rem 1rem;
    font-size: 0.8125rem;
  }

  .demo-buttons {
    gap: 0.5rem;
  }

  .positions-row {
    gap: 0.5rem;
  }

  .positions-spacer {
    width: calc(0.5625rem + 1rem * 2 + 1px);
    height: calc(0.5625rem * 2 + 1em * 0.8125 * 1.2);
  }
}
</style>
