import {Callable} from './callable';
import {StoppingCriteria} from './max-length-criteria';

export class StoppingCriteriaList extends Callable {
	criteria: StoppingCriteria[];
	/**
	 * Constructs a new instance of `StoppingCriteriaList`.
	 */
	constructor() {
		super();
		this.criteria = [];
	}

	/**
	 * Adds a new stopping criterion to the list.
	 *
	 * @param {StoppingCriteria} item The stopping criterion to add.
	 */
	push(item: StoppingCriteria) {
		this.criteria.push(item);
	}

	/**
	 * Adds multiple stopping criteria to the list.
	 *
	 * @param {StoppingCriteria|StoppingCriteriaList|StoppingCriteria[]} items The stopping criteria to add.
	 */
	extend(items: StoppingCriteria | StoppingCriteriaList | StoppingCriteria[]) {
		if (items instanceof StoppingCriteriaList) {
			items = items.criteria;
		} else if (items instanceof StoppingCriteria) {
			items = [items];
		}

		this.criteria.push(...items);
	}

	_call(input_ids: number[][], scores: number[][] | undefined) {
		const is_done = new Array(input_ids.length).fill(false);
		for (const criterion of this.criteria) {
			const criterion_done = criterion._call(
				input_ids,
				scores,
			) as unknown as number[];
			for (let i = 0; i < is_done.length; ++i) {
				is_done[i] ||= criterion_done[i];
			}
		}

		return is_done;
	}

	[Symbol.iterator]() {
		return this.criteria.values();
	}
}
