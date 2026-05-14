export const deleteNestedKey = (
	obj: Record<string, unknown>,
	keysToRemove: Set<string>,
) => {
	for (const key of keysToRemove) {
		const parts = key.split('.');
		const parents: Record<string, unknown>[] = [obj];
		let current = obj;
		for (let i = 0; i < parts.length - 1; i++) {
			const part = parts[i];
			const next = current[part];
			if (next === undefined || next === null) {
				current = null as unknown as Record<string, unknown>;
				break;
			}

			current = next as Record<string, unknown>;
			parents.push(current);
		}

		if (current === null) {
			continue;
		}

		delete current[parts[parts.length - 1]];

		for (let i = parents.length - 1; i > 0; i--) {
			const parent = parents[i];
			if (Object.keys(parent).length === 0) {
				const parentKey = parts[i - 1];
				delete parents[i - 1][parentKey];
			} else {
				break;
			}
		}
	}

	return obj;
};
