import type {CDPSession} from '@vitest/browser-playwright';
import {expect, test, vi} from 'vitest';
import {cdp} from 'vitest/browser';
import {
	makeAudioIterator,
	type PreparedAudioChunk,
} from '../audio/audio-preview-iterator';
import type {AudioBufferSlice} from '../make-iterator-with-priming';

async function* makeEmptySource(): AsyncGenerator<
	AudioBufferSlice,
	void,
	unknown
> {}

const makeChunk = (
	context: OfflineAudioContext,
	timestamp: number,
	duration: number,
): PreparedAudioChunk => ({
	buffer: context.createBuffer(
		1,
		duration * context.sampleRate,
		context.sampleRate,
	),
	timestamp,
	originalUnloopedMediaTimestamp: timestamp,
	sourceOffsetInSeconds: 0,
	sourceDurationInSeconds: duration,
});

test('destroy stops started nodes and unschedules pending nodes after an audio anchor change', () => {
	const context = new OfflineAudioContext(1, 4800, 48000);
	const started = context.createBufferSource();
	const pending = context.createBufferSource();
	started.start();
	const startedStop = vi.spyOn(started, 'stop');
	const pendingStop = vi.spyOn(pending, 'stop');
	const unschedule = vi.fn((node: AudioBufferSourceNode) => node === pending);
	const iterator = makeAudioIterator({
		startFromSecond: 0,
		iterator: makeEmptySource(),
		unscheduleAudioNode: unschedule,
		scheduleChunk: (chunk) => (chunk.timestamp === 0 ? started : pending),
	});
	iterator.scheduleAudio(makeChunk(context, 0, 0.1));
	iterator.scheduleAudio(makeChunk(context, 0.1, 0.1));
	iterator.destroy();
	expect(unschedule.mock.calls.map(([node]) => node)).toEqual([
		started,
		pending,
	]);
	expect(startedStop).toHaveBeenCalledOnce();
	expect(pendingStop).not.toHaveBeenCalled();
	expect(iterator.getQueuedPeriod()).toBeNull();
});

// Ended nodes used to retain every decoded AudioBuffer until iterator destruction.
test('ended audio buffers are collectible while the iterator keeps its scheduling history', async () => {
	const prepare = async () => {
		const context = new OfflineAudioContext(2, 4800, 48000);
		const buffers: WeakRef<AudioBuffer>[] = [];
		const nodes: WeakRef<AudioBufferSourceNode>[] = [];
		let ended = 0;
		const iterator = makeAudioIterator({
			startFromSecond: 0,
			iterator: makeEmptySource(),
			unscheduleAudioNode: () => {},
			scheduleChunk: (chunk) => {
				const node = context.createBufferSource();
				node.buffer = chunk.buffer;
				node.connect(context.destination);
				node.addEventListener('ended', () => ended++, {once: true});
				node.start(0, 0, 0.005);
				buffers.push(new WeakRef(chunk.buffer));
				nodes.push(new WeakRef(node));
				return node;
			},
		});
		for (let i = 0; i < 64; i++) {
			const buffer = context.createBuffer(2, 48000, 48000);
			buffer.getChannelData(0).fill((i + 1) / 128);
			buffer.getChannelData(1).fill((i + 1) / 128);
			iterator.scheduleAudio({
				buffer,
				timestamp: i,
				originalUnloopedMediaTimestamp: i,
				sourceOffsetInSeconds: 0,
				sourceDurationInSeconds: 1,
			});
		}

		await context.startRendering();
		await expect.poll(() => ended).toBe(64);
		return {iterator, buffers, nodes};
	};

	const result = await prepare();
	try {
		const session = cdp() as CDPSession;
		await session.send('HeapProfiler.collectGarbage');
		await session.send('HeapProfiler.collectGarbage');
		expect(result.buffers.filter((ref) => ref.deref())).toHaveLength(0);
		expect(result.nodes.filter((ref) => ref.deref())).toHaveLength(0);
		expect(result.iterator.isDestroyed()).toBe(false);
		expect(result.iterator.getQueuedPeriod()).toEqual({from: 0, until: 64});
	} finally {
		result.iterator.destroy();
	}
});

