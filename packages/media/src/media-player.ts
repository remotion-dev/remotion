import type {WrappedAudioBuffer} from 'mediabunny';
import {
	ALL_FORMATS,
	AudioBufferSink,
	CanvasSink,
	Input,
	UrlSource,
} from 'mediabunny';
import type {LogLevel} from 'remotion';
import {Internals} from 'remotion';
import {
	HEALTHY_BUFFER_THRESHOLD_SECONDS,
	makeAudioIterator,
	type AudioIterator,
} from './audio/audio-preview-iterator';
import {drawPreviewOverlay} from './debug-overlay/preview-overlay';
import {getTimeInSeconds} from './get-time-in-seconds';
import {isNetworkError} from './is-network-error';
import {sleep, TimeoutError, withTimeout} from './video/timeout-utils';
import {
	createVideoIterator,
	type VideoIterator,
} from './video/video-preview-iterator';

export const SEEK_THRESHOLD = 0.05;
const AUDIO_BUFFER_TOLERANCE_THRESHOLD = 0.1;

export type MediaPlayerInitResult =
	| {type: 'success'; durationInSeconds: number}
	| {type: 'unknown-container-format'}
	| {type: 'cannot-decode'}
	| {type: 'network-error'}
	| {type: 'no-tracks'}
	| {type: 'disposed'};

export class MediaPlayer {
	private canvas: HTMLCanvasElement | null;
	private context: CanvasRenderingContext2D | null;
	private src: string;
	private logLevel: LogLevel;
	private playbackRate: number;
	private audioStreamIndex: number;

	private canvasSink: CanvasSink | null = null;
	private videoFrameIterator: VideoIterator | null = null;

	private audioSink: AudioBufferSink | null = null;
	private audioBufferIterator: AudioIterator | null = null;

	private gainNode: GainNode | null = null;
	private currentVolume: number = 1;

	private sharedAudioContext: AudioContext;

	// this is the time difference between Web Audio timeline
	// and media file timeline
	private audioSyncAnchor: number = 0;

	private playing = false;
	private muted = false;
	private loop = false;
	private fps: number;

	private trimBefore: number | undefined;
	private trimAfter: number | undefined;

	private animationFrameId: number | null = null;

	private initialized = false;
	private totalDuration: number | undefined;

	// for remotion buffer state
	private isBuffering = false;
	private onBufferingChangeCallback?: (isBuffering: boolean) => void;

	private mediaEnded = false;

	private debugOverlay = false;

	private onVideoFrameCallback?: (frame: CanvasImageSource) => void;

