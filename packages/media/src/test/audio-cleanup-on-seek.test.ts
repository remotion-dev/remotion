import {expect, test} from 'vitest';
import {makeAudioIterator} from '../audio/audio-preview-iterator';
import type {BufferWithMediaTimestamp} from '../make-iterator-with-priming';

const makeMockNode = () => {
	let stopped = false;
	const node = {
		stop: () => {
			stopped = true;
		},
	} as unknown as AudioBufferSourceNode;

	return {
		node,
		wasStopped: () => stopped,
	};
};

const makeMockBuffer = (duration: number) => {
	return {
		duration,
	} as unknown as AudioBuffer;
};

async function* makeEmptySource(): AsyncGenerator<
	BufferWithMediaTimestamp,
	void,
	unknown
> {}

test('destroy should stop nodes when the audio anchor changed (seek to different position)', () => {
	const iterator = makeAudioIterator({
		startFromSecond: 0,
		iterator: makeEmptySource(),
		unscheduleAudioNode: () => {},
	});

	const mock1 = makeMockNode();
	const mock2 = makeMockNode();

	iterator.addQueuedAudioNode({
		node: mock1.node,
		timestamp: 0,
		buffer: makeMockBuffer(0.021),
		timelineDurationInSeconds: 0.021,
		scheduledTime: 0.1,
		playbackRate: 1,
		scheduledAtAnchor: 0,
	});
	iterator.addQueuedAudioNode({
		node: mock2.node,
		timestamp: 0.021,
		buffer: makeMockBuffer(0.021),
		timelineDurationInSeconds: 0.021,
		scheduledTime: 0.121,
		playbackRate: 1,
		scheduledAtAnchor: 0,
	});

	iterator.destroy();

	expect(mock1.wasStopped()).toBe(true);
	expect(mock2.wasStopped()).toBe(true);
});
