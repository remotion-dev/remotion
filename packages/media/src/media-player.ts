import {ALL_FORMATS, Input, UrlSource} from 'mediabunny';
import type {LogLevel, useBufferState} from 'remotion';
import type {EffectChainState} from 'remotion';
import {Internals} from 'remotion';
import type {ScheduleAudioNodeResult} from 'remotion';
import type {EffectsProp} from 'remotion';
import {
	audioIteratorManager,
	type AudioIteratorManager,
} from './audio-iterator-manager';
import {
	getDurationOfNode,
	getOffset,
	getScheduledTime,
} from './audio/get-scheduled-time';
import {drawPreviewOverlay} from './debug-overlay/preview-overlay';
import type {DelayPlaybackIfNotPremounting} from './delay-playback-if-not-premounting';
import {getDurationOrCompute} from './get-duration-or-compute';
import {calculateEndTime, getTimeInSeconds} from './get-time-in-seconds';
import {resolveAudioTrack} from './helpers/resolve-audio-track';
import {isNetworkError} from './is-type-of-error';
import type {Nonce, NonceManager} from './nonce-manager';
import {makeNonceManager} from './nonce-manager';
import type {SharedAudioContextForMediaPlayer} from './shared-audio-context-for-media-player';
import type {VideoIteratorManager} from './video-iterator-manager';
import {videoIteratorManager} from './video-iterator-manager';

export type MediaPlayerInitResult =
	| {type: 'success'; durationInSeconds: number}
	| {type: 'unknown-container-format'}
	| {type: 'cannot-decode'}
	| {type: 'network-error'}
	| {type: 'no-tracks'}
	| {type: 'disposed'};

export class MediaPlayer {
	private tagType: 'audio' | 'video';
	private canvas: HTMLCanvasElement | OffscreenCanvas | null;
	private context:
		| OffscreenCanvasRenderingContext2D
		| CanvasRenderingContext2D
		| null;

	private src: string;
	private logLevel: LogLevel;
	private playbackRate: number;
	private globalPlaybackRate: number;
	private audioStreamIndex: number | null;

	private sharedAudioContext: SharedAudioContextForMediaPlayer | null;

	audioIteratorManager: AudioIteratorManager | null = null;
	videoIteratorManager: VideoIteratorManager | null = null;

	private playing = false;
	private loop = false;
	private fps: number;

	private trimBefore: number | undefined;
	private trimAfter: number | undefined;
	private sequenceDurationInFrames: number;
	private sequenceOffset: number;

	private totalDuration: number | undefined;

	private debugOverlay = false;

	private nonceManager: NonceManager;

	private onVideoFrameCallback: null | ((frame: CanvasImageSource) => void) =
		null;

	private getEffects: () => EffectsProp;
	private getEffectChainState: (
		width: number,
		height: number,
	) => EffectChainState | null;

	private getCurrentFrame: () => number;

	private initializationPromise: Promise<MediaPlayerInitResult> | null = null;

	private bufferState: ReturnType<typeof useBufferState>;

	private isPremounting: boolean;
	private isPostmounting: boolean;
	private seekPromiseChain: Promise<unknown> = Promise.resolve();

