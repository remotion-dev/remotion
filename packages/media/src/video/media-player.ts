import type {WrappedAudioBuffer, WrappedCanvas} from 'mediabunny';
import {
	ALL_FORMATS,
	AudioBufferSink,
	CanvasSink,
	Input,
	UrlSource,
} from 'mediabunny';
import type {LogLevel} from 'remotion';
import {Internals} from 'remotion';
import {resolvePlaybackTime} from './resolve-playback-time';
import {sleep, withTimeout} from './timeout-utils';

export const SEEK_THRESHOLD = 0.05;
const AUDIO_BUFFER_TOLERANCE_THRESHOLD = 0.1;

export class MediaPlayer {
	private canvas: HTMLCanvasElement | null;
	private context: CanvasRenderingContext2D | null;
	private src: string;
	private logLevel: LogLevel;
	private playbackRate: number;

	private canvasSink: CanvasSink | null = null;
	private videoFrameIterator: AsyncGenerator<
		WrappedCanvas,
		void,
		unknown
	> | null = null;

	private nextFrame: WrappedCanvas | null = null;

	private audioSink: AudioBufferSink | null = null;
	private audioBufferIterator: AsyncGenerator<
		WrappedAudioBuffer,
		void,
		unknown
	> | null = null;

	private queuedAudioNodes: Set<AudioBufferSourceNode> = new Set();

	private gainNode: GainNode | null = null;

	private sharedAudioContext: AudioContext;

	// audioDelay = mediaTimestamp + audioSyncAnchor - sharedAudioContext.currentTime
	private audioSyncAnchor: number = 0;

	private playing = false;
	private muted = false;
	private loop = false;

	private trimBeforeSeconds: number | undefined;
	private trimAfterSeconds: number | undefined;

	private animationFrameId: number | null = null;

	private videoAsyncId = 0;
	private audioAsyncId = 0;

	private initialized = false;
	private totalDuration: number | undefined;

	// for remotion buffer state
	private isBuffering = false;
	private onBufferingChangeCallback?: (isBuffering: boolean) => void;

	private audioBufferHealth = 0;
	private audioIteratorStarted = false;
	private readonly HEALTHY_BUFER_THRESHOLD_SECONDS = 1;

	private onVideoFrameCallback?: (frame: CanvasImageSource) => void;

