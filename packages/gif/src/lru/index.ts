export interface Options<KeyType, ValueType> {
	/**
	The maximum number of milliseconds an item should remain in the cache.

	@default Infinity

	By default, `maxAge` will be `Infinity`, which means that items will never expire.
	Lazy expiration upon the next write or read call.

	Individual expiration of an item can be specified by the `set(key, value, maxAge)` method.
	*/
	readonly maxAge?: number;

	/**
	The maximum number of items before evicting the least recently used items.
	*/
	readonly maxSize: number;

	/**
	Called right before an item is evicted from the cache.

	Useful for side effects or for items like object URLs that need explicit cleanup (`revokeObjectURL`).
	*/
	onEviction?: (key: KeyType, value: ValueType) => void;
}

type MapValue<ValueType> = {
	value: ValueType;
	expiry?: number;
};

export class QuickLRU<KeyType, ValueType>
	implements Iterable<[KeyType, ValueType]>
{
	/**
	The maximum number of milliseconds an item should remain in the cache.

	@default Infinity

	By default, `maxAge` will be `Infinity`, which means that items will never expire.
	Lazy expiration upon the next write or read call.

	Individual expiration of an item can be specified by the `set(key, value, maxAge)` method.
	*/
	maxAge: number;

	/**
	The maximum number of items before evicting the least recently used items.
	*/
	maxSize: number;

	/**
	Called right before an item is evicted from the cache.

	Useful for side effects or for items like object URLs that need explicit cleanup (`revokeObjectURL`).
	*/
	onEviction?: (key: KeyType, value: ValueType) => void;

	private _size: number;
	private cache: Map<KeyType, MapValue<ValueType>>;
	private oldCache: Map<KeyType, MapValue<ValueType>>;

	/**
	Simple ["Least Recently Used" (LRU) cache](https://en.m.wikipedia.org/wiki/Cache_replacement_policies#Least_Recently_Used_.28LRU.29).

	The instance is an [`Iterable`](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Iteration_protocols) of `[key, value]` pairs so you can use it directly in a [`for…of`](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Statements/for...of) loop.

	@example
	```
	import { QuickLRU } from 'quick-lru-ts';

	const lru = new QuickLRU({maxSize: 1000});

	lru.set('🦄', '🌈');

	lru.has('🦄');
	//=> true

	lru.get('🦄');
	//=> '🌈'
	```
	*/
	constructor(options: Options<KeyType, ValueType>) {
		if (!(options.maxSize && options.maxSize > 0)) {
			throw new TypeError('`maxSize` must be a number greater than 0');
		}

		if (typeof options.maxAge === 'number' && options.maxAge === 0) {
			throw new TypeError('`maxAge` must be a number greater than 0');
		}

		this.maxSize = options.maxSize;
		this.maxAge = options.maxAge || Number.POSITIVE_INFINITY;
		this.onEviction = options.onEviction;
		this.cache = new Map();
		this.oldCache = new Map();
		this._size = 0;
	}

	private _emitEvictions(
		cache: Map<KeyType, MapValue<ValueType>> | [KeyType, MapValue<ValueType>][],
	) {
		if (typeof this.onEviction !== 'function') {
			return;
		}

		for (const [key, item] of cache) {
			this.onEviction(key, item.value);
		}
	}

	private _deleteIfExpired(
		key: KeyType,
		item: MapValue<ValueType> | undefined,
	) {
		if (item === undefined) return true;
		if (typeof item.expiry === 'number' && item.expiry <= Date.now()) {
			if (typeof this.onEviction === 'function') {
				this.onEviction(key, item.value);
			}

			return this.delete(key);
		}

		return false;
	}

	private _getOrDeleteIfExpired(key: KeyType, item: MapValue<ValueType>) {
		const deleted = this._deleteIfExpired(key, item);
		if (deleted === false) {
			return item.value;
		}
	}

	private _getItemValue(key: KeyType, item: MapValue<ValueType> | undefined) {
		if (item === undefined) return undefined;
		return item.expiry ? this._getOrDeleteIfExpired(key, item) : item.value;
	}

	private _peek(key: KeyType, cache: Map<KeyType, MapValue<ValueType>>) {
		const item = cache.get(key);

		return this._getItemValue(key, item);
	}

	private _set(key: KeyType, value: MapValue<ValueType>) {
		this.cache.set(key, value);
		this._size++;

		if (this._size >= this.maxSize) {
			this._size = 0;
			this._emitEvictions(this.oldCache);
			this.oldCache = this.cache;
			this.cache = new Map();
		}
	}

	private _moveToRecent(key: KeyType, item: MapValue<ValueType>) {
		this.oldCache.delete(key);
		this._set(key, item);
	}

	private *_entriesAscending() {
		for (const item of this.oldCache) {
			const [key, value] = item;
			if (!this.cache.has(key)) {
				const deleted = this._deleteIfExpired(key, value);
				if (deleted === false) {
					yield item;
				}
			}
		}

		for (const item of this.cache) {
			const [key, value] = item;
			const deleted = this._deleteIfExpired(key, value);
			if (deleted === false) {
				yield item;
			}
		}
	}

	/**
	Get an item.

	@returns The stored item or `undefined`.
	*/
	get(key: KeyType): ValueType | undefined {
		if (this.cache.has(key)) {
			const item = this.cache.get(key);

			return this._getItemValue(key, item);
		}

		if (this.oldCache.has(key)) {
			const item = this.oldCache.get(key);
			if (this._deleteIfExpired(key, item) === false) {
				this._moveToRecent(key, item as MapValue<ValueType>);
				return (item as MapValue<ValueType>).value;
			}
		}
	}

	set(
		key: KeyType,
		value: ValueType,
		{maxAge = this.maxAge}: {maxAge?: number} = {},
	) {
		const expiry =
			typeof maxAge === 'number' && maxAge !== Number.POSITIVE_INFINITY
				? Date.now() + maxAge
				: undefined;
		if (this.cache.has(key)) {
			this.cache.set(key, {
				value,
				expiry,
			});
		} else {
			this._set(key, {value, expiry});
		}
	}

	has(key: KeyType) {
		if (this.cache.has(key)) {
			return !this._deleteIfExpired(key, this.cache.get(key));
		}

		if (this.oldCache.has(key)) {
			return !this._deleteIfExpired(key, this.oldCache.get(key));
		}

		return false;
	}

	peek(key: KeyType) {
		if (this.cache.has(key)) {
			return this._peek(key, this.cache);
		}

		if (this.oldCache.has(key)) {
			return this._peek(key, this.oldCache);
		}
	}

	delete(key: KeyType) {
		const deleted = this.cache.delete(key);
		if (deleted) {
			this._size--;
		}

		return this.oldCache.delete(key) || deleted;
	}

	clear() {
		this.cache.clear();
		this.oldCache.clear();
		this._size = 0;
	}

	resize(maxSize: number) {
		if (!(maxSize && maxSize > 0)) {
			throw new TypeError('`maxSize` must be a number greater than 0');
		}

		const items = [...this._entriesAscending()];
		const removeCount = items.length - maxSize;
		if (removeCount < 0) {
			this.cache = new Map(items);
			this.oldCache = new Map();
			this._size = items.length;
		} else {
			if (removeCount > 0) {
				this._emitEvictions(items.slice(0, removeCount));
			}

			this.oldCache = new Map(items.slice(removeCount));
			this.cache = new Map();
			this._size = 0;
		}

		this.maxSize = maxSize;
	}

	*keys() {
		for (const [key] of this) {
			yield key;
		}
	}

	*values() {
		for (const [, value] of this) {
			yield value;
		}
	}

	*[Symbol.iterator](): IterableIterator<[KeyType, ValueType]> {
		for (const item of this.cache) {
			const [key, value] = item;
			const deleted = this._deleteIfExpired(key, value);
			if (deleted === false) {
				yield [key, value.value];
			}
		}

		for (const item of this.oldCache) {
			const [key, value] = item;
			if (!this.cache.has(key)) {
				const deleted = this._deleteIfExpired(key, value);
				if (deleted === false) {
					yield [key, value.value];
				}
			}
		}
	}

	/**
	Iterable for all entries, starting with the newest (descending in recency).
	*/
	*entriesDescending(): IterableIterator<[KeyType, ValueType]> {
		let items = [...this.cache];
		for (let i = items.length - 1; i >= 0; --i) {
			const item = items[i];
			const [key, value] = item;
			const deleted = this._deleteIfExpired(key, value);
			if (deleted === false) {
				yield [key, value.value];
			}
		}

		items = [...this.oldCache];
		for (let i = items.length - 1; i >= 0; --i) {
			const item = items[i];
			const [key, value] = item;
			if (!this.cache.has(key)) {
				const deleted = this._deleteIfExpired(key, value);
				if (deleted === false) {
					yield [key, value.value];
				}
			}
		}
	}

	*entriesAscending() {
		for (const [key, value] of this._entriesAscending()) {
			yield [key, value.value];
		}
	}

	get size(): number {
		if (!this._size) {
			return this.oldCache.size;
		}

		let oldCacheSize = 0;
		for (const key of this.oldCache.keys()) {
			if (!this.cache.has(key)) {
				oldCacheSize++;
			}
		}

		return Math.min(this._size + oldCacheSize, this.maxSize);
	}
}
