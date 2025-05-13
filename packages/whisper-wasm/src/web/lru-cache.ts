/**
 * A simple Least Recently Used (LRU) cache implementation in JavaScript.
 * This cache stores key-value pairs and evicts the least recently used item
 * when the capacity is exceeded.
 */
export class LRUCache<K = any, V = any> {
	private capacity: number;
	private cache: Map<K, V>;

	/**
	 * Creates an LRUCache instance.
	 * @param capacity The maximum number of items the cache can hold.
	 */
	constructor(capacity: number) {
		this.capacity = capacity;
		this.cache = new Map();
	}

	/**
	 * Retrieves the value associated with the given key and marks the key as recently used.
	 * @param key The key to retrieve.
	 * @returns The value associated with the key, or undefined if the key does not exist.
	 */
	get(key: K): V | undefined {
		if (!this.cache.has(key)) return undefined;
		const value = this.cache.get(key)!;
		this.cache.delete(key);
		this.cache.set(key, value);
		return value;
	}

	/**
	 * Inserts or updates the key-value pair in the cache.
	 * If the key already exists, it is updated and marked as recently used.
	 * If the cache exceeds its capacity, the least recently used item is evicted.
	 * @param key The key to add or update.
	 * @param value The value to associate with the key.
	 */
	put(key: K, value: V): void {
		if (this.cache.has(key)) {
			this.cache.delete(key);
		}

		this.cache.set(key, value);
		if (this.cache.size > this.capacity) {
			this.cache.delete(this.cache.keys().next().value!);
		}
	}

	/**
	 * Clears the cache.
	 */
	clear(): void {
		this.cache.clear();
	}
}
