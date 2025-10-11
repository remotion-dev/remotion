type Truthy<T> = T extends false | '' | 0 | null | undefined ? never : T; // from lodash

export function truthy<T>(value: T): value is Truthy<T> {
	return Boolean(value);
}
