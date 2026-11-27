import {AudioBufferSink, InputAudioTrack} from 'mediabunny';
import {expect, test, vi} from 'vitest';
import {audioIteratorManager} from '../audio-iterator-manager';
import {processNext} from '../audio/sort-by-priority';
import {makeNonceManager} from '../nonce-manager';

class ScheduledNode extends EventTarget {
	buffer: AudioBuffer | null = null;
	playbackRate = {value: 1};
	endTime = Infinity;
	ended = false;
	stopped = false;
	connect() {}
	disconnect() {}
	stop() {
		this.stopped = true;
	}
}

const prepare = ({
	playbackRate,
	resuming,
	playing,
}: {
	playbackRate: number;
	resuming: boolean;
	playing: boolean;
}) => {
	let pendingResume = resuming;
	let anchor = 0;
	let decoded = 0;
	const nodes: ScheduledNode[] = [];
	const buffers: AudioBuffer[] = [];
	const gain = {gain: {value: 1}, connect() {}, disconnect() {}};
	const timerStart = Date.now();
	const context = {
		get currentTime() {
			return (Date.now() - timerStart) / 1000;
		},
		createGain: () => gain,
		createBufferSource: () => {
			const node = new ScheduledNode();
			nodes.push(node);
			return node;
		},
	};
	vi.spyOn(AudioBufferSink.prototype, 'buffers').mockImplementation(
		async function* () {
			for (let index = 0; index < 3000; index++) {
				const samples = new Float32Array(4800);
				for (let sample = 0; sample < samples.length; sample++)
					samples[sample] =
						0.5 * Math.sin((2 * Math.PI * 440 * sample) / 48000);
				const buffer = {
					duration: 0.1,
					sampleRate: 48000,
					length: samples.length,
					numberOfChannels: 1,
					getChannelData: () => samples,
				} as unknown as AudioBuffer;
				decoded++;
				buffers.push(buffer);
				yield {buffer, timestamp: index / 10, duration: 0.1};
			}
		},
	);
	const track = Object.create(InputAudioTrack.prototype, {
		input: {value: {disposed: false}},
	}) as InputAudioTrack;
	let unblocks = 0;
	const manager = audioIteratorManager({
		audioTrack: track,
		delayPlaybackHandleIfNotPremounting: () => ({
			unblock: () => {
				unblocks++;
			},
			[Symbol.dispose]: () => {},
		}),
		sharedAudioContext: {
			isResuming: () => pendingResume,
			audioContext: context as unknown as AudioContext,
			gainNode: gain as unknown as GainNode,
			audioSyncAnchor: {value: 0},
			scheduleAudioNode: () => ({type: 'started', scheduledTime: 0}),
			unscheduleAudioNode: () => false,
		},
		getSequenceEndTimestamp: () => 300,
		getSequenceDurationInSeconds: () => 300,
		getMediaEndTimestamp: () => 300,
		getStartTime: () => 0,
		getIsPlaying: () => playing,
		initialMuted: false,
		initialVolume: 1,
		toneFrequency: 1,
		drawDebugOverlay: () => {},
		onError: (error) => {
			throw error;
		},
	});
	manager.startAudioIterator({
		nonce: makeNonceManager().createAsyncOperation(),
		playbackRate,
		startFromSecond: 0,
		unloopedStartFromSecond: 0,
		scheduleAudioNode: (...args) => {
			const [nativeNode, timestamp, , , duration] = args;
			const node = nativeNode as unknown as ScheduledNode;
			node.endTime = anchor + (timestamp + duration) / playbackRate;
			return {
				type: 'started',
				scheduledTime: anchor + timestamp / playbackRate,
			};
		},
		getTargetTime: (timestamp) => anchor + timestamp / playbackRate,
		logLevel: 'error',
		loop: false,
		unscheduleAudioNode: () => false,
		getAudioContextCurrentTimeMockedInTest: () => context.currentTime,
	});
	return {
		manager,
		nodes,
		buffers,
		decoded: () => decoded,
		unblocks: () => unblocks,
		advance: async (time: number) => {
			const elapsed = time * 1000 - (Date.now() - timerStart);
			await vi.advanceTimersByTimeAsync(elapsed);
			for (const node of nodes) {
				if (!node.ended && !node.stopped && node.endTime <= time) {
					node.ended = true;
					node.dispatchEvent(new Event('ended'));
				}
			}
		},
		finishResume: () => {
			anchor = context.currentTime;
			pendingResume = false;
		},
	};
};

