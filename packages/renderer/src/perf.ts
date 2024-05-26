type PerfId =
	| 'activate-target'
	| 'capture'
	| 'save'
	| 'extract-frame'
	| 'piping';

const perf: {[key in PerfId]: number[]} = {
	'activate-target': [],
	capture: [],
	save: [],
	'extract-frame': [],
	piping: [],
};

const map: {
	[key: number]: {
		id: number;
		marker: PerfId;
		start: number;
	};
} = {};

export const startPerfMeasure = (marker: PerfId) => {
	const id = Math.random();
	map[id] = {
		id,
		marker,
		start: Date.now(),
	};
	return id;
};

export const stopPerfMeasure = (id: number) => {
	const now = Date.now();
	const diff = now - map[id].start;
	perf[map[id].marker].push(diff);
	delete map[id];
};

export const getPerf = () => {
	return [
		'Render performance:',
		...(Object.keys(perf) as PerfId[])
			.filter((p) => perf[p].length)
			.map((p) => {
				return `  ${p} => ${Math.round(
					perf[p].reduce((a, b) => a + b, 0) / perf[p].length,
				)}ms (n = ${perf[p].length})`;
			}),
	];
};
