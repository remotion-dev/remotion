import {mergeArrays} from './merge-arrays';

/**
 *
 * Helper function for padding values of an object, which are each arrays.
 * NOTE: No additional checks are made here for validity of arguments.
 * @param {Record<string, any[]>} item The input object.
 * @param {number} length The length to pad to.
 * @param {(key: string) => any} value_fn Determine the value to fill the array, based on its key.
 * @param {string} side Which side to pad the array.
 * @private
 */
export function padHelper(
	item: Record<string, any[]>,
	length: number,
	value_fn: (key: string) => any,
	side: string,
) {
	for (const key of Object.keys(item)) {
		const diff = length - item[key].length;
		const value = value_fn(key);

		const padData = new Array(diff).fill(value);
		item[key] =
			side === 'right'
				? mergeArrays(item[key], padData)
				: mergeArrays(padData, item[key]);
	}
}

/**
 * Helper function for truncating values of an object, which are each arrays.
 * NOTE: No additional checks are made here for validity of arguments.
 * @param {Record<string, any[]>} item The input object.
 * @param {number} length The length to truncate to.
 * @private
 */
export function truncateHelper(item: Record<string, any[]>, length: number) {
	// Setting .length to a lower value truncates the array in-place:
	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/length
	for (const key of Object.keys(item)) {
		item[key].length = length;
	}
}
