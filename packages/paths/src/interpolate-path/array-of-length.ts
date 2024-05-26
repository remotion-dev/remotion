export function arrayOfLength<T>(length: number, value: T): T[] {
	const array = Array(length);
	for (let i = 0; i < length; i++) {
		array[i] = value;
	}

	return array;
}