	constructor({
		canvas,
		src,
		logLevel,
		sharedAudioContext,
		loop,
		trimBefore,
		trimAfter,
		playbackRate,
		globalPlaybackRate,
		audioStreamIndex,
		fps,
		debugOverlay,
		bufferState,
		isPremounting,
		isPostmounting,
		durationInFrames,
		onVideoFrameCallback,
		playing,
		sequenceOffset,
		credentials,
		tagType,
		getEffects,
		getEffectChainState,
		getCurrentFrame,
	}: {
		canvas: HTMLCanvasElement | OffscreenCanvas | null;
		src: string;
		logLevel: LogLevel;
		sharedAudioContext: SharedAudioContextForMediaPlayer | null;
		loop: boolean;
		trimBefore: number | undefined;
		trimAfter: number | undefined;
		playbackRate: number;
		globalPlaybackRate: number;
		audioStreamIndex: number | null;
		fps: number;
		debugOverlay: boolean;
		bufferState: ReturnType<typeof useBufferState>;
		isPremounting: boolean;
		isPostmounting: boolean;
		durationInFrames: number;
		onVideoFrameCallback: null | ((frame: CanvasImageSource) => void);
		playing: boolean;
		sequenceOffset: number;
		credentials: RequestCredentials | undefined;
		tagType: 'audio' | 'video';
		getEffects: () => EffectsProp;
		getEffectChainState: (
			width: number,
			height: number,
		) => EffectChainState | null;
		getCurrentFrame: () => number;
	}) {
		this.canvas = canvas ?? null;
		this.src = src;
		this.logLevel = logLevel;
		this.sharedAudioContext = sharedAudioContext;
		this.playbackRate = playbackRate;
		this.globalPlaybackRate = globalPlaybackRate;
		this.loop = loop;
		this.trimBefore = trimBefore;
		this.trimAfter = trimAfter;
		this.audioStreamIndex = audioStreamIndex;
		this.fps = fps;
		this.debugOverlay = debugOverlay;
		this.bufferState = bufferState;
		this.isPremounting = isPremounting;
		this.isPostmounting = isPostmounting;
		this.sequenceDurationInFrames = durationInFrames;
		this.nonceManager = makeNonceManager();
		this.onVideoFrameCallback = onVideoFrameCallback;
		this.playing = playing;
		this.sequenceOffset = sequenceOffset;
		this.input = new Input({
			source: new UrlSource(
				this.src,
				credentials
					? {
							requestInit: {credentials},
						}
					: undefined,
			),
			formats: ALL_FORMATS,
		});
		this.tagType = tagType;
		this.getEffects = getEffects;
		this.getEffectChainState = getEffectChainState;
		this.getCurrentFrame = getCurrentFrame;

		if (canvas) {
			const context = canvas.getContext('2d', {
				alpha: true,
				desynchronized: true,
			}) as OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D | null;

			if (!context) {
				throw new Error('Could not get 2D context from canvas');
			}

			this.context = context;
		} else {
			this.context = null;
		}
	}

	private input: Input;

	private isDisposalError(): boolean {
		return this.input.disposed === true;
	}

	public initialize(
		startTimeUnresolved: number,
		initialMuted: boolean,
	): Promise<MediaPlayerInitResult> {
		const promise = this._initialize(startTimeUnresolved, initialMuted);
		this.initializationPromise = promise;
		this.seekPromiseChain = promise;
		return promise;
	}

	private getStartTime(): number {
		return (this.trimBefore ?? 0) / this.fps;
	}

	private getSequenceEndTimestamp(): number {
		// Cap at the media time corresponding to the end of the sequence
		return (
			(this.sequenceDurationInFrames / this.fps) * this.playbackRate +
			this.getStartTime()
		);
	}

	private getSequenceDurationInSeconds(): number {
		return this.sequenceDurationInFrames / this.fps;
	}

	private getMediaEndTimestamp(): number {
		return calculateEndTime({
			mediaDurationInSeconds: this.totalDuration!,
			ifNoMediaDuration: 'fail',
			src: this.src,
			trimAfter: this.trimAfter,
			trimBefore: this.trimBefore,
			fps: this.fps,
		});
	}

	private getLoopSegmentMediaEndTimestamp(): number {
		return Math.min(
			this.getMediaEndTimestamp(),
			this.getSequenceEndTimestamp(),
		);
	}

