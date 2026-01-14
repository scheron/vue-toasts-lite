export class ObservableMap<K, V> extends Map<K, V> {
  private subscribers: ((map: V[]) => void)[] = []

  set(key: K, value: V): this {
    super.set(key, value)
    this.notify()
    return this
  }

  delete(key: K): boolean {
    const result = super.delete(key)
    this.notify()
    return result
  }

  clear(): void {
    super.clear()
    this.notify()
  }

  subscribe(callback: (map: V[]) => void): () => void {
    this.subscribers.push(callback)

    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback)
    }
  }

  private notify() {
    this.subscribers.forEach(callback => callback(Array.from(this.values())))
  }
}

