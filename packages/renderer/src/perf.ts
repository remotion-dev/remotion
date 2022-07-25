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

export const logPerf = () => {
	console.log('Render performance:');
	(Object.keys(perf) as PerfId[]).forEach((p) => {
		console.log(
			`  ${p} => ${perf[p].reduce((a, b) => a + b, 0) / perf[p].length} (n = ${
				perf[p].length
			})`
		);
	});
};
