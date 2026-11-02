// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function deepEqual(a: any, b: any): boolean {
	if (a === b) {
		return true;
	}

	if (a instanceof Date && b instanceof Date) {
		return a.getTime() === b.getTime();
	}

	if (
		typeof a !== 'object' ||
		a === null ||
		typeof b !== 'object' ||
		b === null
	) {
		return false;
	}

	const keysA = Object.keys(a);
	const keysB = Object.keys(b);

	if (keysA.length !== keysB.length) {
		return false;
	}

	let keySetB: Set<string> | null = null;
	for (let i = 0; i < keysA.length; i++) {
		const key = keysA[i];
		// Arrays and JSON round trips normally keep the same key order.
		if (keysB[i] !== key) {
			keySetB ??= new Set(keysB);
			if (!keySetB.has(key)) {
				return false;
			}
		}

		if (!deepEqual(a[key], b[key])) {
			return false;
		}
	}

	return true;
}
