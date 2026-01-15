import {ObservableMap} from "./ObservableMap"

import type {Id, IToastsController, Toast, ToastOptions, ToastPromiseOptions, ToastSimpleOptions} from "./types"

const DEFAULT_OPTIONS = {
  type: "success",
  message: "Hello from Toasts Lite",
  autoClose: true,
  duration: 3000,
  position: "top-center",
}

export class ToastsController implements IToastsController {
  private counter = 0
  private toasts: ObservableMap<Id, Toast>

  constructor() {
    this.toasts = new ObservableMap()
  }

  /**
   * Returns an array of all currently active toasts.
   * @description Useful for debugging or external monitoring
   *
   * @returns Array of toast properties for all active toasts
   */
  get toastList() {
    return Array.from(this.toasts.values())
  }

  /**
   * Subscribes to changes in the toast list.
   *
   * @param callback - Function called whenever toasts are added, updated, or removed
   * @returns Unsubscribe function to stop listening for changes
   *
   * @example
   * ```ts
   * const unsubscribe = toasts.onToastsListChange((toastsList) => {
   *   console.log('Toasts updated:', toastsList)
   * })
   *
   * // Later, to stop listening:
   * unsubscribe()
   * ```
   */
  public onToastsListChange(callback: (toasts: Toast[]) => void) {
    return this.toasts.subscribe(callback)
  }

  /**
   * Creates a toast notification with custom options. If toast with the same ID already exists, it will be updated.
   * @description Use this method when you need full control over toast configuration.
   * @description For simpler use cases, consider using {@link success}, {@link error}, {@link warn}, or {@link loading} methods.
   *
   * @param options - Configuration options for the toast
   * @returns Unique identifier of the created toast
   *
   * @example
   * ```ts
   * // Create a custom toast
   * const id = toasts.add({
   *   type: 'success',
   *   message: 'Custom notification',
   *   duration: 5000,
   *   position: 'top-right',
   *   autoClose: true
   * })
   *
   * // Create with custom ID for later reference
   * toasts.add({ id: 'my-toast', type: 'loading', message: 'Processing...' })
   * ```
   */
  public add(options: ToastOptions) {
    return this.addOrUpdate(options)
  }

  /**
   * Updates an existing toast notification by its ID.
   * @description Useful for changing the content or appearance of a toast that is already displayed, such as updating a loading toast to show success or error state.
   *
   * @param id - Unique identifier of the toast to update
   * @param options - New configuration options to apply
   * @returns The same toast ID
   *
   * @example
   * ```ts
   * // Create a loading toast
   * const id = toasts.loading('Uploading file...')
   *
   * // Later, update it to show success
   * toasts.update(id, { type: 'success', message: 'File uploaded!' })
   * ```
   */
  public update(id: Id, options: ToastOptions) {
    return this.addOrUpdate({...options, id})
  }

  /**
   * Removes a toast notification from the screen.
   * @description If no ID is provided, all currently visible toasts will be removed. If the specified ID doesn't exist, this method does nothing.
   *
   * @param id - Optional unique identifier of the toast to remove.
   *             If omitted, all toasts are removed.
   *
   * @example
   * ```ts
   * // Remove a specific toast
   * const id = toasts.success('Hello!')
   * toasts.remove(id)
   *
   * // Remove all toasts
   * toasts.remove()
   * ```
   *
   * @see {@link clear} for explicitly removing all toasts
   */
  public remove(id?: Id) {
    if (id && !this.toasts.has(id)) return

    if (id) this.toasts.delete(id)
    else this.clear()
  }

  /**
   * Removes all currently visible toast notifications.
   *
   * @example
   * ```ts
   * // Clear all toasts on route change
   * router.beforeEach(() => {
   *   toasts.clear()
   * })
   * ```
   */
  public clear() {
    this.toasts.clear()
  }

  /**
   * Displays a **success** toast notification.
   *
   * @param message - Text content to display in the toast
   * @param options - Optional configuration (position, duration, autoClose, id)
   * @returns Unique identifier of the created toast
   *
   * @example
   * ```ts
   * // Simple success message
   * toasts.success('Changes saved successfully!')
   *
   * // With custom options
   * toasts.success('Profile updated', {
   *   duration: 5000,
   *   position: 'bottom-center'
   * })
   * ```
   */
  public success(message: string, options?: Omit<ToastSimpleOptions, "type">) {
    return this.addOrUpdate({...options, message, type: "success"})
  }