	private async _initialize(
		startTimeUnresolved: number,
		initialMuted: boolean,
	): Promise<MediaPlayerInitResult> {
		using _ = this.delayPlaybackHandleIfNotPremounting();
		try {
			if (this.input.disposed) {
				return {type: 'disposed'};
			}

			try {
				await this.input.getFormat();
			} catch (error) {
				if (this.isDisposalError()) {
					return {type: 'disposed'};
				}

				const err = error as Error;

				if (isNetworkError(err)) {
					throw error;
				}

				Internals.Log.error(
					{logLevel: this.logLevel, tag: '@remotion/media'},
					`[MediaPlayer] Failed to recognize format for ${this.src}`,
					error,
				);

				return {type: 'unknown-container-format'};
			}

			const [durationInSeconds, videoTrack, audioTracks] = await Promise.all([
				getDurationOrCompute(this.input),
				this.input.getPrimaryVideoTrack(),
				this.input.getAudioTracks(),
			]);
			if (this.input.disposed) {
				return {type: 'disposed'};
			}

			this.totalDuration = durationInSeconds;

			const audioTrack = await resolveAudioTrack({
				videoTrack,
				audioTracks,
				audioStreamIndex: this.audioStreamIndex,
			});

			if (!videoTrack && !audioTrack) {
				return {type: 'no-tracks'};
			}

			if (videoTrack && this.tagType === 'video') {
				if (await videoTrack.isLive()) {
					throw new Error(
						'Live streams are not currently supported by Remotion. Sorry! Source: ' +
							this.src,
					);
				}

				if (await videoTrack.isRelativeToUnixEpoch()) {
					throw new Error(
						'Streams with UNIX timestamps are not currently supported by Remotion. Sorry! Source: ' +
							this.src,
					);
				}

				const canDecode = await videoTrack.canDecode();

				if (!canDecode) {
					return {type: 'cannot-decode'};
				}

				if (this.input.disposed) {
					return {type: 'disposed'};
				}

				this.videoIteratorManager = await videoIteratorManager({
					videoTrack,
					delayPlaybackHandleIfNotPremounting:
						this.delayPlaybackHandleIfNotPremounting,
					context: this.context,
					canvas: this.canvas,
					getOnVideoFrameCallback: () => this.onVideoFrameCallback,
					logLevel: this.logLevel,
					drawDebugOverlay: this.drawDebugOverlay,
					getLoopSegmentMediaEndTimestamp: () =>
						this.getLoopSegmentMediaEndTimestamp(),
					getStartTime: () => this.getStartTime(),
					getIsLooping: () => this.loop,
					getEffects: this.getEffects,
					getEffectChainState: this.getEffectChainState,
					getCurrentFrame: this.getCurrentFrame,
				});
			}

			const startTime = this.getTrimmedTime(startTimeUnresolved);

			if (startTime === null) {
				throw new Error(`should have asserted that the time is not null`);
			}

			if (audioTrack && this.sharedAudioContext) {
				if (await audioTrack.isLive()) {
					throw new Error(
						'Live streams are not currently supported by Remotion. Sorry! Source: ' +
							this.src,
					);
				}

				if (await audioTrack.isRelativeToUnixEpoch()) {
					throw new Error(
						'Streams with UNIX timestamps are not currently supported by Remotion. Sorry! Source: ' +
							this.src,
					);
				}

				const canDecode = await audioTrack.canDecode();
				if (!canDecode) {
					return {type: 'cannot-decode'};
				}

				if (this.input.disposed) {
					return {type: 'disposed'};
				}

				this.audioIteratorManager = audioIteratorManager({
					audioTrack,
					delayPlaybackHandleIfNotPremounting:
						this.delayPlaybackHandleIfNotPremounting,
					sharedAudioContext: this.sharedAudioContext,
					getMediaEndTimestamp: () => this.getMediaEndTimestamp(),
					getSequenceEndTimestamp: () => this.getSequenceEndTimestamp(),
					getStartTime: () => this.getStartTime(),
					initialMuted,
					drawDebugOverlay: this.drawDebugOverlay,
					initialPlaybackRate: this.playbackRate * this.globalPlaybackRate,
					getSequenceDurationInSeconds: () =>
						this.getSequenceDurationInSeconds(),
					initialTrimBefore: this.trimBefore,
					initialTrimAfter: this.trimAfter,
					initialSequenceOffset: this.sequenceOffset,
					initialSequenceDurationInFrames: this.sequenceDurationInFrames,
					initialLoop: this.loop,
					initialFps: this.fps,
				});
			}

			const nonce = this.nonceManager.createAsyncOperation();

			try {
				await Promise.all([
					this.audioIteratorManager
						? this.audioIteratorManager.startAudioIterator({
								nonce,
								playbackRate: this.playbackRate * this.globalPlaybackRate,
								startFromSecond: startTime,
								scheduleAudioNode: this.scheduleAudioNode,
								getTargetTime: this.getTargetTime,
								logLevel: this.logLevel,
								loop: this.loop,
								unscheduleAudioNode:
									this.sharedAudioContext!.unscheduleAudioNode,
								getAudioContextCurrentTimeMockedInTest: () =>
									this.sharedAudioContext!.audioContext.currentTime,
							})
						: Promise.resolve(),
					this.videoIteratorManager
						? this.videoIteratorManager.startVideoIterator(startTime, nonce)
						: Promise.resolve(),
				]);
			} catch (error) {
				if (this.isDisposalError()) {
					return {type: 'disposed'};
				}

				Internals.Log.error(
					{logLevel: this.logLevel, tag: '@remotion/media'},
					'[MediaPlayer] Failed to start audio and video iterators',
					error,
				);
			}

			return {type: 'success', durationInSeconds};
		} catch (error) {
			const err = error as Error;

			if (isNetworkError(err)) {
				Internals.Log.error(
					{logLevel: this.logLevel, tag: '@remotion/media'},
					`[MediaPlayer] Network/CORS error for ${this.src}`,
					err,
				);
				return {type: 'network-error'};
			}

			Internals.Log.error(
				{logLevel: this.logLevel, tag: '@remotion/media'},
				'[MediaPlayer] Failed to initialize',
				error,
			);
			throw error;
		}
	}

