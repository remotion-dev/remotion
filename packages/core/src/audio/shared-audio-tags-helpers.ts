export const compareProps = (
	obj1: Record<string, unknown>,
	obj2: Record<string, unknown>,
) => {
	const keysA = Object.keys(obj1).sort();
	const keysB = Object.keys(obj2).sort();
	if (keysA.length !== keysB.length) {
		return false;
	}

	for (let i = 0; i < keysA.length; i++) {
		// Not the same keys
		if (keysA[i] !== keysB[i]) {
			return false;
		}

		// Not the same values
		if (obj1[keysA[i]] !== obj2[keysB[i]]) {
			return false;
		}
	}

	return true;
};

export const didPropChange = (
	key: string,
	newProp: unknown,
	prevProp: unknown,
) => {
	// /music.mp3 and http://localhost:3000/music.mp3 are the same
	if (
		key === 'src' &&
		!(prevProp as string).startsWith('data:') &&
		!(newProp as string).startsWith('data:')
	) {
		return (
			new URL(prevProp as string, window.origin).toString() !==
			new URL(newProp as string, window.origin).toString()
		);
	}

	if (prevProp === newProp) {
		return false;
	}

	return true;
};
