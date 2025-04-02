export type FindNthSubarrayIndexNotFound = {
	type: 'not-found';
	index: number;
	count: number;
};
type ReturnType =
	| {
			type: 'found';
			index: number;
	  }
	| FindNthSubarrayIndexNotFound;

export function findNthSubarrayIndex({
	array,
	subarray,
	n,
	startIndex,
	startCount,
}: {
	array: Uint8Array;
	subarray: Uint8Array;
	n: number;
	startIndex: number;
	startCount: number;
}): ReturnType {
	const subarrayLength = subarray.length;
	const arrayLength = array.length;
	let count = startCount;
	let i = startIndex;
	for (i; i <= arrayLength - subarrayLength; i++) {
		let match = true;
		for (let j = 0; j < subarrayLength; j++) {
			if (array[i + j] !== subarray[j]) {
				match = false;
				break;
			}
		}

		if (match) {
			count++;
			if (count === n) {
				return {type: 'found', index: i}; // Return the starting index of the nth subarray
			}
		}
	}

	return {type: 'not-found', index: i, count}; // Return -1 if nth subarray is not found
}
