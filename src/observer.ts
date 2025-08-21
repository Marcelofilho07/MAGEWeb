export class Observer<T = void> {
  private listeners: Array<(value: T) => void> = [];

  subscribe(fn: (value: T) => void): () => void {
    this.listeners.push(fn);

    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== fn);
    };
  }

  emit(value: T) {
    this.listeners.forEach(fn => fn(value));
  }
}
