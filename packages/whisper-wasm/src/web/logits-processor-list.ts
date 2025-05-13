import {Callable} from './callable';
import type {Tensor} from './tensor';
import type {LogitsProcessor} from './whisper-timestamp-logits-processor';

export class LogitsProcessorList extends Callable {
	processors: LogitsProcessor[];

	/**
	 * Constructs a new instance of `LogitsProcessorList`.
	 */
	constructor() {
		super();
		this.processors = [];
	}

	/**
	 * Adds a new logits processor to the list.
	 *
	 * @param {LogitsProcessor} item The logits processor function to add.
	 */
	push(item: LogitsProcessor) {
		this.processors.push(item);
	}

	/**
	 * Adds multiple logits processors to the list.
	 *
	 * @param {LogitsProcessor[]} items The logits processor functions to add.
	 */
	extend(items: LogitsProcessor[]) {
		this.processors.push(...items);
	}

	/**
	 * Applies all logits processors in the list to a batch of logits, modifying them in-place.
	 *
	 * @param {bigint[][]} input_ids The input IDs for the language model.
	 * @param {Tensor} logits
	 */
	_call(input_ids: bigint[][], logits: Tensor) {
		let toReturn: Tensor = logits;
		// NOTE: Most processors modify logits inplace
		for (const processor of this.processors) {
			toReturn = processor._call(input_ids, toReturn) as unknown as Tensor;
		}

		return toReturn;
	}

	[Symbol.iterator]() {
		return this.processors.values();
	}
}
