import {ALL_FORMATS, Input, UrlSource} from 'mediabunny';
import type {LogLevel, useBufferState} from 'remotion';
import {Internals} from 'remotion';
import {
	audioIteratorManager,
	type AudioIteratorManager,
} from './audio-iterator-manager';
import {drawPreviewOverlay} from './debug-overlay/preview-overlay';
import {getTimeInSeconds} from './get-time-in-seconds';
import {isNetworkError} from './is-network-error';
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
	private audioStreamIndex: number;

	private sharedAudioContext: AudioContext;

	audioIteratorManager: AudioIteratorManager | null = null;
	videoIteratorManager: VideoIteratorManager | null = null;

	// this is the time difference between Web Audio timeline
	// and media file timeline
	private audioSyncAnchor: number = 0;

	private playing = false;
	private loop = false;
	private fps: number;

	private trimBefore: number | undefined;
	private trimAfter: number | undefined;

	private initialized = false;
	private totalDuration: number | undefined;

	private debugOverlay = false;

	private onVideoFrameCallback?: (frame: CanvasImageSource) => void;

	private initializationPromise: Promise<MediaPlayerInitResult> | null = null;

	private bufferState: ReturnType<typeof useBufferState>;

	constructor({
		canvas,
		src,
		logLevel,
		sharedAudioContext,
		loop,
		trimBefore,
		trimAfter,
		playbackRate,
		audioStreamIndex,
		fps,
		debugOverlay,
		bufferState,
	}: {
		canvas: HTMLCanvasElement | OffscreenCanvas | null;
		src: string;
		logLevel: LogLevel;
		sharedAudioContext: AudioContext;
		loop: boolean;
		trimBefore: number | undefined;
		trimAfter: number | undefined;
		playbackRate: number;
		audioStreamIndex: number;
		fps: number;
		debugOverlay: boolean;
		bufferState: ReturnType<typeof useBufferState>;
	}) {
		this.canvas = canvas ?? null;
		this.src = src;
		this.logLevel = logLevel ?? window.remotion_logLevel;
		this.sharedAudioContext = sharedAudioContext;
		this.playbackRate = playbackRate;
		this.loop = loop;
		this.trimBefore = trimBefore;
		this.trimAfter = trimAfter;
		this.audioStreamIndex = audioStreamIndex ?? 0;
		this.fps = fps;
		this.debugOverlay = debugOverlay;
		this.bufferState = bufferState;

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

	private input: Input<UrlSource> | null = null;

	private isReady(): boolean {
		return (
			this.initialized &&
			Boolean(this.sharedAudioContext) &&
			!this.input?.disposed
		);
	}

	private isDisposalError(): boolean {
		return this.input?.disposed === true;
	}

	public initialize(
		startTimeUnresolved: number,
	): Promise<MediaPlayerInitResult> {
		const promise = this._initialize(startTimeUnresolved);
		this.initializationPromise = promise;
		return promise;
	}

	private async _initialize(
		startTimeUnresolved: number,
	): Promise<MediaPlayerInitResult> {
		try {
			const urlSource = new UrlSource(this.src);

			const input = new Input({
				source: urlSource,
				formats: ALL_FORMATS,
			});

			this.input = input;

			if (input.disposed) {
				return {type: 'disposed'};
			}

			try {
				await input.getFormat();
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
				input.computeDuration(),
				input.getPrimaryVideoTrack(),
				input.getAudioTracks(),
			]);
			this.totalDuration = durationInSeconds;

			const audioTrack = audioTracks[this.audioStreamIndex] ?? null;

			if (!videoTrack && !audioTrack) {
				return {type: 'no-tracks'};
			}

			if (videoTrack && this.canvas && this.context) {
				const canDecode = await videoTrack.canDecode();

				if (!canDecode) {
					return {type: 'cannot-decode'};
				}

				this.videoIteratorManager = videoIteratorManager({
					videoTrack,
					bufferState: this.bufferState,
					context: this.context,
					canvas: this.canvas,
					onVideoFrameCallback: this.onVideoFrameCallback ?? null,
					logLevel: this.logLevel,
					drawDebugOverlay: this.drawDebugOverlay,
				});

				this.canvas.width = videoTrack.displayWidth;
				this.canvas.height = videoTrack.displayHeight;
			}

			if (audioTrack && this.sharedAudioContext) {
				this.audioIteratorManager = audioIteratorManager({
					audioTrack,
					bufferState: this.bufferState,
					sharedAudioContext: this.sharedAudioContext,
				});
			}

			const startTime = getTimeInSeconds({
				unloopedTimeInSeconds: startTimeUnresolved,
				playbackRate: this.playbackRate,
				loop: this.loop,
				trimBefore: this.trimBefore,
				trimAfter: this.trimAfter,
				mediaDurationInSeconds: this.totalDuration,
				fps: this.fps,
				ifNoMediaDuration: 'infinity',
				src: this.src,
			});

			if (startTime === null) {
				this.clearCanvas();
				return {type: 'success', durationInSeconds: this.totalDuration};
			}

			if (this.sharedAudioContext) {
				this.setPlaybackTime(startTime);
			}

			this.initialized = true;

			try {
				// intentionally not awaited
				if (this.audioIteratorManager) {
					this.audioIteratorManager.startAudioIterator(
						startTime,
						this.currentSeekNonce,
						() => this.currentSeekNonce,
					);
				}

				await this.videoIteratorManager?.startVideoIterator(
					startTime,
					this.currentSeekNonce,
					() => this.currentSeekNonce,
				);
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

	private clearCanvas(): void {
		if (this.context && this.canvas) {
			this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
		}
	}

	private currentSeekNonce = 0;
	private seekPromiseChain: Promise<void> = Promise.resolve();

	public async seekTo(time: number): Promise<void> {
		this.currentSeekNonce++;
		const nonce = this.currentSeekNonce;
		await this.seekPromiseChain;

		this.seekPromiseChain = this.seekToDoNotCallDirectly(time, nonce);
		await this.seekPromiseChain;
	}

	public async seekToDoNotCallDirectly(
		time: number,
		nonce: number,
	): Promise<void> {
		if (nonce !== this.currentSeekNonce) {
			return;
		}

		if (!this.isReady()) return;

		const newTime = getTimeInSeconds({
			unloopedTimeInSeconds: time,
			playbackRate: this.playbackRate,
			loop: this.loop,
			trimBefore: this.trimBefore,
			trimAfter: this.trimAfter,
			mediaDurationInSeconds: this.totalDuration ?? null,
			fps: this.fps,
			ifNoMediaDuration: 'infinity',
			src: this.src,
		});

		if (newTime === null) {
			// invalidate in-flight video operations
			this.videoIteratorManager?.destroy();

			this.clearCanvas();
			this.audioIteratorManager?.getAudioBufferIterator()?.destroy();

			return;
		}

		const currentPlaybackTime = this.getPlaybackTime();
		if (currentPlaybackTime === newTime) {
			return;
		}

		const newAudioSyncAnchor = this.sharedAudioContext.currentTime - newTime;
		const diff = Math.abs(newAudioSyncAnchor - this.audioSyncAnchor);
		if (diff > 0.1) {
			this.setPlaybackTime(newTime);
		}

		// Should return immediately, so it's okay to not use Promise.all here
		const videoSatisfyResult = await this.videoIteratorManager
			?.getVideoFrameIterator()
			?.tryToSatisfySeek(newTime);

		if (videoSatisfyResult?.type === 'satisfied') {
			this.videoIteratorManager?.drawFrame(videoSatisfyResult.frame);
		} else if (videoSatisfyResult && this.currentSeekNonce === nonce) {
			this.videoIteratorManager?.startVideoIterator(
				newTime,
				nonce,
				() => this.currentSeekNonce,
			);
		}

		await this.audioIteratorManager?.seek({
			newTime,
			nonce,
			getSeekNonce: () => this.currentSeekNonce,
			fps: this.fps,
			playbackRate: this.playbackRate,
			audioSyncAnchor: this.audioSyncAnchor,
			trimBefore: this.trimBefore,
			getIsPlaying: () => this.playing,
		});
	}

	public async play(time: number): Promise<void> {
		if (!this.isReady()) return;

		this.setPlaybackTime(time);

		this.playing = true;
		if (this.audioIteratorManager) {
			this.audioIteratorManager.resumeScheduledAudioChunks({
				audioSyncAnchor: this.audioSyncAnchor,
				fps: this.fps,
				playbackRate: this.playbackRate,
				trimBefore: this.trimBefore,
			});
		}

		if (this.sharedAudioContext.state === 'suspended') {
			await this.sharedAudioContext.resume();
		}

		this.drawDebugOverlay();
	}

	public pause(): void {
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

	public setDebugOverlay(debugOverlay: boolean): void {
		this.debugOverlay = debugOverlay;
	}

	public setPlaybackRate(rate: number): void {
		this.playbackRate = rate;
	}

	public setFps(fps: number): void {
		this.fps = fps;
	}

	public setLoop(loop: boolean): void {
		this.loop = loop;
	}

	public async dispose(): Promise<void> {
		this.initialized = false;

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

		this.input?.dispose();
		this.videoIteratorManager?.destroy();
		this.audioIteratorManager?.destroy();
	}

	private getPlaybackTime(): number {
		return this.sharedAudioContext.currentTime - this.audioSyncAnchor;
	}

	private setPlaybackTime(time: number): void {
		this.audioSyncAnchor = this.sharedAudioContext.currentTime - time;
	}

	public onVideoFrame(
		callback: (frame: CanvasImageSource) => void,
	): () => void {
		this.onVideoFrameCallback = callback;

		if (this.initialized && callback && this.canvas) {
			callback(this.canvas);
		}

		return () => {
			if (this.onVideoFrameCallback === callback) {
				this.onVideoFrameCallback = undefined;
			}
		};
	}

	private drawDebugOverlay = () => {
		if (!this.debugOverlay) return;
		if (this.context && this.canvas) {
			drawPreviewOverlay({
				context: this.context,
				audioTime: this.sharedAudioContext.currentTime,
				audioContextState: this.sharedAudioContext.state,
				audioSyncAnchor: this.audioSyncAnchor,
				audioIteratorManager: this.audioIteratorManager,
				playing: this.playing,
				videoIteratorManager: this.videoIteratorManager,
			});
		}
	};
}
