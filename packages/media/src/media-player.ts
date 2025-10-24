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
import type {Nonce, NonceManager} from './nonce-manager';
import {makeNonceManager} from './nonce-manager';
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

	private totalDuration: number | undefined;

	private debugOverlay = false;

	private nonceManager: NonceManager;

	private onVideoFrameCallback: null | ((frame: CanvasImageSource) => void) =
		null;

	private initializationPromise: Promise<MediaPlayerInitResult> | null = null;

	private bufferState: ReturnType<typeof useBufferState>;

	private seekPromiseChain: Promise<void> = Promise.resolve();

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
		this.nonceManager = makeNonceManager();

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
	): Promise<MediaPlayerInitResult> {
		const promise = this._initialize(startTimeUnresolved);
		this.initializationPromise = promise;
		return promise;
	}

	private async _initialize(
		startTimeUnresolved: number,
	): Promise<MediaPlayerInitResult> {
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

			if (videoTrack && this.canvas && this.context) {
				const canDecode = await videoTrack.canDecode();

				if (!canDecode) {
					return {type: 'cannot-decode'};
				}

				if (this.input.disposed) {
					return {type: 'disposed'};
				}

				this.videoIteratorManager = videoIteratorManager({
					videoTrack,
					bufferState: this.bufferState,
					context: this.context,
					canvas: this.canvas,
					getOnVideoFrameCallback: () => this.onVideoFrameCallback,
					logLevel: this.logLevel,
					drawDebugOverlay: this.drawDebugOverlay,
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
				throw new Error(`should have asserted that the time is not null`);
			}

			this.setPlaybackTime(startTime);

			if (audioTrack) {
				this.audioIteratorManager = audioIteratorManager({
					audioTrack,
					bufferState: this.bufferState,
					sharedAudioContext: this.sharedAudioContext,
				});
			}

			const nonce = this.nonceManager.createAsyncOperation();

			try {
				// intentionally not awaited
				if (this.audioIteratorManager) {
					this.audioIteratorManager.startAudioIterator({
						nonce,
						playbackRate: this.playbackRate,
						startFromSecond: startTime,
						getIsPlaying: () => this.playing,
						scheduleAudioNode: this.scheduleAudioNode,
					});
				}

				await this.videoIteratorManager?.startVideoIterator(startTime, nonce);
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

	public async seekTo(time: number): Promise<void> {
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
			throw new Error(`should have asserted that the time is not null`);
		}

		const nonce = this.nonceManager.createAsyncOperation();
		await this.seekPromiseChain;

		this.seekPromiseChain = this.seekToDoNotCallDirectly(time, nonce);
		await this.seekPromiseChain;
	}

	public async seekToDoNotCallDirectly(
		newTime: number,
		nonce: Nonce,
	): Promise<void> {
		if (nonce.isStale()) {
			return;
		}

		const currentPlaybackTime = this.getPlaybackTime();
		if (currentPlaybackTime === newTime) {
			return;
		}

		const newAudioSyncAnchor = this.sharedAudioContext.currentTime - newTime;
		const diff = Math.abs(newAudioSyncAnchor - this.audioSyncAnchor);
		if (diff > 0.04) {
			this.setPlaybackTime(newTime);
		}

		await this.videoIteratorManager?.seek({
			newTime,
			nonce,
		});

		await this.audioIteratorManager?.seek({
			newTime,
			nonce,
			fps: this.fps,
			playbackRate: this.playbackRate,
			getIsPlaying: () => this.playing,
			scheduleAudioNode: this.scheduleAudioNode,
		});
	}

	public async play(time: number): Promise<void> {
		this.setPlaybackTime(time);
		this.playing = true;

		if (this.audioIteratorManager) {
			this.audioIteratorManager.resumeScheduledAudioChunks({
				playbackRate: this.playbackRate,
				scheduleAudioNode: this.scheduleAudioNode,
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
		if (!this.audioIteratorManager) {
			return;
		}

		const iterator = this.audioIteratorManager.getAudioBufferIterator();
		if (!iterator) {
			return;
		}

		iterator.moveQueuedChunksToPauseQueue();
		this.audioIteratorManager.resumeScheduledAudioChunks({
			playbackRate: rate,
			scheduleAudioNode: this.scheduleAudioNode,
		});
	}

	public setFps(fps: number): void {
		this.fps = fps;
	}

	public setLoop(loop: boolean): void {
		this.loop = loop;
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
		this.audioIteratorManager?.destroy();
		this.input.dispose();
	}

	private scheduleAudioNode = (
		node: AudioBufferSourceNode,
		mediaTimestamp: number,
	) => {
		// TODO: Playbackrate does not yet work
		const targetTime =
			(mediaTimestamp - (this.trimBefore ?? 0) / this.fps) / this.playbackRate;
		const delay =
			targetTime + this.audioSyncAnchor - this.sharedAudioContext.currentTime;

		if (delay >= 0) {
			node.start(targetTime + this.audioSyncAnchor);
		} else {
			node.start(this.sharedAudioContext.currentTime, -delay);
		}
	};

	private getPlaybackTime(): number {
		return this.sharedAudioContext.currentTime - this.audioSyncAnchor;
	}

	private setPlaybackTime(time: number): void {
		this.audioSyncAnchor = this.sharedAudioContext.currentTime - time;
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
