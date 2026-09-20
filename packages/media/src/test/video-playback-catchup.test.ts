import type {InputVideoTrack} from 'mediabunny';
import {expect, test, vi} from 'vitest';
import {videoIteratorManager} from '../video-iterator-manager';
import type {VideoIterator} from '../video/video-preview-iterator';

vi.mock('mediabunny', () => ({CanvasSink: class {}}));
vi.mock('../prewarm-iterator-for-looping', () => ({
	makePrewarmedVideoIteratorCache: () => ({destroy: () => undefined}),
}));
const {createIterator} = vi.hoisted(() => ({createIterator: vi.fn()}));
vi.mock('../video/video-preview-iterator', () => ({
	createVideoIterator: createIterator,
}));

test.each(['paint', 'cancel', 'error'] as const)(
	'catch-up releases buffering after %s',
	async (outcome) => {
		const frame = {
			canvas: {} as OffscreenCanvas,
			timestamp: 0.5,
			duration: 1 / 30,
		};
		const events: string[] = [];
		let release: () => void = () => undefined;
		const pending = new Promise<void>((resolve) => {
			release = resolve;
		});
		const tryToSatisfySeek = vi.fn<VideoIterator['tryToSatisfySeek']>(
			async (_time, options) => {
				expect(options.pendingFrameBehavior).toBe('wait');
				options.onWait();
				options.onWait();
				await pending;
				if (outcome === 'error') throw new Error('decode failed');
				if (!options.shouldContinue())
					return {type: 'not-satisfied', reason: 'seek was superseded'};
				return {type: 'satisfied', frame};
			},
		);
		createIterator.mockResolvedValue({
			initialFrame: frame,
			isDestroyed: () => false,
			destroy: () => undefined,
			tryToSatisfySeek,
		});
		const manager = await videoIteratorManager({
			videoTrack: {} as InputVideoTrack,
			delayPlaybackHandleIfNotPremounting: () => {
				events.push('block');
				return {
					unblock: () => {
						events.push('unblock');
					},
					[Symbol.dispose]: () => {
						events.push('unblock');
					},
				};
			},
			context: null,
			canvas: null,
			getOnVideoFrameCallback: () => () => {
				events.push('paint');
			},
			logLevel: 'error',
			drawDebugOverlay: () => undefined,
			getLoopSegmentMediaEndTimestamp: () => 10,
			getStartTime: () => 0,
			getIsLooping: () => false,
			getEffects: () => [],
			getEffectChainState: () => null,
		});
		await manager.startVideoIterator(0, {isStale: () => false});
		events.length = 0;
		let stale = false;
		const seeking = manager.seek({
			newTime: 0.5,
			nonce: {isStale: () => stale},
			fps: 30,
			playbackRate: 1,
			isPlaying: false,
			continuousPlayback: true,
		});
		expect(events).toEqual(['block']);
		stale = outcome === 'cancel';
		release();
		if (outcome === 'error')
			await expect(seeking).rejects.toThrow('decode failed');
		else await seeking;
		expect(events).toEqual(
			outcome === 'paint'
				? ['block', 'paint', 'unblock']
				: ['block', 'unblock'],
		);
		expect(manager.getVideoIteratorsCreated()).toBe(1);
		manager.destroy();
	},
);
