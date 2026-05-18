export type BooleanMap = Record<string, boolean>;

export const onlyExpandedBooleanMapValues = (state: BooleanMap): BooleanMap => {
	const result: BooleanMap = {};

	for (const [key, value] of Object.entries(state)) {
		if (value) {
			result[key] = true;
		}
	}

	return result;
};

export const toggleBooleanMapKey = (
	state: BooleanMap,
	key: string,
): BooleanMap => {
	const next = {...state};

	if (next[key]) {
		delete next[key];
	} else {
		next[key] = true;
	}

	return next;
};

export const loadPersistedBooleanMap = (
	sessionStorageKey: string,
): BooleanMap => {
	if (typeof window === 'undefined') {
		return {};
	}

	try {
		const raw = window.sessionStorage.getItem(sessionStorageKey);
		if (raw === null) {
			return {};
		}

		const parsed: unknown = JSON.parse(raw);
		if (!parsed || typeof parsed !== 'object') {
			return {};
		}

		return onlyExpandedBooleanMapValues(parsed as BooleanMap);
	} catch {
		return {};
	}
};

export const persistBooleanMap = (
	sessionStorageKey: string,
	state: BooleanMap,
): void => {
	if (typeof window === 'undefined') {
		return;
	}

	try {
		window.sessionStorage.setItem(
			sessionStorageKey,
			JSON.stringify(onlyExpandedBooleanMapValues(state)),
		);
	} catch {
		// Ignore quota errors or disabled storage.
	}
};
