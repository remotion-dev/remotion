export const parseLambdaChunkKey = (key: string) => {
	const match = key.match(/^renders\/(.*)\/chunks\/chunk:([0-9]+)$/);
	if (!match) {
		throw new Error(
			`Cannot parse filename ${key} into timing information. Malformed data.`
		);
	}

	return {
		renderId: match[1],
		chunk: Number(match[2]),
	};
};
