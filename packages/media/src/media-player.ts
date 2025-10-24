import type {WrappedAudioBuffer, WrappedCanvas} from 'mediabunny';
import {ALL_FORMATS, CanvasSink, Input, UrlSource} from 'mediabunny';
import type {LogLevel, useBufferState} from 'remotion';
import {Internals} from 'remotion';
import {
	audioIteratorManager,
	type AudioIteratorManager,
} from './audio-iterator-manager';
import {isAlreadyQueued} from './audio/audio-preview-iterator';
import type {DebugStats} from './debug-overlay/preview-overlay';
import {drawPreviewOverlay} from './debug-overlay/preview-overlay';
import {getTimeInSeconds} from './get-time-in-seconds';
import {isNetworkError} from './is-network-error';
import {
	createVideoIterator,
	type VideoIterator,
} from './video/video-preview-iterator';

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

	private canvasSink: CanvasSink | null = null;
	private videoFrameIterator: VideoIterator | null = null;
	debugStats: DebugStats = {
		videoIteratorsCreated: 0,
		framesRendered: 0,
	};

	private gainNode: GainNode | null = null;
	private currentVolume: number = 1;

	private sharedAudioContext: AudioContext;

	private audioIteratorManager: AudioIteratorManager | null = null;

	// this is the time difference between Web Audio timeline
	// and media file timeline
	private audioSyncAnchor: number = 0;

	private playing = false;
	private muted = false;
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

				this.canvasSink = new CanvasSink(videoTrack, {
					poolSize: 2,
					fit: 'contain',
					alpha: true,
				});

				this.canvas.width = videoTrack.displayWidth;
				this.canvas.height = videoTrack.displayHeight;
			}

			if (audioTrack && this.sharedAudioContext) {
				this.audioIteratorManager = audioIteratorManager(
					audioTrack,
					this.bufferState,
				);
				this.gainNode = this.sharedAudioContext.createGain();
				this.gainNode.connect(this.sharedAudioContext.destination);
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

				await this.startVideoIterator(startTime, this.currentSeekNonce);
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
			this.videoFrameIterator?.destroy();
			this.videoFrameIterator = null;

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
		const videoSatisfyResult =
			await this.videoFrameIterator?.tryToSatisfySeek(newTime);

		if (videoSatisfyResult?.type === 'satisfied') {
			this.drawFrame(videoSatisfyResult.frame);
		} else if (videoSatisfyResult && this.currentSeekNonce === nonce) {
			this.startVideoIterator(newTime, nonce);
		}

		const queuedPeriod = this.audioIteratorManager
			?.getAudioBufferIterator()
			?.getQueuedPeriod();

		const currentTimeIsAlreadyQueued = isAlreadyQueued(newTime, queuedPeriod);
		const toBeScheduled: WrappedAudioBuffer[] = [];

		if (!currentTimeIsAlreadyQueued) {
			const audioSatisfyResult = await this.audioIteratorManager
				?.getAudioBufferIterator()
				?.tryToSatisfySeek(newTime);

			if (this.currentSeekNonce !== nonce) {
				return;
			}

			if (!audioSatisfyResult) {
				return;
			}

			if (audioSatisfyResult.type === 'not-satisfied') {
				if (this.audioIteratorManager) {
					await this.audioIteratorManager.startAudioIterator(
						newTime,
						nonce,
						() => this.currentSeekNonce,
					);
				}

				return;
			}

			toBeScheduled.push(...audioSatisfyResult.buffers);
		}

		// TODO: What is this is beyond the end of the video
		const nextTime =
			newTime +
			// start of next frame
			(1 / this.fps) * this.playbackRate +
			// need the full duration of the next frame to be queued
			(1 / this.fps) * this.playbackRate;
		const nextIsAlreadyQueued = isAlreadyQueued(nextTime, queuedPeriod);
		if (!nextIsAlreadyQueued) {
			const audioSatisfyResult = await this.audioIteratorManager
				?.getAudioBufferIterator()
				?.tryToSatisfySeek(nextTime);

			if (this.currentSeekNonce !== nonce) {
				return;
			}

			if (!audioSatisfyResult) {
				return;
			}

			if (audioSatisfyResult.type === 'not-satisfied') {
				if (this.audioIteratorManager) {
					await this.audioIteratorManager.startAudioIterator(
						nextTime,
						nonce,
						() => this.currentSeekNonce,
					);
				}

				return;
			}

			toBeScheduled.push(...audioSatisfyResult.buffers);
		}

		for (const buffer of toBeScheduled) {
			if (this.playing) {
				this.scheduleAudioChunk(buffer.buffer, buffer.timestamp);
			} else if (this.audioIteratorManager) {
				this.audioIteratorManager.getAudioChunksForAfterResuming().push({
					buffer: buffer.buffer,
					timestamp: buffer.timestamp,
				});
			}
		}
	}

	public async play(time: number): Promise<void> {
		if (!this.isReady()) return;

		this.setPlaybackTime(time);

		this.playing = true;
		if (this.audioIteratorManager) {
			for (const chunk of this.audioIteratorManager.getAudioChunksForAfterResuming()) {
				this.scheduleAudioChunk(chunk.buffer, chunk.timestamp);
			}
		}

		if (this.sharedAudioContext.state === 'suspended') {
			await this.sharedAudioContext.resume();
		}

		if (this.audioIteratorManager) {
			this.audioIteratorManager.getAudioChunksForAfterResuming().length = 0;
		}

		this.drawDebugOverlay();
	}

	public pause(): void {
		this.playing = false;
		const toQueue = this.audioIteratorManager
			?.getAudioBufferIterator()
			?.removeAndReturnAllQueuedAudioNodes();

		if (toQueue && this.audioIteratorManager) {
			for (const chunk of toQueue) {
				this.audioIteratorManager.getAudioChunksForAfterResuming().push({
					buffer: chunk.buffer,
					timestamp: chunk.timestamp,
				});
			}
		}

		this.drawDebugOverlay();
	}

	public setMuted(muted: boolean): void {
		this.muted = muted;
		if (this.gainNode) {
			this.gainNode.gain.value = muted ? 0 : this.currentVolume;
		}
	}

	public setVolume(volume: number): void {
		if (!this.gainNode) {
			return;
		}

		const appliedVolume = Math.max(0, volume);
		this.currentVolume = appliedVolume;
		if (!this.muted) {
			this.gainNode.gain.value = appliedVolume;
		}
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
		this.videoFrameIterator?.destroy();
		this.videoFrameIterator = null;
		this.audioIteratorManager?.getAudioBufferIterator()?.destroy();
	}

	private getPlaybackTime(): number {
		return this.sharedAudioContext.currentTime - this.audioSyncAnchor;
	}

	private setPlaybackTime(time: number): void {
		this.audioSyncAnchor = this.sharedAudioContext.currentTime - time;
	}

	private scheduleAudioChunk(
		buffer: AudioBuffer,
		mediaTimestamp: number,
	): void {
		// TODO: Might already be scheduled, and then the playback rate changes
		// TODO: Playbackrate does not yet work
		const targetTime =
			(mediaTimestamp - (this.trimBefore ?? 0) / this.fps) / this.playbackRate;
		const delay =
			targetTime + this.audioSyncAnchor - this.sharedAudioContext.currentTime;

		const node = this.sharedAudioContext.createBufferSource();
		node.buffer = buffer;
		node.playbackRate.value = this.playbackRate;
		node.connect(this.gainNode!);

		if (delay >= 0) {
			node.start(targetTime + this.audioSyncAnchor);
		} else {
			node.start(this.sharedAudioContext.currentTime, -delay);
		}

		this.audioIteratorManager
			?.getAudioBufferIterator()!
			.addQueuedAudioNode(node, mediaTimestamp, buffer);
		node.onended = () => {
			return this.audioIteratorManager
				?.getAudioBufferIterator()!
				.removeQueuedAudioNode(node);
		};
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

	private drawFrame = (frame: WrappedCanvas): void => {
		if (!this.context) {
			throw new Error('Context not initialized');
		}

		this.context.clearRect(0, 0, this.canvas!.width, this.canvas!.height);
		this.context.drawImage(frame.canvas, 0, 0);
		this.debugStats.framesRendered++;

		this.drawDebugOverlay();
		if (this.onVideoFrameCallback && this.canvas) {
			this.onVideoFrameCallback(this.canvas);
		}

		Internals.Log.trace(
			{logLevel: this.logLevel, tag: '@remotion/media'},
			`[MediaPlayer] Drew frame ${frame.timestamp.toFixed(3)}s`,
		);
	};

	private drawDebugOverlay(): void {
		if (!this.debugOverlay) return;
		if (this.context && this.canvas) {
			drawPreviewOverlay({
				context: this.context,
				stats: this.debugStats,
				audioTime: this.sharedAudioContext.currentTime,
				audioContextState: this.sharedAudioContext.state,
				audioSyncAnchor: this.audioSyncAnchor,
				audioIteratorManager: this.audioIteratorManager,
				playing: this.playing,
			});
		}
	}

	private startVideoIterator = async (
		timeToSeek: number,
		nonce: number,
	): Promise<void> => {
		if (!this.canvasSink) {
			return;
		}

		this.videoFrameIterator?.destroy();
		const iterator = createVideoIterator(timeToSeek, this.canvasSink);
		this.debugStats.videoIteratorsCreated++;
		this.videoFrameIterator = iterator;

		const delayHandle = this.bufferState.delayPlayback();
		const frameResult = await iterator.getNext();
		delayHandle.unblock();

		if (iterator.isDestroyed()) {
			return;
		}

		if (nonce !== this.currentSeekNonce) {
			return;
		}

		if (this.videoFrameIterator.isDestroyed()) {
			return;
		}

		if (!frameResult.value) {
			// media ended
			return;
		}

		this.drawFrame(frameResult.value);
	};
}