	constructor({
		canvas,
		src,
		logLevel,
		sharedAudioContext,
		loop,
		trimBeforeSeconds,
		trimAfterSeconds,
		playbackRate,
	}: {
		canvas: HTMLCanvasElement | null;
		src: string;
		logLevel: LogLevel;
		sharedAudioContext: AudioContext;
		loop: boolean;
		trimBeforeSeconds: number | undefined;
		trimAfterSeconds: number | undefined;
		playbackRate: number;
	}) {
		this.canvas = canvas ?? null;
		this.src = src;
		this.logLevel = logLevel ?? window.remotion_logLevel;
		this.sharedAudioContext = sharedAudioContext;
		this.playbackRate = playbackRate;
		this.loop = loop;
		this.trimBeforeSeconds = trimBeforeSeconds;
		this.trimAfterSeconds = trimAfterSeconds;

		if (canvas) {
			const context = canvas.getContext('2d', {
				alpha: false,
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
		return this.initialized && Boolean(this.sharedAudioContext);
	}

	private hasAudio(): boolean {
		return Boolean(this.audioSink && this.sharedAudioContext && this.gainNode);
	}

	private isCurrentlyBuffering(): boolean {
		return this.isBuffering && Boolean(this.bufferingStartedAtMs);
	}

	public async initialize(startTimeUnresolved: number): Promise<void> {
		try {
			const urlSource = new UrlSource(this.src);

			const input = new Input({
				source: urlSource,
				formats: ALL_FORMATS,
			});

			this.input = input;

			const [duration, videoTrack, audioTrack] = await Promise.all([
				input.computeDuration(),
				input.getPrimaryVideoTrack(),
				input.getPrimaryAudioTrack(),
			]);
			this.totalDuration = duration;

			if (!videoTrack && !audioTrack) {
				throw new Error(`No video or audio track found for ${this.src}`);
			}

			if (videoTrack && this.canvas && this.context) {
				this.canvasSink = new CanvasSink(videoTrack, {
					poolSize: 2,
					fit: 'contain',
				});

				this.canvas.width = videoTrack.displayWidth;
				this.canvas.height = videoTrack.displayHeight;
			}

			if (audioTrack && this.sharedAudioContext) {
				this.audioSink = new AudioBufferSink(audioTrack);
				this.gainNode = this.sharedAudioContext.createGain();
				this.gainNode.connect(this.sharedAudioContext.destination);
			}

			const startTime = resolvePlaybackTime({
				absolutePlaybackTimeInSeconds: startTimeUnresolved,
				playbackRate: this.playbackRate,
				loop: this.loop,
				trimBeforeInSeconds: this.trimBeforeSeconds,
				trimAfterInSeconds: this.trimAfterSeconds,
				mediaDurationInSeconds: this.totalDuration,
			});

			if (this.sharedAudioContext) {
				this.audioSyncAnchor = this.sharedAudioContext.currentTime - startTime;
			}

			this.initialized = true;

			await Promise.all([
				this.startAudioIterator(startTime),
				this.startVideoIterator(startTime),
			]);

			this.startRenderLoop();
		} catch (error) {
			Internals.Log.error(
				{logLevel: this.logLevel, tag: '@remotion/media'},
				'[MediaPlayer] Failed to initialize',
				error,
			);
			throw error;
		}
	}

	private cleanupAudioQueue(): void {
		for (const node of this.queuedAudioNodes) {
			node.stop();
		}

		this.queuedAudioNodes.clear();
	}

	private async cleanAudioIteratorAndNodes(): Promise<void> {
		await this.audioBufferIterator?.return();
		this.audioBufferIterator = null;
		this.audioIteratorStarted = false;
		this.audioBufferHealth = 0;

		this.cleanupAudioQueue();
	}

	public async seekTo(time: number): Promise<void> {
		if (!this.isReady()) return;

		const newTime = resolvePlaybackTime({
			absolutePlaybackTimeInSeconds: time,
			playbackRate: this.playbackRate,
			loop: this.loop,
			trimBeforeInSeconds: this.trimBeforeSeconds,
			trimAfterInSeconds: this.trimAfterSeconds,
			mediaDurationInSeconds: this.totalDuration,
		});
		const currentPlaybackTime = this.getPlaybackTime();
		const isSignificantSeek =
			Math.abs(newTime - currentPlaybackTime) > SEEK_THRESHOLD;

		if (isSignificantSeek) {
			this.nextFrame = null;
			this.audioSyncAnchor = this.sharedAudioContext.currentTime - newTime;

			if (this.audioSink) {
				await this.cleanAudioIteratorAndNodes();
			}

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
		this.cleanupAudioQueue();
		this.stopRenderLoop();
	}

	public setMuted(muted: boolean): void {
		this.muted = muted;
		if (muted) {
			this.cleanupAudioQueue();
		}
	}

	public setVolume(volume: number): void {
		if (!this.gainNode) {
			return;
		}

		const appliedVolume = Math.max(0, volume);
		this.gainNode.gain.value = appliedVolume;
	}

	public setPlaybackRate(rate: number): void {
		this.playbackRate = rate;
	}

	public setLoop(loop: boolean): void {
		this.loop = loop;
	}

	public dispose(): void {
		this.input?.dispose();
		this.stopRenderLoop();
		this.videoFrameIterator?.return();
		this.cleanAudioIteratorAndNodes();
		this.videoAsyncId++;
	}

	private getPlaybackTime(): number {
		const absoluteTime =
			this.sharedAudioContext.currentTime - this.audioSyncAnchor;
		return resolvePlaybackTime({
			absolutePlaybackTimeInSeconds: absoluteTime,
			playbackRate: this.playbackRate,
			loop: this.loop,
			trimBeforeInSeconds: this.trimBeforeSeconds,
			trimAfterInSeconds: this.trimAfterSeconds,
			mediaDurationInSeconds: this.totalDuration,
		});
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

		this.queuedAudioNodes.add(node);
		node.onended = () => this.queuedAudioNodes.delete(node);
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
			!this.hasAudio() ||
			(this.audioIteratorStarted &&
				this.audioBufferHealth >= this.HEALTHY_BUFER_THRESHOLD_SECONDS)
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
		return (
			!this.isBuffering &&
			this.canRenderVideo() &&
			this.nextFrame !== null &&
			this.nextFrame.timestamp <= this.getPlaybackTime()
		);
	}

	private drawCurrentFrame(): void {
		if (this.context && this.nextFrame) {
			this.context.drawImage(this.nextFrame.canvas, 0, 0);
		}

		if (this.onVideoFrameCallback && this.canvas) {
			this.onVideoFrameCallback(this.canvas);
		}

		this.nextFrame = null;
		this.updateNextFrame();
	}

	private startAudioIterator = async (
		startFromSecond: number,
	): Promise<void> => {
		if (!this.hasAudio()) return;

		this.audioAsyncId++;
		const currentAsyncId = this.audioAsyncId;

		// Clean up existing audio iterator
		await this.audioBufferIterator?.return();
		this.audioIteratorStarted = false;
		this.audioBufferHealth = 0;

		try {
			this.audioBufferIterator = this.audioSink!.buffers(startFromSecond);
			this.runAudioIterator(startFromSecond, currentAsyncId);
		} catch (error) {
			Internals.Log.error(
				{logLevel: this.logLevel, tag: '@remotion/media'},
				'[MediaPlayer] Failed to start audio iterator',
				error,
			);
		}
	};

	private startVideoIterator = async (timeToSeek: number): Promise<void> => {
		if (!this.canvasSink) {
			return;
		}

		this.videoAsyncId++;
		const currentAsyncId = this.videoAsyncId;

		this.videoFrameIterator?.return().catch(() => undefined);

		this.videoFrameIterator = this.canvasSink.canvases(timeToSeek);

		try {
			const firstFrame = (await this.videoFrameIterator.next()).value ?? null;
			const secondFrame = (await this.videoFrameIterator.next()).value ?? null;

			if (currentAsyncId !== this.videoAsyncId) {
				return;
			}

			if (firstFrame && this.context) {
				Internals.Log.trace(
					{logLevel: this.logLevel, tag: '@remotion/media'},
					`[MediaPlayer] Drew initial frame ${firstFrame.timestamp.toFixed(3)}s`,
				);
				this.context.drawImage(firstFrame.canvas, 0, 0);

				if (this.onVideoFrameCallback && this.canvas) {
					this.onVideoFrameCallback(this.canvas);
				}
			}

			this.nextFrame = secondFrame ?? null;

			if (secondFrame) {
				Internals.Log.trace(
					{logLevel: this.logLevel, tag: '@remotion/media'},
					`[MediaPlayer] Buffered next frame ${secondFrame.timestamp.toFixed(3)}s`,
				);
			}
		} catch (error) {
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
					(await this.videoFrameIterator.next()).value ?? null;

				if (!newNextFrame) {
					break;
				}

				if (newNextFrame.timestamp <= this.getPlaybackTime()) {
					continue;
				} else {
					this.nextFrame = newNextFrame;
					Internals.Log.trace(
						{logLevel: this.logLevel, tag: '@remotion/media'},
						`[MediaPlayer] Buffered next frame ${newNextFrame.timestamp.toFixed(3)}s`,
					);

					break;
				}
			}
		} catch (error) {
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
			currentBufferDuration >= this.HEALTHY_BUFER_THRESHOLD_SECONDS;

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
		audioAsyncId: number,
	): Promise<void> => {
		if (!this.hasAudio() || !this.audioBufferIterator) return;

		try {
			let totalBufferDuration = 0;
			let isFirstBuffer = true;
			this.audioIteratorStarted = true;

			while (true) {
				if (audioAsyncId !== this.audioAsyncId) {
					return;
				}

				const BUFFERING_TIMEOUT_MS = 50;

				let result: IteratorResult<WrappedAudioBuffer, void>;
				try {
					result = await withTimeout(
						this.audioBufferIterator.next(),
						BUFFERING_TIMEOUT_MS,
						'Iterator timeout',
					);
				} catch {
					this.setBufferingState(true);
					await sleep(10);
					continue;
				}

				if (result.done || !result.value) {
					break;
				}

				const {buffer, timestamp, duration} = result.value;

				totalBufferDuration += duration;

				this.audioBufferHealth = Math.max(
					0,
					totalBufferDuration / this.playbackRate,
				);

				this.maybeResumeFromBuffering(totalBufferDuration / this.playbackRate);

				if (this.playing && !this.muted) {
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

				if (timestamp - this.getPlaybackTime() >= 1) {
					await new Promise<void>((resolve) => {
						const check = () => {
							if (timestamp - this.getPlaybackTime() < 1) {
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
			Internals.Log.error(
				{logLevel: this.logLevel, tag: '@remotion/media'},
				'[MediaPlayer] Failed to run audio iterator',
				error,
			);
		}
	};
}
