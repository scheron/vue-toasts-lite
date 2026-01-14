# Vue Toasts Lite

A lightweight toast notifications library for Vue 3.

## Features

- 🚀 Lightweight and easy to use
- 🎨 Multiple toast types (success, error, loading, warn)
- 📍 Multiple positions (can show in different corners simultaneously)
- ⚡️ Customizable duration, auto-close, and styling
- 🎯 TypeScript support
- 🎯 Promise support
- 🖱️ Pause on hover

## Installation

```bash
npm install vue-toasts-lite
```

## Quick Start

**Three steps to start using toasts:**

1. Install the package
2. Add `ToastsLiteProvider` to your app
3. Call `toasts.success()` from anywhere

### 1. Add the provider to your `App.vue`:

```vue
<script setup>
import { ToastsLiteProvider } from 'vue-toasts-lite'
import 'vue-toasts-lite/style.css'
</script>

<template>
  <div>
    <RouterView />
    <ToastsLiteProvider />
  </div>
</template>
```

### 2. Use anywhere in your app:

```vue
<script setup>
import { toasts } from 'vue-toasts-lite'

toasts.success('Hello!')
toasts.error('Something went wrong')
toasts.loading('Loading...')
toasts.warn('Warning message')
</script>
```

## API

```js
// Basic methods
toasts.success(message, options?)
toasts.error(message, options?)
toasts.loading(message, options?)
toasts.warn(message, options?)

// Advanced methods
toasts.add(options)              // Create custom toast
toasts.update(id, options)       // Update existing toast
toasts.remove(id?)               // Remove toast(s)
toasts.clear()                   // Clear all toasts
toasts.promise(promise, options) // Handle promise states
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `message` | `string` | - | Message to display |
| `type` | `'success' \| 'error' \| 'loading' \| 'warn'` | `'success'` | Toast type |
| `duration` | `number` | `3000` | Duration in milliseconds |
| `autoClose` | `boolean` | `true` | Auto-close behavior |
| `position` | `ToastPosition` | `'top-center'` | Toast position |
| `id` | `string` | auto | Custom ID |

### Available Positions

`top-left`, `top-center`, `top-right`, `bottom-left`, `bottom-center`, `bottom-right`, `middle-center`

## Examples

### Basic Usage

```js
// With options
toasts.success('Success!', { duration: 5000, position: 'bottom-right' })

// Multiple positions at once
toasts.success('Top', { position: 'top-center' })
toasts.error('Bottom', { position: 'bottom-right' })
```

### Update Toasts

```js
const id = toasts.loading('Uploading...')
// Later
toasts.update(id, { type: 'success', message: 'Done!' })
```

### Promise Support

```js
await toasts.promise(
  fetchData(),
  {
    loading: 'Loading...',
    success: 'Loaded!',
    error: 'Failed!'
  }
)
```

### Custom Controller

```js
import { ToastsController } from 'vue-toasts-lite'

const notifications = new ToastsController()
notifications.success('Hello!')
```

## Styling

Customize colors and appearance with CSS variables:

### CSS Variables

```css
:root {
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
}
```

## License

MIT
