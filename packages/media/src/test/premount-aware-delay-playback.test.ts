import {expect, test} from 'vitest';
import {PremountAwareDelayPlayback} from '../premount-aware-delay-playback';

const makeBufferState = () => {
	let activeBlocks = 0;

	return {
		getActiveBlocks: () => activeBlocks,
		bufferState: {
			delayPlayback: () => {
				activeBlocks++;
				let unblocked = false;
				return {
					unblock: () => {
						if (!unblocked) {
							unblocked = true;
							activeBlocks--;
						}
					},
				};
			},
		},
	};
};

test('arms delay when not premounting', () => {
	const {bufferState, getActiveBlocks} = makeBufferState();
	const delayPlayback = new PremountAwareDelayPlayback({
		bufferState,
		isPremounting: false,
		isPostmounting: false,
	});

	const handle = delayPlayback.createHandle();
	expect(getActiveBlocks()).toBe(1);

	handle.unblock();
	expect(getActiveBlocks()).toBe(0);
});

test('does not arm delay while premounting', () => {
	const {bufferState, getActiveBlocks} = makeBufferState();
	const delayPlayback = new PremountAwareDelayPlayback({
		bufferState,
		isPremounting: true,
		isPostmounting: false,
	});

	const handle = delayPlayback.createHandle();
	expect(getActiveBlocks()).toBe(0);

	delayPlayback.setIsPremounting(false);
	expect(getActiveBlocks()).toBe(1);

	handle.unblock();
	expect(getActiveBlocks()).toBe(0);
});

test('disarms delay when re-entering premount', () => {
	const {bufferState, getActiveBlocks} = makeBufferState();
	const delayPlayback = new PremountAwareDelayPlayback({
		bufferState,
		isPremounting: false,
		isPostmounting: false,
	});

	const handle = delayPlayback.createHandle();
	expect(getActiveBlocks()).toBe(1);

	delayPlayback.setIsPremounting(true);
	expect(getActiveBlocks()).toBe(0);

	handle.unblock();
	expect(getActiveBlocks()).toBe(0);
});

test('does not arm delay while postmounting', () => {
	const {bufferState, getActiveBlocks} = makeBufferState();
	const delayPlayback = new PremountAwareDelayPlayback({
		bufferState,
		isPremounting: false,
		isPostmounting: true,
	});

	const handle = delayPlayback.createHandle();
	expect(getActiveBlocks()).toBe(0);

	delayPlayback.setIsPostmounting(false);
	expect(getActiveBlocks()).toBe(1);

	handle.unblock();
	expect(getActiveBlocks()).toBe(0);
});

test('dispose via Symbol.dispose unblocks', () => {
	const {bufferState, getActiveBlocks} = makeBufferState();
	const delayPlayback = new PremountAwareDelayPlayback({
		bufferState,
		isPremounting: false,
		isPostmounting: false,
	});

	{
		using _handle = delayPlayback.createHandle();
		expect(getActiveBlocks()).toBe(1);
	}

	expect(getActiveBlocks()).toBe(0);
});