	private initializationPromise: Promise<MediaPlayerInitResult> | null = null;

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
	}: {
		canvas: HTMLCanvasElement | null;
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

		if (canvas) {
			const context = canvas.getContext('2d', {
				alpha: true,
				desynchronized: true,
			});

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

	private hasAudio(): boolean {
		return Boolean(this.audioSink && this.sharedAudioContext && this.gainNode);
	}

	private isCurrentlyBuffering(): boolean {
		return this.isBuffering && Boolean(this.bufferingStartedAtMs);
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
				this.audioSink = new AudioBufferSink(audioTrack);
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
				this.audioSyncAnchor = this.sharedAudioContext.currentTime - startTime;
			}

			this.initialized = true;

			try {
				await Promise.all([
					this.startAudioIterator(startTime),
					this.startVideoIterator(startTime),
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

			this.startRenderLoop();

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

	public async seekTo(time: number): Promise<void> {
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
			this.audioBufferIterator?.destroy();
			this.audioBufferIterator = null;

			return;
		}

		const currentPlaybackTime = this.getPlaybackTime();

		const isSignificantSeek =
			currentPlaybackTime === null ||
			Math.abs(newTime - currentPlaybackTime) > SEEK_THRESHOLD;

		if (isSignificantSeek) {
			this.audioSyncAnchor = this.sharedAudioContext.currentTime - newTime;
			this.mediaEnded = false;

			await Promise.all([
				this.startAudioIterator(newTime),
				this.startVideoIterator(newTime),
			]);
		}

		if (!this.playing) {
			this.render();
		}
	}

	public async play(): Promise<void> {
		if (!this.isReady()) return;

		if (!this.playing) {
			if (this.sharedAudioContext.state === 'suspended') {
				await this.sharedAudioContext.resume();
			}

			this.playing = true;

			this.startRenderLoop();
		}
	}

	public pause(): void {
		this.playing = false;
		this.audioBufferIterator?.cleanupAudioQueue();
		this.stopRenderLoop();
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
		this.stopRenderLoop();
		this.videoFrameIterator?.destroy();
		this.audioBufferIterator?.destroy();
		this.audioBufferIterator = null;
	}

	private getPlaybackTime(): number {
		return this.sharedAudioContext.currentTime - this.audioSyncAnchor;
	}

	private scheduleAudioChunk(
		buffer: AudioBuffer,
		mediaTimestamp: number,
	): void {
		const targetTime = mediaTimestamp + this.audioSyncAnchor;
		const delay = targetTime - this.sharedAudioContext.currentTime;

		const node = this.sharedAudioContext.createBufferSource();
		node.buffer = buffer;
		node.playbackRate.value = this.playbackRate;
		node.connect(this.gainNode!);

		if (delay >= 0) {
			node.start(targetTime);
		} else {
			node.start(this.sharedAudioContext.currentTime, -delay);
		}

		this.audioBufferIterator?.addQueuedAudioNode(node);
		node.onended = () => this.audioBufferIterator?.removeQueuedAudioNode(node);
	}

	public onBufferingChange(
		callback: (isBuffering: boolean) => void,
	): () => void {
		this.onBufferingChangeCallback = callback;

		return () => {
			if (this.onBufferingChangeCallback === callback) {
				this.onBufferingChangeCallback = undefined;
			}
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

	private canRenderVideo(): boolean {
		return (
			!this.hasAudio() || this.audioBufferIterator?.isReadyToPlay() || false
		);
	}

	private startRenderLoop(): void {
		if (this.animationFrameId !== null) {
			return;
		}

		this.render();
	}

	private stopRenderLoop(): void {
		if (this.animationFrameId !== null) {
			cancelAnimationFrame(this.animationFrameId);
			this.animationFrameId = null;
		}
	}

	private render = (): void => {
		if (this.isBuffering) {
			this.maybeForceResumeFromBuffering();
		}

		if (this.shouldRenderFrame()) {
			this.drawCurrentFrame();
		}

		if (this.playing) {
			this.animationFrameId = requestAnimationFrame(this.render);
		} else {
			this.animationFrameId = null;
		}
	};

	private shouldRenderFrame(): boolean {
		const playbackTime = this.getPlaybackTime();
		if (playbackTime === null) {
			return false;
		}

		return (
			!this.isBuffering &&
			this.canRenderVideo() &&
			(this.videoFrameIterator?.getNextFrame() ?? false) &&
			this.videoFrameIterator!.getNextFrame()!.timestamp <= playbackTime
		);
	}

	private drawCurrentFrame(): void {
		if (this.context && this.videoFrameIterator?.getNextFrame()) {
			this.context.clearRect(0, 0, this.canvas!.width, this.canvas!.height);
			this.context.drawImage(
				this.videoFrameIterator.getNextFrame()!.canvas,
				0,
				0,
			);
			this.drawDebugOverlay();
		}

		if (this.onVideoFrameCallback && this.canvas) {
			this.onVideoFrameCallback(this.canvas);
		}

		this.videoFrameIterator?.clearNextFrame();
		this.updateNextFrame();
	}

	private startAudioIterator = (startFromSecond: number): void => {
		if (!this.hasAudio()) return;

		// Clean up existing audio iterator
		this.audioBufferIterator?.destroy();

		try {
			const iterator = makeAudioIterator(this.audioSink!, startFromSecond);
			this.audioBufferIterator = iterator;
			this.runAudioIterator(startFromSecond, iterator);
		} catch (error) {
			if (this.isDisposalError()) {
				return;
			}

			Internals.Log.error(
				{logLevel: this.logLevel, tag: '@remotion/media'},
				'[MediaPlayer] Failed to start audio iterator',
				error,
			);
		}
	};

	private drawDebugOverlay(): void {
		if (!this.debugOverlay) return;
		if (this.context && this.canvas) {
			drawPreviewOverlay(
				this.context,
				this.videoFrameIterator?.getNextFrame() ?? null,
			);
		}
	}

	private startVideoIterator = async (timeToSeek: number): Promise<void> => {
		if (!this.canvasSink) {
			return;
		}

		this.videoFrameIterator?.destroy();
		const iterator = createVideoIterator(timeToSeek, this.canvasSink);
		this.videoFrameIterator = iterator;

		try {
			const firstFrame = (await iterator.getNext()).value ?? null;

			if (iterator.isDestroyed()) {
				return;
			}

			if (firstFrame && this.context) {
				Internals.Log.trace(
					{logLevel: this.logLevel, tag: '@remotion/media'},
					`[MediaPlayer] Drew initial frame ${firstFrame.timestamp.toFixed(3)}s`,
				);
				this.context.drawImage(firstFrame.canvas, 0, 0);
				this.drawDebugOverlay();
			}

			const secondFrame = (await iterator.getNext()).value ?? null;
			if (iterator.isDestroyed()) {
				return;
			}

			if (secondFrame) {
				this.videoFrameIterator?.setNextFrame(secondFrame);
			} else {
				this.videoFrameIterator?.clearNextFrame();
			}

			this.drawDebugOverlay();

			if (secondFrame) {
				Internals.Log.trace(
					{logLevel: this.logLevel, tag: '@remotion/media'},
					`[MediaPlayer] Buffered next frame ${secondFrame.timestamp.toFixed(3)}s`,
				);
			}
		} catch (error) {
			if (this.isDisposalError()) {
				return;
			}

			Internals.Log.error(
				{logLevel: this.logLevel, tag: '@remotion/media'},
				'[MediaPlayer] Failed to start video iterator',
				error,
			);
		}
	};

	private updateNextFrame = async (): Promise<void> => {
		if (!this.videoFrameIterator) {
			return;
		}

		try {
			while (true) {
				const newNextFrame =
					(await this.videoFrameIterator.getNext()).value ?? null;

				if (!newNextFrame) {
					this.mediaEnded = true;
					break;
				}

				const playbackTime = this.getPlaybackTime();
				if (playbackTime === null) {
					continue;
				}

				if (newNextFrame.timestamp <= playbackTime) {
					continue;
				} else {
					this.videoFrameIterator?.setNextFrame(newNextFrame);
					Internals.Log.trace(
						{logLevel: this.logLevel, tag: '@remotion/media'},
						`[MediaPlayer] Buffered next frame ${newNextFrame.timestamp.toFixed(3)}s`,
					);

					break;
				}
			}
		} catch (error) {
			if (this.isDisposalError()) {
				return;
			}

			Internals.Log.error(
				{logLevel: this.logLevel, tag: '@remotion/media'},
				'[MediaPlayer] Failed to update next frame',
				error,
			);
		}
	};

	private bufferingStartedAtMs: number | null = null;
	private minBufferingTimeoutMs: number = 500;

	private setBufferingState(isBuffering: boolean): void {
		if (this.isBuffering !== isBuffering) {
			this.isBuffering = isBuffering;

			if (isBuffering) {
				this.bufferingStartedAtMs = performance.now();
				this.onBufferingChangeCallback?.(true);
			} else {
				this.bufferingStartedAtMs = null;
				this.onBufferingChangeCallback?.(false);
			}
		}
	}

	private maybeResumeFromBuffering(currentBufferDuration: number): void {
		if (!this.isCurrentlyBuffering()) return;

		const now = performance.now();
		const bufferingDuration = now - this.bufferingStartedAtMs!;

		const minTimeElapsed = bufferingDuration >= this.minBufferingTimeoutMs;
		const bufferHealthy =
			currentBufferDuration >= HEALTHY_BUFFER_THRESHOLD_SECONDS;

		if (minTimeElapsed && bufferHealthy) {
			Internals.Log.trace(
				{logLevel: this.logLevel, tag: '@remotion/media'},
				`[MediaPlayer] Resuming from buffering after ${bufferingDuration}ms - buffer recovered`,
			);
			this.setBufferingState(false);
		}
	}

	private maybeForceResumeFromBuffering(): void {
		if (!this.isCurrentlyBuffering()) return;

		const now = performance.now();
		const bufferingDuration = now - this.bufferingStartedAtMs!;
		const forceTimeout = bufferingDuration > this.minBufferingTimeoutMs * 10;

		if (forceTimeout) {
			Internals.Log.trace(
				{logLevel: this.logLevel, tag: '@remotion/media'},
				`[MediaPlayer] Force resuming from buffering after ${bufferingDuration}ms`,
			);
			this.setBufferingState(false);
		}
	}

	private runAudioIterator = async (
		startFromSecond: number,
		audioIterator: AudioIterator,
	): Promise<void> => {
		if (!this.hasAudio()) return;

		try {
			let totalBufferDuration = 0;
			let isFirstBuffer = true;
			audioIterator.setAudioIteratorStarted(true);

			while (true) {
				if (audioIterator.isDestroyed()) {
					return;
				}

				const BUFFERING_TIMEOUT_MS = 50;

				let result: IteratorResult<WrappedAudioBuffer, void>;
				try {
					result = await withTimeout(
						audioIterator.getNext(),
						BUFFERING_TIMEOUT_MS,
						'Iterator timeout',
					);
				} catch (error) {
					if (error instanceof TimeoutError && !this.mediaEnded) {
						this.setBufferingState(true);
					}

					await sleep(10);
					continue;
				}

				// media has ended
				if (result.done || !result.value) {
					this.mediaEnded = true;
					break;
				}

				const {buffer, timestamp, duration} = result.value;

				totalBufferDuration += duration;

				audioIterator.setAudioBufferHealth(
					Math.max(0, totalBufferDuration / this.playbackRate),
				);

				this.maybeResumeFromBuffering(totalBufferDuration / this.playbackRate);

				if (this.playing) {
					if (isFirstBuffer) {
						this.audioSyncAnchor =
							this.sharedAudioContext.currentTime - timestamp;
						isFirstBuffer = false;
					}

					// if timestamp is less than timeToSeek, skip
					// context: for some reason, mediabunny returns buffer at 9.984s, when requested at 10s
					if (timestamp < startFromSecond - AUDIO_BUFFER_TOLERANCE_THRESHOLD) {
						continue;
					}

					this.scheduleAudioChunk(buffer, timestamp);
				}

				const playbackTime = this.getPlaybackTime();
				if (playbackTime === null) {
					continue;
				}

				if (timestamp - playbackTime >= 1) {
					await new Promise<void>((resolve) => {
						const check = () => {
							const currentPlaybackTime = this.getPlaybackTime();
							if (
								currentPlaybackTime !== null &&
								timestamp - currentPlaybackTime < 1
							) {
								resolve();
							} else {
								requestAnimationFrame(check);
							}
						};

						check();
					});
				}
			}
		} catch (error) {
			if (this.isDisposalError()) {
				return;
			}

			Internals.Log.error(
				{logLevel: this.logLevel, tag: '@remotion/media'},
				'[MediaPlayer] Failed to run audio iterator',
				error,
			);
		}
	};
}