	private seekToWithQueue = async (newTime: number) => {
		const nonce = this.nonceManager.createAsyncOperation();
		await this.seekPromiseChain;

		this.seekPromiseChain = this.seekToDoNotCallDirectly(newTime, nonce);
		await this.seekPromiseChain;
	};

	public async seekTo(time: number): Promise<void> {
		const newTime = this.getTrimmedTime(time);

		if (newTime === null) {
			throw new Error(`should have asserted that the time is not null`);
		}

		await this.seekToWithQueue(newTime);
	}

	private async seekToDoNotCallDirectly(
		newTime: number,
		nonce: Nonce,
	): Promise<void> {
		if (nonce.isStale()) {
			return;
		}

		try {
			await Promise.all([
				this.videoIteratorManager?.seek({
					newTime,
					nonce,
				}),
				this.audioIteratorManager?.seek({
					newTime,
					nonce,
					playbackRate: this.playbackRate * this.globalPlaybackRate,
					getTargetTime: this.getTargetTime,
					logLevel: this.logLevel,
					loop: this.loop,
					trimBefore: this.trimBefore,
					trimAfter: this.trimAfter,
					sequenceOffset: this.sequenceOffset,
					sequenceDurationInFrames: this.sequenceDurationInFrames,
					fps: this.fps,
					scheduleAudioNode: this.scheduleAudioNode,
					getAudioContextCurrentTimeMockedInTest: () =>
						this.sharedAudioContext!.audioContext.currentTime,
				}),
			]);
		} catch (error) {
			if (this.isDisposalError()) {
				return;
			}

			throw error;
		}
	}

	public play(): void {
		if (this.playing) {
			return;
		}

		this.playing = true;

		this.drawDebugOverlay();
	}

	private delayPlaybackHandleIfNotPremounting =
		(): DelayPlaybackIfNotPremounting => {
			if (this.isPremounting || this.isPostmounting) {
				return {
					unblock: () => {},
					[Symbol.dispose]: () => {},
				};
			}

			const {unblock} = this.bufferState.delayPlayback();
			return {
				unblock,
				[Symbol.dispose]: () => {
					unblock();
				},
			};
		};

