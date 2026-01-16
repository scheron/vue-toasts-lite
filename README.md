# Vue Toasts Lite

[![npm version](https://badge.fury.io/js/vue-toasts-lite.svg)](https://www.npmjs.com/package/vue-toasts-lite)
[![Documentation](https://img.shields.io/badge/docs-available-brightgreen)](https://scheron.github.io/vue-toasts-lite/)

A lightweight toast notifications library for Vue 3.

📖 **[Check docs](https://scheron.github.io/vue-toasts-lite/)**

> ⚠️ **Note**: This is primarily a personal utility library created for my own use. I don't discourage others from using it, but I should mention that I'm not currently using it in production myself. The main purpose of this library is to provide me with a simple and quick way to integrate toast notifications into my personal projects without the need to configure and set up larger, more complex libraries. If you find it useful, feel free to use it, but keep in mind that it's tailored to my personal needs and workflow.


## Features

- 🚀 Lightweight and easy to use
- 🎨 Multiple toast types (success, error, loading, warn)
- 📍 Multiple positions (can show in different corners simultaneously)
- ⚡️ Customizable duration, auto-close, and styling
- 🎯 TypeScript support
- 🎯 Promise support
- 🖱️ Pause on hover

## Quick Start

### 1. Install the package:
```bash
npm install vue-toasts-lite
```

### 2. Add `ToastsLiteProvider` & `vue-toasts-lite/style.css` to app:

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

### 3. Use anywhere in your app:

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


## Styling

Customize colors and appearance with CSS variables or by passing custom classes to `ToastsLiteProvider`:

### Custom Classes

You can pass custom classes to `ToastsLiteProvider`:

```vue
<ToastsLiteProvider 
  container-class="custom-container"
  wrapper-class="custom-wrapper"
  item-class="custom-item"
/>
```

- `container-class` - class for toast container
- `wrapper-class` - class for toast wrapper
- `item-class` - class for individual toast items

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
