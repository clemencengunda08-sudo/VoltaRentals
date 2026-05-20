'use client';

type Listener = (data: any) => void;

class ErrorEmitter {
  private listeners: Map<string, Listener[]> = new Map();

  /**
   * Register a listener for a specific event.
   * Returns an unsubscribe function.
   */
  on(event: string, listener: Listener) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(listener);
    
    return () => {
      const arr = this.listeners.get(event);
      if (arr) {
        this.listeners.set(event, arr.filter(l => l !== listener));
      }
    };
  }

  /**
   * Emit an event with data to all registered listeners.
   */
  emit(event: string, data: any) {
    const arr = this.listeners.get(event);
    if (arr) {
      arr.forEach(l => l(data));
    }
  }
}

export const errorEmitter = new ErrorEmitter();