test('destroy removes the ended listener even when a pending node never starts', async () => {
	const prepare = () => {
		const context = new OfflineAudioContext(1, 4800, 48000);
		const node = context.createBufferSource();
		const source = makeEmptySource();
		const iterator = makeAudioIterator({
			startFromSecond: 0,
			iterator: source,
			unscheduleAudioNode: () => true,
			scheduleChunk: () => node,
		});
		iterator.scheduleAudio(makeChunk(context, 0, 0.1));
		iterator.destroy();
		return {node, source: new WeakRef(source)};
	};

	const result = prepare();
	const session = cdp() as CDPSession;
	await session.send('HeapProfiler.collectGarbage');
	await session.send('HeapProfiler.collectGarbage');
	expect(result.source.deref()).toBeUndefined();
	// Keep the node alive through GC: it must not retain the iterator's listener.
	expect(result.node.context.state).toBe('suspended');
});

// KINO-7449: replacing clock scheduling must preserve PCM and trim offsets,
// stop the old one-shot nodes, and retain no ended buffers for a later replay.
test('re-anchoring preserves audio samples and offsets without double playback', async () => {
	const context = new OfflineAudioContext(1, 48000, 48000);
	const buffer = context.createBuffer(1, 48000, 48000);
	const samples = buffer.getChannelData(0);
	for (let i = 0; i < samples.length; i++) samples[i] = i / 48000;
	let targetTime = 0.1;
	const iterator = makeAudioIterator({
		startFromSecond: 0.5,
		iterator: makeEmptySource(),
		unscheduleAudioNode: () => false,
		scheduleChunk: (chunk) => {
			const node = context.createBufferSource();
			node.buffer = chunk.buffer;
			node.connect(context.destination);
			node.start(
				targetTime,
				chunk.sourceOffsetInSeconds,
				chunk.sourceDurationInSeconds,
			);
			return node;
		},
	});

	try {
		iterator.scheduleAudio({
			buffer,
			timestamp: 0.5,
			originalUnloopedMediaTimestamp: 0.2,
			sourceOffsetInSeconds: 0.2,
			sourceDurationInSeconds: 0.1,
		});
		targetTime = 0.3;
		for (let i = 0; i < 5; i++)
			expect(iterator.rescheduleAudio(0.5)).toBe(true);
		const output = (await context.startRendering()).getChannelData(0);
		expect(output[7200]).toBe(0); // old schedule at .15 s is silent
		expect(output[15360]).toBeCloseTo(0.22, 4); // .32 s plays source .22 s exactly once
		expect(output[21600]).toBe(0); // trimmed tail after .4 s is silent
		await vi.waitFor(() => expect(iterator.rescheduleAudio(0.5)).toBe(false));
	} finally {
		iterator.destroy();
	}
});

test('re-anchoring keeps a pending read and disposal returns its generator', async () => {
	let release = () => {};
	const gate = new Promise<void>((resolve) => {
		release = resolve;
	});
	let returned = 0;
	const context = new OfflineAudioContext(1, 4800, 48000);
	async function* source(): AsyncGenerator<AudioBufferSlice, void, unknown> {
		try {
			await gate;
			yield {
				buffer: {
					buffer: context.createBuffer(1, 4800, 48000),
					timestamp: 0,
					duration: 0.1,
				},
				timelineTimestamp: 0,
				sourceOffsetInSeconds: 0,
				sourceDurationInSeconds: 0.1,
			};
		} finally {
			returned++;
		}
	}

	const stops: ReturnType<typeof vi.spyOn>[] = [];
	const iterator = makeAudioIterator({
		startFromSecond: 0,
		iterator: source(),
		unscheduleAudioNode: () => false,
		scheduleChunk: (chunk) => {
			const node = context.createBufferSource();
			node.buffer = chunk.buffer;
			node.start();
			stops.push(vi.spyOn(node, 'stop'));
			return node;
		},
	});

	try {
		iterator.scheduleAudio(makeChunk(context, 0, 0.1));
		const read = iterator.getNextFn();
		expect(iterator.rescheduleAudio(0)).toBe(true);
		expect(returned).toBe(0);
		iterator.destroy();
		expect(stops).toHaveLength(2);
		for (const stop of stops) expect(stop).toHaveBeenCalledOnce();
		release();
		await read;
		await vi.waitFor(() => expect(returned).toBe(1));
		expect(iterator.rescheduleAudio(0)).toBe(false);
	} finally {
		release();
		iterator.destroy();
	}
});
