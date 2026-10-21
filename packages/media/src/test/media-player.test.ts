import {
	AudioBufferSink,
	CanvasSink,
	InputAudioTrack,
	InputVideoTrack,
} from 'mediabunny';
import type {EffectDefinitionAndStack} from 'remotion';
import {Internals} from 'remotion';
import {expect, test, vi} from 'vitest';
import {MediaPlayer} from '../media-player';
import type {SharedAudioContextForMediaPlayer} from '../shared-audio-context-for-media-player';

const makeBufferState = () => {
	const noopBufferState = {
		delayPlayback: () => {
			let unblocked = false;
			return {
				unblock: () => {
					if (!unblocked) {
						unblocked = true;
					}
				},
			};
		},
	};

	return noopBufferState;
};

const makeSharedAudioContext = (): SharedAudioContextForMediaPlayer => {
	const audioContext = new AudioContext();
	return {
		audioContext,
		gainNode: audioContext.createGain(),
		audioSyncAnchor: {value: 0},
		scheduleAudioNode: () => ({
			type: 'started',
			scheduledTime: 0,
		}),
		unscheduleAudioNode: () => {},
	};
};

const makeAudioPlayer = (
	sharedAudioContext: SharedAudioContextForMediaPlayer | null,
	onError: ((error: Error) => void) | null = null,
	tagType: 'audio' | 'video' = 'audio',
	options:
		| (Pick<
				ConstructorParameters<typeof MediaPlayer>[0],
				'canvas' | 'onVideoFrameCallback' | 'src'
		  > &
				Partial<
					Pick<
						ConstructorParameters<typeof MediaPlayer>[0],
						'getEffects' | 'getEffectChainState'
					>
				>)
		| null = null,
) => {
	return new MediaPlayer({
		canvas: options?.canvas ?? null,
		src:
			options?.src ??
			(tagType === 'audio' ? '/voice-note.m4a' : '/bigbuckbunny.mp4'),
		logLevel: 'error',
		sharedAudioContext,
		loop: false,
		trimBefore: undefined,
		trimAfter: undefined,
		playbackRate: 1,
		toneFrequency: 1,
		globalPlaybackRate: 1,
		audioStreamIndex: null,
		fps: 30,
		debugOverlay: false,
		bufferState: makeBufferState(),
		isPremounting: false,
		isPostmounting: false,
		durationInFrames: 300,
		onVideoFrameCallback: options?.onVideoFrameCallback ?? null,
		playing: false,
		sequenceOffset: 0,
		credentials: undefined,
		requestInit: undefined,
		tagType,
		getEffects: options?.getEffects ?? (() => []),
		getEffectChainState: options?.getEffectChainState ?? (() => null),
		maxCanvasSinkFrameSize: null,
		onError,
	});
};

test('audio-only file should initialize without `audioStreamIndex` (regression for #7210)', async () => {
	const player = makeAudioPlayer(makeSharedAudioContext());

	const result = await player.initialize(0, false, 1);

	expect(result.type).toBe('success');

	await player.dispose();
});

test('queued playback cannot consume a superseded seek boundary', async () => {
	const player = makeAudioPlayer(null, null, 'video');
	try {
		expect((await player.initialize(0, true, 1)).type).toBe('success');
		const manager = player.videoIteratorManager!;
		await player.seekTo(0, {revision: 0, playing: true});
		await player.seekTo(2, {revision: 0, playing: true});
		expect(manager.getVideoIteratorsCreated()).toBe(1);
		expect(manager.getFramesRendered()).toBeGreaterThan(1);

		// Both requests are enqueued before either executes. The first request
		// goes stale, but the second still needs to establish revision 1.
		await Promise.all([
			player.seekTo(8, {revision: 1, playing: true}),
			player.seekTo(8.1, {revision: 1, playing: true}),
		]);
		expect(manager.getVideoIteratorsCreated()).toBe(2);
		await player.seekTo(8.5, {revision: 1, playing: true});
		expect(manager.getVideoIteratorsCreated()).toBe(2);
		await player.seekTo(0, {revision: 1, playing: true});
		expect(manager.getVideoIteratorsCreated()).toBe(3);
	} finally {
		await player.dispose();
	}
});

