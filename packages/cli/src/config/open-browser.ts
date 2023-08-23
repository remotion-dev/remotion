let should = true;

export const setShouldOpenBrowser = (_should: boolean) => {
	if (typeof _should !== 'boolean') {
		throw new TypeError(
			`Expected a boolean, got ${typeof _should} (${should})`,
		);
	}

	should = _should;
};

export const getShouldOpenBrowser = () => {
	return should;
};
