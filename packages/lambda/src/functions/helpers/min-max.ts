// Standard library Math.min and Math.max can throw
// if array length is very long. Fixing this with own implementation

export const min = (arr: number[]) => {
	if (arr.length === 0) {
		throw new Error('Array of 0 length');
	}

	let smallest = arr[0];
	for (let i = 0; i < arr.length; i++) {
		const elem = arr[i];
		if (elem < smallest) {
			smallest = elem;
		}
	}

	return smallest;
};

export const max = (arr: number[]) => {
	if (arr.length === 0) {
		throw new Error('Array of 0 length');
	}

	let biggest = arr[0];
	for (let i = 0; i < arr.length; i++) {
		const elem = arr[i];
		if (elem > biggest) {
			biggest = elem;
		}
	}

	return biggest;
};
