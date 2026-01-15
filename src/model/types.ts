export type ToastType = "success" | "loading" | "error" | "warn"
export type ToastPosition = "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right" | "middle-center"

export type Toast = {
  /**
   * Unique identifier for the toast.
   * Auto-generated if not provided when creating a toast.
   */
  id: Id

  /**
   * Visual type of the toast notification.
   * Determines the icon and color scheme.
   * @default "success"
   */
  type: ToastType

  /**
   * Text content displayed in the toast.
   * @default "Hello from Toasts Lite"
   */
  message: string

  /**
   * Whether the toast should automatically close after {@link duration} milliseconds.
   * @default true
   */
  autoClose: boolean

  /**
   * Time in milliseconds before the toast auto-closes.
   * Only applies when {@link autoClose} is `true`.
   * @default 3000
   */
  duration: number

  /**
   * Position of the toast on the screen.
   * @default "top-center"
   */
  position?: ToastPosition
}

export type Id = string
export type ToastOptions = Partial<Toast>
export type ToastSimpleOptions = Partial<Omit<Toast, "message">>

export type ToastPromiseOptions = {
  /** Message displayed while the promise is pending */
  loading: string
  /** Message displayed when the promise resolves successfully */
  success: string
  /** Message displayed when the promise rejects */
  error: string
  /** Optional position for the toast on the screen */
  position?: ToastPosition
  /** Optional custom ID for the toast */
  id?: Id
}

export interface IToastsController {
  add: (options: ToastOptions) => Id
  update: (id: Id, options: ToastOptions) => Id
  success: (message: string, options?: ToastSimpleOptions) => Id
  loading: (message: string, options?: ToastSimpleOptions) => Id
  error: (message: string, options?: ToastSimpleOptions) => Id
  warn: (message: string, options?: ToastSimpleOptions) => Id
  promise: <T>(promise: Promise<T>, options: ToastPromiseOptions) => Promise<Id>
  remove: (id?: Id) => void
  clear: () => void
  onToastsListChange: (callback: (toasts: Toast[]) => void) => () => void
}