	public pause(): void {
		if (!this.playing) {
			return;
		}

		this.playing = false;
		this.drawDebugOverlay();
	}

	public setMuted(muted: boolean): void {
		this.audioIteratorManager?.setMuted(muted);
	}

	public setVolume(volume: number): void {
		if (!this.audioIteratorManager) {
			return;
		}

		this.audioIteratorManager.setVolume(volume);
	}

	private getTrimmedTime(unloopedTimeInSeconds: number): number | null {
		return getTimeInSeconds({
			unloopedTimeInSeconds,
			playbackRate: this.playbackRate,
			loop: this.loop,
			trimBefore: this.trimBefore,
			trimAfter: this.trimAfter,
			mediaDurationInSeconds: this.totalDuration ?? null,
			fps: this.fps,
			ifNoMediaDuration: 'infinity',
			src: this.src,
		});
	}

	public async setTrimBefore(
		trimBefore: number | undefined,
		unloopedTimeInSeconds: number,
	): Promise<void> {
		if (this.trimBefore !== trimBefore) {
			this.trimBefore = trimBefore;
			this.audioIteratorManager?.destroyIterator();
			await this.seekTo(unloopedTimeInSeconds);
		}
	}

	public async setTrimAfter(
		trimAfter: number | undefined,
		unloopedTimeInSeconds: number,
	): Promise<void> {
		if (this.trimAfter !== trimAfter) {
			this.trimAfter = trimAfter;
			this.audioIteratorManager?.destroyIterator();
			await this.seekTo(unloopedTimeInSeconds);
		}
	}

	public setDebugOverlay(debugOverlay: boolean): void {
		this.debugOverlay = debugOverlay;
	}

	public async setPlaybackRate(
		rate: number,
		unloopedTimeInSeconds: number,
	): Promise<void> {
		const previousRate = this.playbackRate;

		if (previousRate !== rate) {
			this.playbackRate = rate;
			this.audioIteratorManager?.destroyIterator();
			await this.seekTo(unloopedTimeInSeconds);
		}
	}

	public async setGlobalPlaybackRate(
		rate: number,
		unloopedTimeInSeconds: number,
	): Promise<void> {
		const previousRate = this.globalPlaybackRate;
		if (previousRate !== rate) {
			this.globalPlaybackRate = rate;
			this.audioIteratorManager?.destroyIterator();
			await this.seekTo(unloopedTimeInSeconds);
		}
	}

	public async setFps(
		fps: number,
		unloopedTimeInSeconds: number,
	): Promise<void> {
		const previousFps = this.fps;
		if (previousFps !== fps) {
			this.fps = fps;
			this.audioIteratorManager?.destroyIterator();
			await this.seekTo(unloopedTimeInSeconds);
		}
	}

	public setIsPremounting(isPremounting: boolean): void {
		this.isPremounting = isPremounting;
	}

	public setIsPostmounting(isPostmounting: boolean): void {
		this.isPostmounting = isPostmounting;
	}

	public async setLoop(
		loop: boolean,
		unloopedTimeInSeconds: number,
	): Promise<void> {
		const previousLoop = this.loop;
		if (previousLoop !== loop) {
			this.loop = loop;
			this.audioIteratorManager?.destroyIterator();
			await this.seekTo(unloopedTimeInSeconds);
		}
	}

	public async setSequenceOffset(
		offset: number,
		unloopedTimeInSeconds: number,
	): Promise<void> {
		const previousOffset = this.sequenceOffset;
		if (previousOffset !== offset) {
			this.sequenceOffset = offset;
			this.audioIteratorManager?.destroyIterator();
			await this.seekTo(unloopedTimeInSeconds);
		}
	}