  /**
   * Displays an **error** toast notification.
   *
   * @param message - Text content to display in the toast
   * @param options - Optional configuration (position, duration, autoClose, id)
   * @returns Unique identifier of the created toast
   *
   * @example
   * ```ts
   * // Simple error message
   * toasts.error('Failed to save changes')
   *
   * // Non-auto-closing error
   * toasts.error('Critical error occurred', { autoClose: false })
   * ```
   */
  public error(message: string, options?: Omit<ToastSimpleOptions, "type">) {
    return this.addOrUpdate({...options, message, type: "error"})
  }

  /**
   * Displays a **warning** toast notification.
   *
   * @param message - Text content to display in the toast
   * @param options - Optional configuration (position, duration, autoClose, id)
   * @returns Unique identifier of the created toast
   *
   * @example
   * ```ts
   * // Simple warning message
   * toasts.warn('Your session will expire soon')
   *
   * // With longer duration
   * toasts.warn('Unsaved changes detected', { duration: 10000 })
   * ```
   */
  public warn(message: string, options?: Omit<ToastSimpleOptions, "type">) {
    return this.addOrUpdate({...options, message, type: "warn"})
  }

  /**
   * Displays a **loading** toast notification.
   *
   * Loading toasts are typically used as placeholders while
   * an async operation is in progress.
   *
   * @param message - Text content to display in the toast
   * @param options - Optional configuration (position, duration, autoClose, id)
   * @returns Unique identifier of the created toast
   *
   * @example
   * ```ts
   * // Manual loading state management
   * const id = toasts.loading('Saving...')
   *
   * try {
   *   await saveData()
   *   toasts.update(id, { type: 'success', message: 'Saved!' })
   * } catch {
   *   toasts.update(id, { type: 'error', message: 'Save failed' })
   * }
   * ```
   *
   * @see {@link promise} for automatic promise-based state management
   */
  public loading(message: string, options?: Omit<ToastSimpleOptions, "type">) {
    return this.addOrUpdate({...options, message, type: "loading"})
  }

  /**
   * Displays a **promise** toast that automatically updates based on promise resolution.
   *
   * Shows a loading toast while the promise is pending, then automatically
   * transitions to success or error state based on the promise outcome.
   *
   * @template T - Type of the promise result
   * @param promise - The promise to track
   * @param options - Messages for each state and optional positioning
   * @param options.loading - Message to show while promise is pending
   * @param options.success - Message to show when promise resolves
   * @param options.error - Message to show when promise rejects
   * @param options.position - Optional toast position on screen
   * @param options.id - Optional custom ID for the toast
   * @returns Promise that resolves to the toast ID
   * @throws Error with the error message if the promise rejects
   *
   * @example
   * ```ts
   * // Basic usage
   * await toasts.promise(fetchUserData(), {
   *   loading: 'Loading user data...',
   *   success: 'User data loaded!',
   *   error: 'Failed to load user data'
   * })
   *
   * // With custom position
   * await toasts.promise(uploadFile(file), {
   *   loading: 'Uploading...',
   *   success: 'File uploaded successfully!',
   *   error: 'Upload failed',
   *   position: 'bottom-right'
   * })
   * ```
   */
  public async promise<T>(promise: Promise<T>, options: ToastPromiseOptions) {
    const id = this.loading(options.loading, {position: options.position, id: options.id})

    try {
      await promise
      this.success(options.success, {position: options.position, id})
      return id
    } catch {
      this.error(options.error, {position: options.position, id})
      throw new Error(options.error)
    }
  }

  private ID() {
    return `toast:${Date.now().toString(16)}-${this.counter++}`
  }

  private addOrUpdate(_options: ToastOptions): Id {
    let {id = this.ID(), ...options} = _options

    if (this.toasts.has(id)) {
      const toast = this.toasts.get(id)!
      Object.assign(toast, options)
      this.toasts.set(id, toast)
      return id
    }

    this.toasts.set(id, {...this.mergeWithDefaultOptions(options), id} as Toast)
    return id
  }

  private mergeWithDefaultOptions(options: Partial<ToastOptions>) {
    const newOptions = Object.assign({}, DEFAULT_OPTIONS) as ToastOptions

    for (let k in DEFAULT_OPTIONS) {
      const key = k as keyof ToastOptions
      const value = options[key]

      if (value !== undefined && value !== null) {
        // @ts-ignore - We know that the key is a valid key of ToastOptions
        newOptions[key] = value
      }
    }

    return newOptions
  }
}

/**
 * Main toast controller instance.
 * @example
 * ```ts
 * import { toasts } from 'vue-toasts-lite'
 *
 * toasts.success('Hello, World!')
 * ```
 */
export const toastsController = new ToastsController()