test.for([0.5, 1, 2])(
	'pending native resume bounds PCM decoding at %s playback rate',
	async (playbackRate) => {
		vi.useFakeTimers();
		const {manager, ...harness} = prepare({
			playbackRate,
			resuming: true,
			playing: true,
		});
		try {
			await harness.advance(0);
			const initialDecoded = harness.decoded();
			expect(initialDecoded).toBeGreaterThan(0);
			expect(harness.unblocks()).toBe(1);
			// Background RAF never completes resume, while the native audio clock runs.
			for (let step = 1; step <= 200; step++) await harness.advance(step / 10);
			const decodedDuringWait = harness.decoded();
			const expiredDuringWait = harness.nodes.filter(
				(node) => node.ended,
			).length;
			const firstPCM = harness.buffers[0];
			const scheduledBeforeResume = harness.nodes.length;
			harness.finishResume();
			expect(manager.rescheduleAudio(0, 0, playbackRate, false)).toBe(true);
			const replayed = harness.nodes.slice(scheduledBeforeResume);
			expect({
				decodedDuringWait,
				expiredDuringWait,
				retainedPCM: replayed.length,
			}).toEqual({
				decodedDuringWait: initialDecoded,
				expiredDuringWait: initialDecoded,
				retainedPCM: initialDecoded,
			});
			expect(decodedDuringWait).toBeLessThanOrEqual(2 * playbackRate * 10 + 1);
			expect(replayed.map((node) => node.buffer)).toEqual(
				harness.buffers.slice(0, initialDecoded),
			);
			expect(replayed[0].buffer).toBe(firstPCM);
			expect(
				replayed[0].buffer!.getChannelData(0).some((sample) => sample !== 0),
			).toBe(true);
			expect(manager.getAudioIteratorsCreated()).toBe(1);
			await harness.advance(20 + 0.11 / playbackRate);
			expect(replayed[0].ended).toBe(true);
			const scheduledBeforeReanchor = harness.nodes.length;
			expect(manager.rescheduleAudio(0.11, 0.11, playbackRate, false)).toBe(
				true,
			);
			expect(
				harness.nodes
					.slice(scheduledBeforeReanchor)
					.some((node) => node.buffer === firstPCM),
			).toBe(false);
			expect(manager.getAudioIteratorsCreated()).toBe(1);
		} finally {
			manager.dispose();
			processNext();
			await vi.runOnlyPendingTimersAsync();
			vi.restoreAllMocks();
			vi.useRealTimers();
		}
	},
);

test('ordinary playing releases expired PCM instead of retaining the resume history', async () => {
	vi.useFakeTimers();
	const {manager, ...harness} = prepare({
		playbackRate: 1,
		resuming: false,
		playing: true,
	});
	try {
		await harness.advance(0);
		for (let step = 1; step <= 200; step++) await harness.advance(step / 10);
		expect(harness.decoded()).toBeGreaterThan(200);
		expect(
			harness.nodes.filter((node) => node.ended).length,
		).toBeGreaterThanOrEqual(199);
		expect(manager.rescheduleAudio(0, 0, 1, false)).toBe(false);
	} finally {
		manager.dispose();
		processNext();
		await vi.runOnlyPendingTimersAsync();
		vi.restoreAllMocks();
		vi.useRealTimers();
	}
});

test.for([-2, -1, -0.5, 0])(
	'non-forward playback does not decode during pending resume at %s',
	async (playbackRate) => {
		vi.useFakeTimers();
		const {manager, ...harness} = prepare({
			playbackRate,
			resuming: true,
			playing: true,
		});
		try {
			await harness.advance(20);
			expect(harness.decoded()).toBe(0);
			expect(harness.nodes).toHaveLength(0);
		} finally {
			manager.dispose();
			processNext();
			await vi.runOnlyPendingTimersAsync();
			vi.restoreAllMocks();
			vi.useRealTimers();
		}
	},
);

test('a paused timeline keeps its existing PCM bound while the native clock advances', async () => {
	vi.useFakeTimers();
	const {manager, ...harness} = prepare({
		playbackRate: 1,
		resuming: false,
		playing: false,
	});
	try {
		await harness.advance(0);
		const initialDecoded = harness.decoded();
		for (let step = 1; step <= 200; step++) await harness.advance(step / 10);
		expect(harness.decoded()).toBe(initialDecoded);
		expect(initialDecoded).toBeLessThanOrEqual(21);
		const previous = harness.nodes.length;
		harness.finishResume();
		expect(manager.rescheduleAudio(0, 0, 1, false)).toBe(true);
		expect(harness.nodes.slice(previous).map((node) => node.buffer)).toEqual(
			harness.buffers,
		);
	} finally {
		manager.dispose();
		processNext();
		await vi.runOnlyPendingTimersAsync();
		vi.restoreAllMocks();
		vi.useRealTimers();
	}
});