	public async setSequenceDurationInFrames(
		sequenceDurationInFrames: number,
		unloopedTimeInSeconds: number,
	): Promise<void> {
		const previousDuration = this.sequenceDurationInFrames;
		if (previousDuration !== sequenceDurationInFrames) {
			this.sequenceDurationInFrames = sequenceDurationInFrames;
			await this.seekTo(unloopedTimeInSeconds);
		}
	}

	public async dispose(): Promise<void> {
		if (this.initializationPromise) {
			try {
				// wait for the init to finished
				// otherwise we might get errors like:
				// Error: Response stream reader stopped unexpectedly before all requested data was read. from UrlSource
				await this.initializationPromise;
			} catch {
				// Ignore initialization errors during disposal
			}
		}

		// Mark all async operations as stale
		this.nonceManager.createAsyncOperation();
		this.videoIteratorManager?.destroy();
		this.audioIteratorManager?.destroyIterator();
		this.input.dispose();
	}

	private getTargetTime = (
		mediaTimestamp: number,
		currentTime: number,
	): number | null => {
		if (!this.sharedAudioContext) {
			throw new Error('Shared audio context not found');
		}

		const globalTime =
			(currentTime - this.sharedAudioContext.audioSyncAnchor.value) *
			this.globalPlaybackRate;

		const timeInSeconds = globalTime - this.sequenceOffset;

		const localTime = this.getTrimmedTime(timeInSeconds);
		if (localTime === null) {
			return null;
		}

		const targetTime =
			(mediaTimestamp - localTime) /
			(this.playbackRate * this.globalPlaybackRate);

		return targetTime;
	};

	private scheduleAudioNode = (
		node: AudioBufferSourceNode,
		mediaTimestamp: number,
		originalUnloopedMediaTimestamp: number,
		currentTime: number,
	): ScheduleAudioNodeResult => {
		if (!this.sharedAudioContext) {
			throw new Error('Shared audio context not found');
		}

		const targetTime = this.getTargetTime(mediaTimestamp, currentTime);
		if (targetTime === null) {
			return {
				type: 'not-started',
				reason:
					'no target for' +
					mediaTimestamp.toFixed(3) +
					',' +
					currentTime.toFixed(3),
			};
		}

		const sequenceStartTime = this.getStartTime();
		const loopSegmentMediaEndTimestamp = this.getLoopSegmentMediaEndTimestamp();

		const offset = getOffset({
			mediaTimestamp,
			targetTime,
			sequenceStartTime,
		});

		const duration = getDurationOfNode({
			bufferDuration: node.buffer?.duration ?? 0,
			loopSegmentMediaEndTimestamp,
			offset,
			originalUnloopedMediaTimestamp,
		});

		const scheduledTime = getScheduledTime({
			mediaTimestamp,
			targetTime,
			currentTime,
			sequenceStartTime,
		});

		return this.sharedAudioContext.scheduleAudioNode({
			node,
			mediaTimestamp,
			currentTime,
			scheduledTime,
			duration,
			offset,
			originalUnloopedMediaTimestamp,
		});
	};

	public setVideoFrameCallback(
		callback: null | ((frame: CanvasImageSource) => void),
	) {
		this.onVideoFrameCallback = callback;
	}

	private drawDebugOverlay = () => {
		if (!this.debugOverlay) return;
		if (this.context && this.canvas) {
			drawPreviewOverlay({
				context: this.context,
				audioTime: this.sharedAudioContext?.audioContext.currentTime ?? null,
				audioContextState: this.sharedAudioContext?.audioContext.state ?? null,
				audioSyncAnchor: this.sharedAudioContext?.audioSyncAnchor ?? null,
				audioIteratorManager: this.audioIteratorManager,
				playing: this.playing,
				videoIteratorManager: this.videoIteratorManager,
				playbackRate: this.playbackRate * this.globalPlaybackRate,
			});
		}
	};

	public audioSyncAnchorChanged = () => {
		if (!this.audioIteratorManager) {
			return;
		}

		this.audioIteratorManager.destroyIterator();
	};
}