test('uses the initial volume before audio playback is ready', async () => {
	const sharedAudioContext = makeSharedAudioContext();
	const mediaGainNodes: GainNode[] = [];
	const createGain = sharedAudioContext.audioContext.createGain.bind(
		sharedAudioContext.audioContext,
	);
	const createGainSpy = vi
		.spyOn(sharedAudioContext.audioContext, 'createGain')
		.mockImplementation(() => {
			const gainNode = createGain();
			mediaGainNodes.push(gainNode);
			return gainNode;
		});
	const player = makeAudioPlayer(sharedAudioContext);

	try {
		const result = await player.initialize(0, false, 0.25);

		expect(result.type).toBe('success');
		expect(mediaGainNodes).toHaveLength(1);
		expect(mediaGainNodes[0].gain.value).toBe(0.25);

		player.setMuted(true);
		expect(mediaGainNodes[0].gain.value).toBe(0);
		player.setMuted(false);
		expect(mediaGainNodes[0].gain.value).toBe(0.25);
	} finally {
		createGainSpy.mockRestore();
		await player.dispose();
	}
});

test('dispose should immediately unblock a pending playback catch-up', async () => {
	let activeBlocks = 0;
	let delayPlaybackCalled: () => void = () => {};

	const bufferState = {
		delayPlayback: () => {
			activeBlocks++;
			delayPlaybackCalled();
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
	};

	const audioContext = new AudioContext();
	const sharedAudioContext: SharedAudioContextForMediaPlayer = {
		audioContext,
		gainNode: audioContext.createGain(),
		audioSyncAnchor: {value: 0},
		scheduleAudioNode: () => ({
			type: 'started',
			scheduledTime: 0,
		}),
		unscheduleAudioNode: () => {},
	};

	const player = new MediaPlayer({
		canvas: null,
		src: 'https://remotion.media/video.mp4',
		logLevel: 'error',
		sharedAudioContext,
		loop: false,
		trimBefore: undefined,
		trimAfter: undefined,
		playbackRate: 1,
		toneFrequency: 1,
		globalPlaybackRate: 1,
		audioStreamIndex: 0,
		fps: 30,
		debugOverlay: false,
		bufferState,
		isPremounting: false,
		isPostmounting: false,
		durationInFrames: 300,
		onVideoFrameCallback: null,
		playing: false,
		sequenceOffset: 0,
		credentials: undefined,
		requestInit: undefined,
		tagType: 'video',
		getEffects: () => [],
		getEffectChainState: () => null,
		maxCanvasSinkFrameSize: null,
		onError: null,
	});

	await player.initialize(0, false, 1);
	await player.seekTo(0, {revision: 0, playing: true});

	const seekDelayPromise = new Promise<void>((resolve) => {
		delayPlaybackCalled = resolve;
	});

	const seekPromise = player.seekTo(9, {revision: 0, playing: true});

	await seekDelayPromise;

	expect(activeBlocks).toBeGreaterThan(0);

	await player.dispose();

	expect(activeBlocks).toBe(0);

	await seekPromise.catch(() => {});
});

test.each(['video'] as const)(
	'reports a required %s seek failure once and stops playback and seeking',
	async (tagType) => {
		const onError = vi.fn();
		const player = makeAudioPlayer(null, onError);
		const error = new TypeError('Failed to fetch');
		const seek = vi.fn(() => Promise.reject(error));
		player[`${tagType}IteratorManager`] = {seek, destroy: vi.fn()} as never;
		player.play();

		await player.seekTo(1, null);
		player.play();
		await player.seekTo(2, null);

		expect(onError).toHaveBeenCalledOnce();
		expect(onError).toHaveBeenCalledWith(error);
		expect(seek).toHaveBeenCalledOnce();
		// Inspect playback state without exposing a new public API for this test.
		// eslint-disable-next-line dot-notation
		expect(player['playing']).toBe(false);
		player[`${tagType}IteratorManager`] = null;
		await player.dispose();
	},
);

test.each(['audio', 'video'] as const)(
	'reports a scheduled audio read failure once for %s playback',
	async (tagType) => {
		const onError = vi.fn();
		const player = makeAudioPlayer(makeSharedAudioContext(), onError, tagType);
		await player.initialize(0, false, 1);
		player.audioIteratorManager!.destroyIterator();
		// Observe the existing buffering owner, including scheduler cleanup.
		// eslint-disable-next-line dot-notation
		const delays = player['premountAwareDelayPlayback'];
		const createHandle = delays.createHandle.bind(delays);
		const unblocks = vi.fn();
		vi.spyOn(delays, 'createHandle').mockImplementation(() => {
			const handle = createHandle();
			return {
				...handle,
				unblock: () => {
					unblocks();
					handle.unblock();
				},
			};
		});
		const error = new TypeError('Failed to fetch');
		let rejectRead!: (error: Error) => void;
		const buffers = vi
			.spyOn(AudioBufferSink.prototype, 'buffers')
			.mockImplementation(
				// The read rejects before it can yield an audio buffer.
				// eslint-disable-next-line require-yield
				async function* () {
					await new Promise<void>((_, reject) => {
						rejectRead = reject;
					});
				},
			);
		try {
			await player.seekTo(1, null);
			await vi.waitFor(() => expect(rejectRead).toBeDefined());
			rejectRead(error);

			await vi.waitFor(() => expect(onError).toHaveBeenCalledWith(error));
			player.play();
			await player.seekTo(2, null);
			expect(onError).toHaveBeenCalledOnce();
			expect(unblocks).toHaveBeenCalled();
			expect(buffers).toHaveBeenCalledOnce();
			// eslint-disable-next-line dot-notation
			expect(player['playing']).toBe(false);
		} finally {
			buffers.mockRestore();
			await player.dispose();
		}
	},
);

test('ignores pending seek failures after disposal and skips new seeks', async () => {
	const onError = vi.fn();
	const player = makeAudioPlayer(null, onError);
	let rejectSeek!: (error: Error) => void;
	const seek = vi.fn(
		() =>
			new Promise<void>((_, reject) => {
				rejectSeek = reject;
			}),
	);
	player.videoIteratorManager = {seek} as never;

	const pending = player.seekTo(1, null);
	await vi.waitFor(() => expect(seek).toHaveBeenCalledOnce());
	player.videoIteratorManager = null;
	await player.dispose();
	rejectSeek(new TypeError('Failed to fetch'));
	await pending;
	player.videoIteratorManager = {seek} as never;
	await player.seekTo(2, null);

	expect(onError).not.toHaveBeenCalled();
	expect(seek).toHaveBeenCalledOnce();
	player.videoIteratorManager = null;
});

// A disposed initialization must not repaint a canvas reused by its replacement.
test.each(['dimensions', 'first frame', 'effect bridge'] as const)(
	'disposing during %s initialization preserves the replacement picture',
	async (boundary) => {
		let release = () => {};
		const gate = new Promise<void>((resolve) => {
			release = resolve;
		});
		let reached = () => {};
		const held = new Promise<void>((resolve) => {
			reached = resolve;
		});
		const canvas = document.createElement('canvas');
		const chainState = Internals.createEffectChainState(1920, 1080);
		const effects: EffectDefinitionAndStack<unknown>[] = (
			['webgl2', '2d'] as const
		).map((backend) => ({
			memoized: true,
			effectKey: backend,
			params: {},
			definition: {
				type: backend,
				label: backend,
				documentationLink: null,
				backend,
				calculateKey: () => backend,
				schema: {},
				validateParams: () => {},
				setup: () => null,
				cleanup: () => {},
				apply: ({target, source}) => {
					if (backend === 'webgl2') {
						const gl = target.getContext('webgl2')!;
						gl.clearColor(0, 1, 0, 1);
						gl.clear(gl.COLOR_BUFFER_BIT);
					} else {
						target.getContext('2d')!.drawImage(source, 0, 0);
					}
				},
			},
		}));
		const onFrame = vi.fn();
		const oldPlayer = makeAudioPlayer(null, null, 'video', {
			canvas,
			onVideoFrameCallback: onFrame,
			src: '/bigbuckbunny.mp4',
			getEffects: () => (boundary === 'effect bridge' ? effects : []),
			getEffectChainState: () => chainState,
		});
		const replacement = makeAudioPlayer(null, null, 'video', {
			canvas,
			onVideoFrameCallback: null,
			src: '/red-heart-1x.webm',
		});
		const originalWidth = InputVideoTrack.prototype.getDisplayWidth;
		const originalCanvases = CanvasSink.prototype.canvases;
		const originalBitmap = window.createImageBitmap.bind(window);
		const spy =
			boundary === 'dimensions'
				? vi
						.spyOn(InputVideoTrack.prototype, 'getDisplayWidth')
						.mockImplementationOnce(async function (this: InputVideoTrack) {
							const width = await originalWidth.call(this);
							reached();
							await gate;
							return width;
						})
				: boundary === 'effect bridge'
					? vi
							.spyOn(window, 'createImageBitmap')
							.mockImplementationOnce(async (...args) => {
								const bitmap = await originalBitmap(...args);
								reached();
								await gate;
								return bitmap;
							})
					: vi
							.spyOn(CanvasSink.prototype, 'canvases')
							.mockImplementationOnce(function (this: CanvasSink, ...args) {
								const iterator = originalCanvases.apply(this, args);
								const next = iterator.next.bind(iterator);
								iterator.next = async (...nextArgs) => {
									const frame = await next(...nextArgs);
									reached();
									await gate;
									return frame;
								};

								return iterator;
							});
		const initialization = oldPlayer.initialize(1, true, 1);
		let disposal: Promise<void> | null = null;
		const picture = async () => {
			const pixels = canvas
				.getContext('2d')!
				.getImageData(0, 0, canvas.width, canvas.height).data;
			return Array.from(
				new Uint8Array(await crypto.subtle.digest('SHA-256', pixels)),
			);
		};

		try {
			await held;
			disposal = oldPlayer.dispose();
			expect((await replacement.initialize(1, true, 1)).type).toBe('success');
			expect(
				replacement.videoIteratorManager!.getFramesRendered(),
			).toBeGreaterThan(0);
			const expected = await picture();
			release();
			await disposal;
			expect(await picture()).toEqual(expected);
			expect(onFrame).not.toHaveBeenCalled();
			expect((await initialization).type).toBe('disposed');
		} finally {
			release();
			await initialization;
			await disposal;
			spy.mockRestore();
			await oldPlayer.dispose();
			await replacement.dispose();
			Internals.cleanupEffectChainState(chainState);
		}
	},
);

test('disposal clears a rendered canvas only once', async () => {
	const canvas = document.createElement('canvas');
	const player = makeAudioPlayer(null, null, 'video', {
		canvas,
		onVideoFrameCallback: null,
		src: '/bigbuckbunny.mp4',
	});
	try {
		expect((await player.initialize(1, true, 1)).type).toBe('success');
		const clear = vi.spyOn(canvas.getContext('2d')!, 'clearRect');
		try {
			await player.dispose();
			expect(clear).toHaveBeenCalledOnce();
		} finally {
			clear.mockRestore();
		}
	} finally {
		await player.dispose();
	}
});

// Regression: unsupported audio blocked even the muted video surface.
test('draws muted video with unsupported audio and reports it on unmute', async () => {
	const support = vi
		.spyOn(InputAudioTrack.prototype, 'canDecode')
		.mockResolvedValue(false);
	const errors: Error[] = [];
	let frames = 0;
	const sharedAudioContext = makeSharedAudioContext();
	const player = makeAudioPlayer(
		sharedAudioContext,
		(error) => errors.push(error),
		'video',
		{
			src: '/bigbuckbunny.mp4',
			canvas: document.createElement('canvas'),
			onVideoFrameCallback: () => {
				frames++;
			},
		},
	);
	try {
		expect((await player.initialize(0, true, 1)).type).toBe('success');
		expect(frames).toBeGreaterThan(0);
		expect(errors).toHaveLength(0);
		player.setMuted(false);
		expect(errors).toHaveLength(1);
		expect(errors[0].message).toContain('Cannot decode audio');
		player.setMuted(false);
		expect(errors).toHaveLength(1);
	} finally {
		await player.dispose();
		await sharedAudioContext.audioContext.close();
		support.mockRestore();
	}
});
