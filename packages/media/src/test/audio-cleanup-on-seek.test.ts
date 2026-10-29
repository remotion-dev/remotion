import type {CDPSession} from '@vitest/browser-playwright';
import {expect, test, vi} from 'vitest';
import {cdp} from 'vitest/browser';
import {makeAudioIterator} from '../audio/audio-preview-iterator';
import type {AudioBufferSlice} from '../make-iterator-with-priming';

async function* makeEmptySource(): AsyncGenerator<
	AudioBufferSlice,
	void,
	unknown
> {}

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
	});
	iterator.addQueuedAudioNode({
		node: started,
		timestamp: 0,
		sourceDurationInSeconds: 0.1,
	});
	iterator.addQueuedAudioNode({
		node: pending,
		timestamp: 0.1,
		sourceDurationInSeconds: 0.1,
	});
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
		const iterator = makeAudioIterator({
			startFromSecond: 0,
			iterator: makeEmptySource(),
			unscheduleAudioNode: () => {},
		});
		const buffers: WeakRef<AudioBuffer>[] = [];
		const nodes: WeakRef<AudioBufferSourceNode>[] = [];
		let ended = 0;
		for (let i = 0; i < 64; i++) {
			const buffer = context.createBuffer(2, 48000, 48000);
			buffer.getChannelData(0).fill((i + 1) / 128);
			buffer.getChannelData(1).fill((i + 1) / 128);
			const node = context.createBufferSource();
			node.buffer = buffer;
			node.connect(context.destination);
			node.addEventListener('ended', () => ended++, {once: true});
			node.start(0, 0, 0.005);
			iterator.addQueuedAudioNode({
				node,
				timestamp: i,
				sourceDurationInSeconds: 1,
			});
			buffers.push(new WeakRef(buffer));
			nodes.push(new WeakRef(node));
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
		});
		iterator.addQueuedAudioNode({
			node,
			timestamp: 0,
			sourceDurationInSeconds: 0.1,
		});
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
