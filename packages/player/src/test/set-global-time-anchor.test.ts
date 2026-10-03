import {expect, test} from 'bun:test';
import {setGlobalTimeAnchor} from '../set-global-time-anchor.js';

// Relative audio times and picture frames from a captured replay at 25 fps.
const replay: [number, number][] = [
	[0, 0],
	[0.064, 0],
	[0.106666667, 3],
	[0.106666667, 5],
	[0.128, 7],
	[0.234666667, 10],
	[0.341333333, 12],
	[0.426666667, 15],
	[0.533333333, 17],
	[0.64, 20],
	[0.746666667, 22],
	[0.832, 25],
	[0.938666667, 27],
];

const initialPlayAfterIdle: [number, number][] = [
	[0, 0],
	[0.064, 1],
	[0.085333333, 3],
	[0.085333333, 6],
	[0.106666667, 8],
	[0.213333333, 11],
	[0.32, 13],
	[0.405333333, 16],
	[0.512, 18],
	[0.618666667, 21],
	[0.725333333, 23],
	[0.810666667, 26],
	[0.917333333, 28],
];

function run(
	samples: [number, number][],
	outputLatency: number,
	rate = 1,
	state: AudioContextState = 'running',
) {
	const audioSyncAnchor = {value: 0};
	const offsets: number[] = [];
	let corrections = 0;
	for (const [audioTime, frame] of samples) {
		corrections += Number(
			setGlobalTimeAnchor({
				audioContext: {
					currentTime: audioTime,
					baseLatency: 1024 / 48000,
					outputLatency,
					state,
				} as AudioContext,
				audioSyncAnchor,
				absoluteTimeInSeconds: frame / 25,
				globalPlaybackRate: rate,
				logLevel: 'error',
				force: false,
			}),
		);
		offsets.push((audioTime - audioSyncAnchor.value) * rate - frame / 25);
	}

	return {offsets, corrections};
}

test('recovers the captured running audio-clock stall without repeated corrections', () => {
	for (const samples of [replay, initialPlayAfterIdle]) {
		for (const latency of [0, 0.02, 0.2, 0.216]) {
			const {offsets, corrections} = run(samples, latency);
			expect(
				offsets.slice(-4).every((offset) => Math.abs(offset) <= 0.04),
				`outputLatency=${latency}: final clock error ${offsets.at(-1)! * 1000}ms`,
			).toBe(true);
			expect(corrections).toBe(1);
		}
	}
});

test('does not re-anchor ordinary frame and audio-block quantization', () => {
	const samples = Array.from({length: 200}, (_, i): [number, number] => {
		const wallTime = i / 60;
		return [
			(Math.ceil((wallTime * 48000) / 1024) * 1024) / 48000,
			Math.floor(wallTime * 25),
		];
	});
	for (const latency of [0, 0.02, 0.2, 0.216]) {
		expect(run(samples, latency).corrections).toBe(0);
	}
});

test('preserves an audio clock lead within the output latency allowance', () => {
	for (const latency of [0.2, 0.216]) {
		for (const rate of [1, 1.25, 1.5, 1.75, 2]) {
			const samples = Array.from({length: 180}, (_, i): [number, number] => {
				const wallTime = i / 60;
				return [wallTime + latency, Math.floor(wallTime * rate * 25)];
			});
			expect(run(samples, latency, rate).corrections).toBe(0);
		}
	}
});

test('leaves a briefly stalled clock alone when the browser catches up', () => {
	const samples = Array.from({length: 180}, (_, i): [number, number] => {
		const wallTime = i / 60;
		const audioTime = wallTime >= 1 && wallTime < 1.18 ? 1 : wallTime;
		return [audioTime, Math.floor(wallTime * 25)];
	});
	for (const latency of [0, 0.02, 0.2, 0.216]) {
		expect(run(samples, latency).corrections).toBe(0);
	}
});

test('recovers persistent lag at each supported speed', () => {
	for (const rate of [1, 1.25, 1.5, 1.75, 2]) {
		const samples = Array.from({length: 180}, (_, i): [number, number] => {
			const wallTime = i / 60;
			return [
				wallTime - (wallTime >= 1 ? 0.18 / rate : 0),
				Math.floor(wallTime * rate * 25),
			];
		});
		const {corrections, offsets} = run(samples, 0.216, rate);
		expect(corrections, `rate=${rate}`).toBe(1);
		const maxError = Math.max(...offsets.slice(-20).map(Math.abs));
		expect(maxError <= 0.04 + 1e-9, `rate=${rate}: ${maxError * 1000}ms`).toBe(
			true,
		);
	}
});

test('keeps pending recovery local to each player and resets it on explicit alignment', () => {
	const first = {value: 0};
	const second = {value: 0};
	function update(
		anchor: {value: number},
		time: number,
		offset: number,
		options: {force: boolean; state: AudioContextState} = {
			force: false,
			state: 'running',
		},
	) {
		return setGlobalTimeAnchor({
			audioContext: {
				currentTime: time,
				state: options.state,
				baseLatency: 1024 / 48000,
				outputLatency: 0.216,
			} as AudioContext,
			audioSyncAnchor: anchor,
			absoluteTimeInSeconds: time - anchor.value + offset,
			globalPlaybackRate: 1,
			logLevel: 'error',
			force: options.force,
		});
	}

	expect(update(first, 1, 0.18)).toBe(false);
	expect(update(second, 1.25, 0.18)).toBe(false);
	expect(update(first, 1.25, 0.18)).toBe(true);
	expect(update(second, 1.3, 0, {force: true, state: 'running'})).toBe(false);
	expect(update(second, 1.5, 0.18)).toBe(false);
	expect(update(second, 1.6, 0.18, {force: false, state: 'suspended'})).toBe(
		false,
	);
	expect(update(second, 2, 0.18)).toBe(false);
	expect(update(second, 2.25, 0.18)).toBe(true);
	expect(update(second, 2.3, 1)).toBe(true);
	expect(update(second, 2.32, -1)).toBe(true);
	expect(run([[0, 4]], 0.02, 1, 'suspended').corrections).toBe(1);
	expect(update(second, 2.35, 0.18, {force: true, state: 'running'})).toBe(
		true,
	);
});

test('restarts pending recovery after direction, speed, or anchor changes', () => {
	for (const change of ['direction', 'speed', 'anchor']) {
		const anchor = {value: 0};
		function update(time: number, offset: number, rate: number) {
			return setGlobalTimeAnchor({
				audioContext: {
					currentTime: time,
					state: 'running',
					baseLatency: 1024 / 48000,
					outputLatency: 0.216,
				} as AudioContext,
				audioSyncAnchor: anchor,
				absoluteTimeInSeconds: (time - anchor.value + offset) * rate,
				globalPlaybackRate: rate,
				logLevel: 'error',
				force: false,
			});
		}

		expect(update(1, 0.18, 1)).toBe(false);
		const nextOffset = change === 'direction' ? -0.18 : 0.18;
		const nextRate = change === 'speed' ? 1.5 : 1;
		if (change === 'anchor') anchor.value = 0.01;
		expect(update(1.1, nextOffset, nextRate)).toBe(false);
		expect(update(1.29, nextOffset, nextRate)).toBe(false);
		if (change === 'direction') {
			expect(update(1.3, 0.18, 1)).toBe(false);
			expect(update(1.49, 0.18, 1)).toBe(false);
			expect(update(1.51, 0.18, 1)).toBe(true);
		} else {
			expect(update(1.31, nextOffset, nextRate)).toBe(true);
		}
	}
});
