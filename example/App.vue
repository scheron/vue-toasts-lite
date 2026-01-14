<script setup lang="ts">
import type { ToastPosition, ToastType } from 'vue-toasts-lite'
import { toasts, ToastsLiteProvider } from 'vue-toasts-lite'
import 'vue-toasts-lite/style.css'

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
  const id = toasts.loading('Uploading...' )
  setTimeout(() => {
    toasts.update(id, { type: 'success', message: 'Upload complete!', duration: 3000 })
  }, 2000)
}

const showPromiseDemo = async () => {
  const fakeApiCall = () => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        Math.random() > 0.3 ? resolve('Data loaded!') : reject('Failed to load')
      }, 2000)
    })
  }

  try {
    await toasts.promise(fakeApiCall(), {
      loading: 'Loading data...',
      success: 'Data loaded successfully!',
      error: 'Failed to load data'
    })
  } catch (error) {
    // Error is handled by promise toast
  }
}

const clearAll = () => {
  toasts.clear()
}
</script>

<template>
  <div class="container">
    <h1>Vue Toasts Lite</h1>
    <p class="subtitle">Lightweight toast notifications for Vue 3</p>
    
    <div class="section">
      <h2>Basic Types</h2>
      <div class="buttons">
        <button class="btn-success" @click="showToast('success')">Success</button>
        <button class="btn-error" @click="showToast('error')">Error</button>
        <button class="btn-warn" @click="showToast('warn')">Warning</button>
        <button class="btn-loading" @click="showToast('loading')">Loading</button>
      </div>
    </div>

    <div class="section">
      <h2>Positions</h2>
      <div class="positions-grid">
        <div class="positions-row">
          <button class="btn-primary" @click="showPosition('top-left')">Top Left</button>
          <button class="btn-primary" @click="showPosition('top-center')">Top Center</button>
          <button class="btn-primary" @click="showPosition('top-right')">Top Right</button>
        </div>
        <div class="positions-row">
          <div class="positions-spacer"></div>
          <button class="btn-primary" @click="showPosition('middle-center')">Middle Center</button>
          <div class="positions-spacer"></div>
        </div>
        <div class="positions-row">
          <button class="btn-primary" @click="showPosition('bottom-left')">Bottom Left</button>
          <button class="btn-primary" @click="showPosition('bottom-center')">Bottom Center</button>
          <button class="btn-primary" @click="showPosition('bottom-right')">Bottom Right</button>
        </div>
      </div>
      <div class="buttons" style="margin-top: 1.5rem;">
        <button class="btn-primary" @click="showPositionDemo">Show All</button>
      </div>
    </div>

    <div class="section">
      <h2>Update Toast</h2>
      <div class="buttons">
        <button class="btn-primary" @click="showUpdateDemo">Loading → Success</button>
      </div>
    </div>

    <div class="section">
      <h2>Promise Support</h2>
      <div class="buttons">
        <button class="btn-primary" @click="showPromiseDemo">Try Promise</button>
      </div>
    </div>

    <div class="section">
      <div class="buttons">
        <button class="btn-clear" @click="clearAll">Clear All</button>
      </div>
    </div>

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

.container {
  max-width: 680px;
  margin: 0 auto;
  padding: 4rem 2rem;
}

h1 {
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
  margin-bottom: 4rem;
  letter-spacing: 0.01em;
}

.section {
  border-top: 1px solid #e5e5e5;
  padding: 2.5rem 0;
}

.section:first-of-type {
  border-top: none;
  padding-top: 0;
}

.section h2 {
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #999;
  margin-bottom: 1.5rem;
}

.buttons {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-start;
  flex-wrap: wrap;
}

button {
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

button:hover {
  border-color: #d0d0d0;
  background: #fafafa;
}

button:active {
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

.positions-grid {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
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

@media (max-width: 600px) {
  .container {
    padding: 3rem 1.5rem;
  }

  h1 {
    font-size: 2rem;
  }
  
  .subtitle {
    font-size: 0.875rem;
    margin-bottom: 3rem;
  }
  
  .section {
    padding: 2rem 0;
  }

  .section h2 {
    font-size: 0.7rem;
    margin-bottom: 1.25rem;
  }
  
  button {
    padding: 0.5625rem 1rem;
    font-size: 0.8125rem;
  }

  .buttons {
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