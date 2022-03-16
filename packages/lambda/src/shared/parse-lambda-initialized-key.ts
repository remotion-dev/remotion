export const parseLambdaInitializedKey = (key: string) => {
	const match = key.match(
		/^renders\/(.*)\/lambda-initialized-chunk:([0-9]+)-attempt:([0-9]+).txt$/
	);
	if (!match) {
		throw new Error(
			`Cannot parse filename ${key} into timing information. Malformed data.`
		);
	}

	return {
		renderId: match[1],
		chunk: Number(match[2]),
		attempt: Number(match[3]),
	};
};
