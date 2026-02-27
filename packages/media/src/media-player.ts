import {ALL_FORMATS, Input, UrlSource} from 'mediabunny';
import type {LogLevel, useBufferState} from 'remotion';
import {Internals} from 'remotion';
import {
	audioIteratorManager,
	type AudioIteratorManager,
} from './audio-iterator-manager';
import {drawPreviewOverlay} from './debug-overlay/preview-overlay';
import type {DelayPlaybackIfNotPremounting} from './delay-playback-if-not-premounting';
import {calculateEndTime, getTimeInSeconds} from './get-time-in-seconds';
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
	private canvas: HTMLCanvasElement | OffscreenCanvas | null;
	private context:
		| OffscreenCanvasRenderingContext2D
		| CanvasRenderingContext2D
		| null;

	private src: string;
	private logLevel: LogLevel;
	private playbackRate: number;
	private globalPlaybackRate: number;
	private audioStreamIndex: number;

	private sharedAudioContext: SharedAudioContextForMediaPlayer | null;

	audioIteratorManager: AudioIteratorManager | null = null;
	videoIteratorManager: VideoIteratorManager | null = null;
	private sequenceOffset: number;

	private playing = false;
	private loop = false;
	private fps: number;

	private trimBefore: number | undefined;
	private trimAfter: number | undefined;
	private durationInFrames: number;

	private totalDuration: number | undefined;

	private debugOverlay = false;

	private nonceManager: NonceManager;

	private onVideoFrameCallback: null | ((frame: CanvasImageSource) => void) =
		null;

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
		audioStreamIndex: number;
		fps: number;
		debugOverlay: boolean;
		bufferState: ReturnType<typeof useBufferState>;
		isPremounting: boolean;
		isPostmounting: boolean;
		durationInFrames: number;
		onVideoFrameCallback: null | ((frame: CanvasImageSource) => void);
		playing: boolean;
		sequenceOffset: number;
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
		this.audioStreamIndex = audioStreamIndex ?? 0;
		this.fps = fps;
		this.debugOverlay = debugOverlay;
		this.bufferState = bufferState;
		this.isPremounting = isPremounting;
		this.isPostmounting = isPostmounting;
		this.durationInFrames = durationInFrames;
		this.nonceManager = makeNonceManager();
		this.onVideoFrameCallback = onVideoFrameCallback;
		this.playing = playing;
		this.sequenceOffset = sequenceOffset;

		this.input = new Input({
			source: new UrlSource(this.src),
			formats: ALL_FORMATS,
		});

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

	private input: Input<UrlSource>;

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

	private getEndTime(): number {
		const mediaEndTime = calculateEndTime({
			mediaDurationInSeconds: this.totalDuration!,
			ifNoMediaDuration: 'fail',
			src: this.src,
			trimAfter: this.trimAfter,
			trimBefore: this.trimBefore,
			fps: this.fps,
		});

		if (this.loop) {
			return mediaEndTime;
		}

		// Cap at the media time corresponding to the end of the sequence
		const sequenceEndMediaTime =
			(this.durationInFrames / this.fps) * this.playbackRate +
			(this.trimBefore ?? 0) / this.fps;

		return Math.min(mediaEndTime, sequenceEndMediaTime);
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
				this.input.computeDuration(),
				this.input.getPrimaryVideoTrack(),
				this.input.getAudioTracks(),
			]);
			if (this.input.disposed) {
				return {type: 'disposed'};
			}

			this.totalDuration = durationInSeconds;

			const audioTrack = audioTracks[this.audioStreamIndex] ?? null;

			if (!videoTrack && !audioTrack) {
				return {type: 'no-tracks'};
			}

			if (videoTrack) {
				const canDecode = await videoTrack.canDecode();

				if (!canDecode) {
					return {type: 'cannot-decode'};
				}

				if (this.input.disposed) {
					return {type: 'disposed'};
				}

				this.videoIteratorManager = videoIteratorManager({
					videoTrack,
					delayPlaybackHandleIfNotPremounting:
						this.delayPlaybackHandleIfNotPremounting,
					context: this.context,
					canvas: this.canvas,
					getOnVideoFrameCallback: () => this.onVideoFrameCallback,
					logLevel: this.logLevel,
					drawDebugOverlay: this.drawDebugOverlay,
					getEndTime: () => this.getEndTime(),
					getStartTime: () => this.getStartTime(),
					getIsLooping: () => this.loop,
				});
			}

			const startTime = this.getTrimmedTime(startTimeUnresolved);

			if (startTime === null) {
				throw new Error(`should have asserted that the time is not null`);
			}

			if (audioTrack && this.sharedAudioContext) {
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
					sharedAudioContext: this.sharedAudioContext.audioContext,
					getIsLooping: () => this.loop,
					getEndTime: () => this.getEndTime(),
					getStartTime: () => this.getStartTime(),
					initialMuted,
					drawDebugOverlay: this.drawDebugOverlay,
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
								getIsPlaying: () => this.playing,
								scheduleAudioNode: (node, mediaTimestamp, maxDuration) => {
									if (!this.sharedAudioContext) {
										throw new Error('Shared audio context not found');
									}

									const currentTime = this.getAudioPlaybackTime();
									return this.sharedAudioContext.scheduleAudioNode({
										node,
										mediaTimestamp,
										currentMediaTime: currentTime,
										combinedPlaybackRate:
											this.playbackRate * this.globalPlaybackRate,
										maxDuration,
									});
								},
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

		const shouldSeekAudio =
			this.audioIteratorManager &&
			this.sharedAudioContext &&
			this.getAudioPlaybackTime() !== newTime;

		try {
			await Promise.all([
				this.videoIteratorManager?.seek({
					newTime,
					nonce,
				}),
				shouldSeekAudio
					? this.audioIteratorManager?.seek({
							newTime,
							nonce,
							playbackRate: this.playbackRate * this.globalPlaybackRate,
							getIsPlaying: () => this.playing,
							scheduleAudioNode: (node, mediaTimestamp, maxDuration) => {
								if (!this.sharedAudioContext) {
									throw new Error('Shared audio context not found');
								}

								const currentTime = this.getAudioPlaybackTime();
								return this.sharedAudioContext.scheduleAudioNode({
									node,
									mediaTimestamp,
									currentMediaTime: currentTime,
									combinedPlaybackRate:
										this.playbackRate * this.globalPlaybackRate,
									maxDuration,
								});
							},
						})
					: null,
			]);
		} catch (error) {
			if (this.isDisposalError()) {
				return;
			}

			throw error;
		}
	}

	public async playAudio(time: number): Promise<void> {
		const newTime = this.getTrimmedTime(time);
		if (newTime === null) {
			throw new Error(`should have asserted that the time is not null`);
		}

		if (this.audioIteratorManager) {
			this.audioIteratorManager.resumeScheduledAudioChunks({
				playbackRate: this.playbackRate * this.globalPlaybackRate,
				scheduleAudioNode: (node, mediaTimestamp, maxDuration) => {
					if (!this.sharedAudioContext) {
						throw new Error('Shared audio context not found');
					}

					const currentTime = this.getAudioPlaybackTime();
					return this.sharedAudioContext.scheduleAudioNode({
						node,
						mediaTimestamp,
						currentMediaTime: currentTime,
						combinedPlaybackRate:
							this.playbackRate * this.globalPlaybackRate,
						maxDuration,
					});
				},
			});
		}

		if (
			this.sharedAudioContext &&
			this.sharedAudioContext.audioContext.state === 'suspended'
		) {
			await this.sharedAudioContext.audioContext.resume();
		}
	}

	public async play(time: number): Promise<void> {
		if (this.playing) {
			return;
		}

		this.playing = true;

		await this.playAudio(time);
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
		this.audioIteratorManager?.pausePlayback();

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

	private async updateAfterTrimChange(
		unloopedTimeInSeconds: number,
	): Promise<void> {
		if (!this.audioIteratorManager && !this.videoIteratorManager) {
			return;
		}

		const newMediaTime = this.getTrimmedTime(unloopedTimeInSeconds);

		// audio iterator will be re-created on next play/seek
		// video iterator doesn't need to be re-created
		this.audioIteratorManager?.destroyIterator();

		if (newMediaTime !== null) {
			if (!this.playing && this.videoIteratorManager) {
				await this.seekToWithQueue(newMediaTime);
			}
		}
	}

	public async setTrimBefore(
		trimBefore: number | undefined,
		unloopedTimeInSeconds: number,
	): Promise<void> {
		if (this.trimBefore !== trimBefore) {
			this.trimBefore = trimBefore;
			await this.updateAfterTrimChange(unloopedTimeInSeconds);
		}
	}

	public async setTrimAfter(
		trimAfter: number | undefined,
		unloopedTimeInSeconds: number,
	): Promise<void> {
		if (this.trimAfter !== trimAfter) {
			this.trimAfter = trimAfter;
			await this.updateAfterTrimChange(unloopedTimeInSeconds);
		}
	}

	public setDebugOverlay(debugOverlay: boolean): void {
		this.debugOverlay = debugOverlay;
	}

	private rescheduleAudioChunks(): void {
		if (!this.audioIteratorManager) {
			return;
		}

		if (!this.sharedAudioContext) {
			return;
		}

		const iterator = this.audioIteratorManager.getAudioBufferIterator();
		if (!iterator) {
			return;
		}

		iterator.moveQueuedChunksToPauseQueue();
		if (this.playing) {
			this.audioIteratorManager.resumeScheduledAudioChunks({
				playbackRate: this.playbackRate * this.globalPlaybackRate,
				scheduleAudioNode: (node, mediaTimestamp, maxDuration) => {
					if (!this.sharedAudioContext) {
						throw new Error('Shared audio context not found');
					}

					const currentTime = this.getAudioPlaybackTime();
					return this.sharedAudioContext.scheduleAudioNode({
						node,
						mediaTimestamp,
						currentMediaTime: currentTime,
						combinedPlaybackRate:
							this.playbackRate * this.globalPlaybackRate,
						maxDuration,
					});
				},
			});
		}
	}

	public async setPlaybackRate(
		rate: number,
		unloopedTimeInSeconds: number,
	): Promise<void> {
		const previousRate = this.playbackRate;
		this.playbackRate = rate;
		this.rescheduleAudioChunks();

		if (previousRate !== rate) {
			await this.seekTo(unloopedTimeInSeconds);
		}
	}

	public setGlobalPlaybackRate(rate: number): void {
		this.globalPlaybackRate = rate;
		this.rescheduleAudioChunks();
	}

	public setFps(fps: number): void {
		this.fps = fps;
	}

	public setIsPremounting(isPremounting: boolean): void {
		this.isPremounting = isPremounting;
	}

	public setIsPostmounting(isPostmounting: boolean): void {
		this.isPostmounting = isPostmounting;
	}

	public setLoop(loop: boolean): void {
		this.loop = loop;
	}

	public setSequenceOffset(offset: number): void {
		this.sequenceOffset = offset;
	}

	public setDurationInFrames(durationInFrames: number): void {
		this.durationInFrames = durationInFrames;
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

	private getAudioPlaybackTime(): number {
		if (!this.sharedAudioContext) {
			throw new Error('Shared audio context not found');
		}

		const globalTime =
			(this.sharedAudioContext.audioContext.currentTime -
				this.sharedAudioContext.audioSyncAnchor.value) *
			this.globalPlaybackRate;
		const localTime = globalTime - this.sequenceOffset;

		// Pass through getTrimmedTime to apply loop wrapping and trim
		const trimmedTime = this.getTrimmedTime(localTime);
		if (trimmedTime !== null) {
			return trimmedTime;
		}

		// Fallback for when time is outside valid range
		return localTime * this.playbackRate + (this.trimBefore ?? 0) / this.fps;
	}

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
}
