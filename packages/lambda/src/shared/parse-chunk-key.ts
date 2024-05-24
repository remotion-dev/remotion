export const parseLambdaChunkKey = (key: string) => {
	const match = key.match(/chunk:([0-9]+):(video|audio)$/);
	if (!match) {
		throw new Error(
			`Cannot parse filename ${key} into timing information. Malformed data.`,
		);
	}

	return {
		chunk: Number(match[1]),
		type: match[2],
	};
};
