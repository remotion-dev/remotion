/**
 * Efficient Heap-based Implementation of a Priority Queue.
 * It uses an array-based binary heap, where the root is at index `0`, and the
 * children of node `i` are located at indices `2i + 1` and `2i + 2`, respectively.
 *
 * Adapted from the following sources:
 * - https://stackoverflow.com/a/42919752/13989043 (original)
 * - https://github.com/belladoreai/llama-tokenizer-js (minor improvements)
 */
export class PriorityQueue<T = any> {
	private _heap: T[];
	private _comparator: (a: T, b: T) => boolean;
	private _maxSize: number;

	/**
	 * Create a new PriorityQueue.
	 * @param comparator Comparator function to determine priority. Defaults to a MaxHeap.
	 */
	constructor(
		comparator: (a: T, b: T) => boolean = (a, b) => a > b,
		maxSize: number = Infinity,
	) {
		this._heap = [];
		this._comparator = comparator;
		this._maxSize = maxSize;
	}

	/**
	 * The size of the queue
	 */
	get size(): number {
		return this._heap.length;
	}

	/**
	 * Check if the queue is empty.
	 * @returns `true` if the queue is empty, `false` otherwise.
	 */
	isEmpty(): boolean {
		return this.size === 0;
	}

	/**
	 * Return the element with the highest priority in the queue.
	 * @returns The highest priority element in the queue.
	 */
	peek(): T {
		return this._heap[0];
	}

	/**
	 * Add one or more elements to the queue.
	 * @param values The values to push into the queue.
	 * @returns The new size of the queue.
	 */
	push(...values: T[]): number {
		return this.extend(values);
	}

	/**
	 * Add multiple elements to the queue.
	 * @param values The values to push into the queue.
	 * @returns The new size of the queue.
	 */
	extend(values: T[]): number {
		for (const value of values) {
			if (this.size < this._maxSize) {
				this._heap.push(value);
				this._siftUp();
			} else {
				// Get index of value with the lowest priority
				const smallest = this._smallest();

				// If the new value has higher priority than the smallest value in the heap
				// then replace the smallest value with the new value and update the heap
				if (this._comparator(value, this._heap[smallest])) {
					this._heap[smallest] = value;
					this._siftUpFrom(smallest);
				}
			}
		}

		return this.size;
	}

	/**
	 * Remove and return the element with the highest priority in the queue.
	 * @returns The element with the highest priority in the queue.
	 */
	pop(): T {
		const poppedValue = this.peek();
		const bottom = this.size - 1;
		if (bottom > 0) {
			this._swap(0, bottom);
		}

		this._heap.pop();
		this._siftDown();
		return poppedValue;
	}

	/**
	 * Replace the element with the highest priority in the queue with a new value.
	 * @param value The new value.
	 * @returns The replaced value.
	 */
	replace(value: T): T {
		const replacedValue = this.peek();
		this._heap[0] = value;
		this._siftDown();
		return replacedValue;
	}

	/**
	 * Compute the index for the parent of the node at index `i`.
	 * @param i The index of the node to get the parent of.
	 * @returns The index of the parent node.
	 * @private
	 */
	private _parent(i: number): number {
		return ((i + 1) >>> 1) - 1;
	}

	/**
	 * Compute the index for the left child of the node at index `i`.
	 * @param i The index of the node to get the left child of.
	 * @returns The index of the left child.
	 * @private
	 */
	private _left(i: number): number {
		return (i << 1) + 1;
	}

	/**
	 * Compute the index for the right child of the node at index `i`.
	 * @param i The index of the node to get the right child of.
	 * @returns The index of the right child.
	 * @private
	 */
	private _right(i: number): number {
		return (i + 1) << 1;
	}

	/**
	 * Check if the element at index `i` is greater than the element at index `j`.
	 * @param i The index of the first element to compare.
	 * @param j The index of the second element to compare.
	 * @returns `true` if the element at index `i` is greater than the element at index `j`, `false` otherwise.
	 * @private
	 */
	private _greater(i: number, j: number): boolean {
		return this._comparator(this._heap[i], this._heap[j]);
	}

	/**
	 * Swap the elements at indices `i` and `j`.
	 * @param i The index of the first element to swap.
	 * @param j The index of the second element to swap.
	 * @private
	 */
	private _swap(i: number, j: number): void {
		const temp = this._heap[i];
		this._heap[i] = this._heap[j];
		this._heap[j] = temp;
	}

	/**
	 * Maintain the heap property by updating positions in the heap,
	 * starting at the last element and moving up the heap.
	 * @private
	 */
	private _siftUp(): void {
		this._siftUpFrom(this.size - 1);
	}

	/**
	 * Helper function to sift up from a given node.
	 * @param node The index of the node to start sifting up from.
	 */
	private _siftUpFrom(node: number): void {
		while (node > 0 && this._greater(node, this._parent(node))) {
			this._swap(node, this._parent(node));
			node = this._parent(node);
		}
	}

	/**
	 * Maintain the heap property by updating positions in the heap,
	 * starting at the first element and moving down the heap.
	 * @private
	 */
	private _siftDown(): void {
		let node = 0;
		while (
			(this._left(node) < this.size && this._greater(this._left(node), node)) ||
			(this._right(node) < this.size && this._greater(this._right(node), node))
		) {
			const maxChild =
				this._right(node) < this.size &&
				this._greater(this._right(node), this._left(node))
					? this._right(node)
					: this._left(node);
			this._swap(node, maxChild);
			node = maxChild;
		}
	}

	/**
	 * Get the index of the smallest element in the heap. Since we use an array-based heap,
	 * the index can be computed without needing to traverse the heap.
	 * @private
	 */
	private _smallest(): number {
		return 2 ** Math.floor(Math.log2(this.size)) - 1;
	}
}
