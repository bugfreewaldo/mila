/**
 * Ring Buffer (Circular Buffer)
 *
 * Fixed-size buffer that overwrites oldest entries when full.
 * Used for storing vital sign history for sparkline charts.
 */

export class RingBuffer<T> {
  private buffer: (T | undefined)[];
  private head: number = 0;
  private tail: number = 0;
  private count: number = 0;
  private readonly capacity: number;

  constructor(capacity: number) {
    if (capacity < 1) {
      throw new Error("Ring buffer capacity must be at least 1");
    }
    this.capacity = capacity;
    this.buffer = new Array(capacity);
  }

  /**
   * Add an item to the buffer
   * If buffer is full, overwrites the oldest item
   */
  push(item: T): void {
    this.buffer[this.tail] = item;
    this.tail = (this.tail + 1) % this.capacity;

    if (this.count < this.capacity) {
      this.count++;
    } else {
      // Buffer is full, move head forward (oldest item overwritten)
      this.head = (this.head + 1) % this.capacity;
    }
  }

  /**
   * Get all items in order (oldest first)
   */
  toArray(): T[] {
    const result: T[] = [];
    for (let i = 0; i < this.count; i++) {
      const index = (this.head + i) % this.capacity;
      const item = this.buffer[index];
      if (item !== undefined) {
        result.push(item);
      }
    }
    return result;
  }

  /**
   * Get the most recent item
   */
  peek(): T | undefined {
    if (this.count === 0) return undefined;
    const index = (this.tail - 1 + this.capacity) % this.capacity;
    return this.buffer[index];
  }

  /**
   * Get the oldest item
   */
  peekOldest(): T | undefined {
    if (this.count === 0) return undefined;
    return this.buffer[this.head];
  }

  /**
   * Get the number of items in the buffer
   */
  size(): number {
    return this.count;
  }

  /**
   * Check if the buffer is empty
   */
  isEmpty(): boolean {
    return this.count === 0;
  }

  /**
   * Check if the buffer is full
   */
  isFull(): boolean {
    return this.count === this.capacity;
  }

  /**
   * Get the buffer capacity
   */
  getCapacity(): number {
    return this.capacity;
  }

  /**
   * Clear all items from the buffer
   */
  clear(): void {
    this.buffer = new Array(this.capacity);
    this.head = 0;
    this.tail = 0;
    this.count = 0;
  }

  /**
   * Get the last N items (most recent first)
   */
  getLastN(n: number): T[] {
    const items = this.toArray();
    return items.slice(-n).reverse();
  }
}
