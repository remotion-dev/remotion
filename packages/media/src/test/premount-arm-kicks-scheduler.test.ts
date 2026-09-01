import type {useBufferState} from 'remotion';
import {expect, test} from 'vitest';
import {waitForTurn} from '../audio/sort-by-priority';
import {MediaPlayer} from '../media-player';

const makePlayer = ({
	isPremounting,
	isPostmounting,
}: {
	isPremounting: boolean;
	isPostmounting: boolean;
}) => {
	return new MediaPlayer({
		canvas: null,
		src: '/bigbuckbunny.mp4',
		logLevel: 'info',
		sharedAudioContext: null,
		loop: false,
		trimBefore: undefined,
		trimAfter: undefined,
		playbackRate: 1,
		toneFrequency: 1,
		globalPlaybackRate: 1,
		audioStreamIndex: 0,
		fps: 30,
		debugOverlay: false,
		bufferState: {
			delayPlayback: () => ({unblock: () => undefined}),
		} as unknown as ReturnType<typeof useBufferState>,
		isPremounting,
		isPostmounting,
		durationInFrames: 100,
		onVideoFrameCallback: null,
		playing: false,
		sequenceOffset: 0,
		credentials: undefined,
		requestInit: undefined,
		tagType: 'audio',
		getEffects: () => [],
		getEffectChainState: () => null,
	});
};

const sleep = (ms: number) =>
	new Promise<void>((resolve) => {
		setTimeout(resolve, ms);
	});

const parkWaiter = () => {
	const events: string[] = [];
	let priority: number | null = 3;

	waitForTurn({
		getPriority: () => priority,
		fn: () => Promise.resolve('deferred'),
		onDone: (_, triggerNext) => {
			events.push('done');
			triggerNext();
		},
		onError: (err) => {
			events.push((err as Error).name);
		},
	});

	return {
		events,
		setPriority: (newPriority: number | null) => {
			priority = newPriority;
		},
	};
};

test('ending premounting gives deferred audio waiters a turn', async () => {
	const {events, setPriority} = parkWaiter();
	const mediaPlayer = makePlayer({isPremounting: true, isPostmounting: false});

	setPriority(1);
	await sleep(50);
	expect(events).toEqual([]);

	mediaPlayer.setIsPremounting(false);
	await sleep(50);
	expect(events).toEqual(['done']);
});

test('ending postmounting gives deferred audio waiters a turn', async () => {
	const {events, setPriority} = parkWaiter();
	const mediaPlayer = makePlayer({isPremounting: false, isPostmounting: true});

	setPriority(1);
	await sleep(50);
	expect(events).toEqual([]);

	mediaPlayer.setIsPostmounting(false);
	await sleep(50);
	expect(events).toEqual(['done']);
});

test('the kick keeps deferring waiters beyond the horizon and sweeps stale ones', async () => {
	const {events, setPriority} = parkWaiter();
	const mediaPlayer = makePlayer({isPremounting: true, isPostmounting: false});

	mediaPlayer.setIsPremounting(false);
	await sleep(50);
	expect(events).toEqual([]);

	setPriority(null);
	mediaPlayer.setIsPremounting(true);
	await sleep(50);
	expect(events).toEqual(['StaleWaiterError']);
});
