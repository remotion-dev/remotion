export const jsonStringifyWithCircularReferences = (circ: unknown) => {
	let seen: unknown[] | null = [];

	const val = JSON.stringify(circ, (_, value) => {
		if (typeof value === 'object' && value !== null && seen) {
			if (seen.includes(value)) {
				return '[Circular]';
			}

			seen.push(value);
		}

		return value;
	});

	seen = null;

	return val;
};
