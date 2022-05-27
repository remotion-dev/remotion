export type ParsedTiming = {
	renderId: string;
	chunk: number;
	start: number;
	rendered: number;
};

export const parseLambdaTimingsKey = (key: string): ParsedTiming => {
	const match = key.match(
		/^renders\/(.*)\/lambda-timings\/chunk:([0-9]+)-start:([0-9]+)-rendered:([0-9]+).txt$/
	);
	if (!match) {
		throw new Error(
			`Cannot parse filename ${key} into timing information. Malformed data.`
		);
	}

	return {
		renderId: match[1] as string,
		chunk: Number(match[2]),
		start: Number(match[3]),
		rendered: Number(match[4]),
	};
};
