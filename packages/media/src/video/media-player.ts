import type {WrappedAudioBuffer, WrappedCanvas} from 'mediabunny';
import {
	ALL_FORMATS,
	AudioBufferSink,
	CanvasSink,
	Input,
	UrlSource,
} from 'mediabunny';
import {Log, type LogLevel} from '../log';

/* eslint-disable no-promise-executor-return */
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const SEEK_THRESHOLD = 0.05;

function withTimeout<T>(
	promise: Promise<T>,
	timeoutMs: number,
	errorMessage: string = 'Operation timed out',
): Promise<T> {
	let timeoutId: number | null = null;

	const timeoutPromise = new Promise<never>((_, reject) => {
		timeoutId = window.setTimeout(() => {
			reject(new Error(errorMessage));
		}, timeoutMs);
	});

	return Promise.race([
		promise.finally(() => {
			if (timeoutId) {
				clearTimeout(timeoutId);
			}
		}),
		timeoutPromise,
	]);
}

export class MediaPlayer {
	private canvas: HTMLCanvasElement;
	private context: CanvasRenderingContext2D;
	private src: string;
	private logLevel: LogLevel;

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

	private sharedAudioContext: AudioContext | null = null;

	// offset used to sync audio timing with Remotion playback
	// audioDelay = mediaTimestamp + audioSyncAnchor - audioContext.currentTime
	private audioSyncAnchor: number = 0;

	private playing = false;
	private animationFrameId: number | null = null;

	private asyncId = 0;

	private initialized = false;
	private totalDuration = 0;
	private actualFps: number | null = null;

	// for remotion buffer state
	private isStalled = false;
	private onStalledChangeCallback?: (isStalled: boolean) => void;

	// Audio-first buffering strategy (MediaBunny pattern)
	private audioBufferHealth = 0; // seconds of audio buffered ahead
	private audioIteratorStarted = false;
	private readonly HEALTHY_BUFER_THRESHOLD = 1;

	constructor({
		canvas,
		src,
		logLevel,
		sharedAudioContext,
	}: {
		canvas: HTMLCanvasElement;
		src: string;
		logLevel: LogLevel;
		sharedAudioContext?: AudioContext | null;
	}) {
		this.canvas = canvas;
		this.src = src;
		this.logLevel = logLevel ?? 'info';
		this.sharedAudioContext = sharedAudioContext || null;

		const context = canvas.getContext('2d', {
			alpha: false,
			desynchronized: true,
		});
		if (!context) {
			throw new Error('Could not get 2D context from canvas');
		}

		this.context = context;

		Log.trace(this.logLevel, `[MediaPlayer] Created for src: ${src}`);
	}

	public async initialize(startTime: number = 0): Promise<void> {
		if (this.initialized) {
			Log.trace(this.logLevel, `[MediaPlayer] Already initialized, skipping`);
			return;
		}

		try {
			Log.trace(
				this.logLevel,
				`[MediaPlayer] Initializing at startTime: ${startTime.toFixed(3)}s...`,
			);

			const urlSource = new UrlSource(this.src);

			const input = new Input({
				source: urlSource,
				formats: ALL_FORMATS,
			});

			this.totalDuration = await input.computeDuration();
			const videoTrack = await input.getPrimaryVideoTrack();
			const audioTrack = await input.getPrimaryAudioTrack();

			if (!videoTrack && !audioTrack) {
				throw new Error(`No video or audio track found for ${this.src}`);
			}

			if (videoTrack) {
				this.canvasSink = new CanvasSink(videoTrack, {
					poolSize: 2,
					fit: 'contain',
				});

				this.canvas.width = videoTrack.displayWidth;
				this.canvas.height = videoTrack.displayHeight;

				// Extract actual FPS for stall detection
				const packetStats = await videoTrack.computePacketStats();
				this.actualFps = packetStats.averagePacketRate;

				Log.trace(
					this.logLevel,
					`[MediaPlayer] Detected video FPS: ${this.actualFps}`,
				);
			}

			if (audioTrack && this.sharedAudioContext) {
				this.audioSink = new AudioBufferSink(audioTrack);
				this.gainNode = this.sharedAudioContext.createGain();
				this.gainNode.connect(this.sharedAudioContext.destination);
			}

			// Audio-first strategy: audio will start first regardless of content type

			// Initialize timing offset based on actual starting position
			if (this.sharedAudioContext) {
				this.audioSyncAnchor = this.sharedAudioContext.currentTime - startTime;
			}

			this.initialized = true;

			// Start audio iterator first as the buffering signal (MediaBunny strategy)
			await this.startAudioIterator(startTime);

			// Start video iterator after audio is ready
			await this.startVideoIterator(startTime);

			this.startRenderLoop();

			Log.trace(
				this.logLevel,
				`[MediaPlayer] Initialized successfully with iterators started, duration: ${this.totalDuration}s`,
			);
		} catch (error) {
			Log.error('[MediaPlayer] Failed to initialize', error);
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
		if (!this.initialized || !this.sharedAudioContext) {
			return;
		}

		const newTime = Math.max(0, Math.min(time, this.totalDuration));
		const currentPlaybackTime = this.getPlaybackTime();
		const isSignificantSeek =
			Math.abs(newTime - currentPlaybackTime) > SEEK_THRESHOLD;

		if (isSignificantSeek) {
			this.audioSyncAnchor = this.sharedAudioContext.currentTime - newTime;

			if (this.audioSink) {
				await this.cleanAudioIteratorAndNodes();
			}

			await this.startAudioIterator(newTime);
			await this.startVideoIterator(newTime);
		}

		if (!this.playing) {
			this.renderSingleFrame();
		}
	}

	public async drawInitialFrame(time: number = 0): Promise<void> {
		if (!this.initialized || !this.canvasSink) {
			Log.trace(
				this.logLevel,
				`[MediaPlayer] Cannot draw initial frame - not initialized or no canvas sink`,
			);
			return;
		}

		try {
			Log.trace(
				this.logLevel,
				`[MediaPlayer] Drawing initial frame at ${time.toFixed(3)}s`,
			);

			// create temporary iterator just to get the first frame
			const tempIterator = this.canvasSink.canvases(time);
			const firstFrame = (await tempIterator.next()).value;

			if (firstFrame) {
				this.context.drawImage(firstFrame.canvas, 0, 0);
				Log.trace(
					this.logLevel,
					`[MediaPlayer] Drew initial frame at timestamp ${firstFrame.timestamp.toFixed(3)}s`,
				);
			} else {
				Log.trace(
					this.logLevel,
					`[MediaPlayer] No frame available at ${time.toFixed(3)}s`,
				);
			}

			// clean up the temporary iterator
			await tempIterator.return();
		} catch (error) {
			Log.error('[MediaPlayer] Failed to draw initial frame', error);
		}
	}

	public async play(): Promise<void> {
		if (!this.initialized || !this.sharedAudioContext) {
			return;
		}

		if (!this.playing) {
			if (this.sharedAudioContext.state === 'suspended') {
				await this.sharedAudioContext.resume();
			}

			this.playing = true;

			Log.trace(this.logLevel, `[MediaPlayer] Play - starting render loop`);
			this.startRenderLoop();
		}
	}

	public pause(): void {
		this.playing = false;

		Log.trace(this.logLevel, `[MediaPlayer] Pause - stopping render loop`);
		this.cleanupAudioQueue();
		this.stopRenderLoop();
	}

	public dispose(): void {
		Log.trace(this.logLevel, `[MediaPlayer] Disposing...`);

		this.stopRenderLoop();

		// clean up video resources
		this.videoFrameIterator?.return();
		this.videoFrameIterator = null;
		this.nextFrame = null;
		this.canvasSink = null;

		this.cleanAudioIteratorAndNodes();
		this.audioSink = null;
		this.gainNode = null;
		this.audioIteratorStarted = false;
		this.audioBufferHealth = 0;

		this.initialized = false;
		this.asyncId++;
	}

	// since we're routing audio to the shared audio context, we need to convert the media timestamp to the audio context timeline
	private getPlaybackTime(): number {
		if (!this.sharedAudioContext) {
			return 0;
		}

		return this.sharedAudioContext.currentTime - this.audioSyncAnchor;
	}

	private scheduleAudioChunk(
		buffer: AudioBuffer,
		mediaTimestamp: number,
	): void {
		if (!this.sharedAudioContext || !this.gainNode) {
			return;
		}

		// calculate how long to delay this chunk for sync
		const audioDelay =
			mediaTimestamp +
			this.audioSyncAnchor -
			this.sharedAudioContext.currentTime;
		const scheduleTime = this.sharedAudioContext.currentTime + audioDelay;

		const node = this.sharedAudioContext.createBufferSource();
		node.buffer = buffer;
		node.connect(this.gainNode);

		if (audioDelay >= 0) {
			// schedule in the future - perfect timing
			node.start(scheduleTime);
		} else {
			// we're behind - start now but skip ahead in the audio buffer
			node.start(this.sharedAudioContext.currentTime, -audioDelay);
		}

		this.queuedAudioNodes.add(node);
		node.onended = () => {
			this.queuedAudioNodes.delete(node);
		};
	}

	public onStalledChange(callback: (isStalled: boolean) => void): void {
		this.onStalledChangeCallback = callback;
	}

	private canRenderVideo(): boolean {
		return (
			this.audioIteratorStarted &&
			this.audioBufferHealth >= this.HEALTHY_BUFER_THRESHOLD
		);
	}

	private renderSingleFrame(): void {
		const currentPlaybackTime = this.getPlaybackTime();
		const canRenderVideo = this.canRenderVideo();

		if (
			canRenderVideo &&
			this.nextFrame &&
			this.nextFrame.timestamp <= currentPlaybackTime
		) {
			Log.trace(
				this.logLevel,
				`[MediaPlayer] Single frame update at ${this.nextFrame.timestamp.toFixed(3)}s`,
			);
			this.context.drawImage(this.nextFrame.canvas, 0, 0);

			this.nextFrame = null;
			this.updateNextFrame();
		}
	}

	private startRenderLoop(): void {
		if (this.animationFrameId !== null) {
			return;
		}

		Log.trace(this.logLevel, `[MediaPlayer] Starting render loop`);
		this.render();
	}

	private stopRenderLoop(): void {
		if (this.animationFrameId !== null) {
			cancelAnimationFrame(this.animationFrameId);
			this.animationFrameId = null;
			Log.trace(this.logLevel, `[MediaPlayer] Stopped render loop`);
		}
	}

	private render = (): void => {
		const currentPlaybackTime = this.getPlaybackTime();

		if (this.isStalled) {
			this.maybeForceResumeFromStall();
		}

		const canRenderVideo = this.canRenderVideo();

		if (
			!this.isStalled &&
			canRenderVideo &&
			this.nextFrame &&
			this.nextFrame.timestamp <= currentPlaybackTime
		) {
			this.context.drawImage(this.nextFrame.canvas, 0, 0);

			this.nextFrame = null;

			this.updateNextFrame();
		}

		// continue render loop only if playing
		if (this.playing) {
			this.animationFrameId = requestAnimationFrame(this.render);
		} else {
			this.animationFrameId = null;
		}
	};

	private startAudioIterator = async (timeToSeek: number): Promise<void> => {
		if (!this.audioSink || !this.sharedAudioContext) {
			Log.trace(
				this.logLevel,
				`[MediaPlayer] No audio sink or context - skipping audio iterator`,
			);
			return;
		}

		// Clean up existing audio iterator
		await this.audioBufferIterator?.return();
		this.audioIteratorStarted = false;
		this.audioBufferHealth = 0;

		Log.trace(
			this.logLevel,
			`[MediaPlayer] Starting audio iterator at ${timeToSeek.toFixed(3)}s`,
		);

		try {
			this.audioBufferIterator = this.audioSink.buffers(timeToSeek);
			this.runAudioIterator();

			Log.trace(
				this.logLevel,
				`[MediaPlayer] Audio iterator started successfully at ${timeToSeek.toFixed(3)}s`,
			);
		} catch (error) {
			Log.error('[MediaPlayer] Failed to start audio iterator', error);
		}
	};

	private startVideoIterator = async (timeToSeek: number): Promise<void> => {
		if (!this.canvasSink) {
			return;
		}

		this.asyncId++;
		const currentAsyncId = this.asyncId;

		await this.videoFrameIterator?.return();

		this.videoFrameIterator = this.canvasSink.canvases(timeToSeek);

		try {
			const firstFrame = (await this.videoFrameIterator.next()).value ?? null;
			const secondFrame = (await this.videoFrameIterator.next()).value ?? null;

			if (currentAsyncId !== this.asyncId) {
				Log.trace(
					this.logLevel,
					`[MediaPlayer] Race condition detected, aborting startVideoIterator for ${timeToSeek.toFixed(3)}s`,
				);
				return;
			}

			if (firstFrame) {
				Log.trace(
					this.logLevel,
					`[MediaPlayer] Drew initial frame ${firstFrame.timestamp.toFixed(3)}s`,
				);
				this.context.drawImage(firstFrame.canvas, 0, 0);

				// Audio is already started as buffering signal
			}

			this.nextFrame = secondFrame ?? null;

			if (secondFrame) {
				Log.trace(
					this.logLevel,
					`[MediaPlayer] Buffered next frame ${secondFrame.timestamp.toFixed(3)}s`,
				);

				// Audio is already started as buffering signal
			}
		} catch (error) {
			Log.error('[MediaPlayer] Failed to start video iterator', error);
		}
	};

	private updateNextFrame = async (): Promise<void> => {
		if (!this.videoFrameIterator) {
			return;
		}

		const currentAsyncId = this.asyncId;

		try {
			while (true) {
				const newNextFrame =
					(await this.videoFrameIterator.next()).value ?? null;
				if (!newNextFrame) {
					break;
				}

				if (currentAsyncId !== this.asyncId) {
					Log.trace(
						this.logLevel,
						`[MediaPlayer] Race condition detected in updateNextFrame`,
					);
					break;
				}

				if (newNextFrame.timestamp <= this.getPlaybackTime()) {
					// Only draw immediate frames if not stalled and can render video (audio-first throttling)
					if (!this.isStalled && this.canRenderVideo()) {
						Log.trace(
							this.logLevel,
							`[MediaPlayer] Drawing immediate frame ${newNextFrame.timestamp.toFixed(3)}s`,
						);
						this.context.drawImage(newNextFrame.canvas, 0, 0);
					}
				} else {
					this.nextFrame = newNextFrame;
					Log.trace(
						this.logLevel,
						`[MediaPlayer] Buffered next frame ${newNextFrame.timestamp.toFixed(3)}s`,
					);

					// Audio is already started as buffering signal

					break;
				}
			}
		} catch (error) {
			Log.error('[MediaPlayer] Failed to update next frame', error);
		}
	};

	private stallStartedAtMs: number | null = null;
	private minStalledTimeoutMs: number = 500;

	private setStalledState(isStalled: boolean): void {
		if (this.isStalled !== isStalled) {
			this.isStalled = isStalled;

			if (isStalled) {
				this.stallStartedAtMs = performance.now();
				this.onStalledChangeCallback?.(true);
			} else {
				this.stallStartedAtMs = null;
				this.onStalledChangeCallback?.(false);
			}
		}
	}

	private maybeResumeFromStall(currentBufferDuration: number): void {
		if (!this.isStalled || !this.stallStartedAtMs) {
			return;
		}

		const now = performance.now();
		const stallDuration = now - this.stallStartedAtMs;

		const minTimeElapsed = stallDuration >= this.minStalledTimeoutMs;
		const bufferHealthy = currentBufferDuration >= this.HEALTHY_BUFER_THRESHOLD;

		if (minTimeElapsed && bufferHealthy) {
			Log.trace(
				this.logLevel,
				`[MediaPlayer] Resuming from stall after ${stallDuration}ms - buffer recovered`,
			);
			this.setStalledState(false);
		}
	}

	private maybeForceResumeFromStall(): void {
		if (!this.isStalled || !this.stallStartedAtMs) {
			return;
		}

		const now = performance.now();
		const stallDuration = now - this.stallStartedAtMs;
		const forceTimeout = stallDuration > this.minStalledTimeoutMs * 10;

		if (forceTimeout) {
			Log.trace(
				this.logLevel,
				`[MediaPlayer] Force resuming from stall after ${stallDuration}ms`,
			);
			this.setStalledState(false);
		}
	}

	private runAudioIterator = async (): Promise<void> => {
		if (
			!this.audioSink ||
			!this.sharedAudioContext ||
			!this.audioBufferIterator ||
			!this.gainNode
		) {
			return;
		}

		try {
			let totalBufferDuration = 0;
			this.audioIteratorStarted = true;

			while (true) {
				const STALL_TIMEOUT_MS = 50;

				let result: IteratorResult<WrappedAudioBuffer, void>;
				try {
					result = await withTimeout(
						this.audioBufferIterator.next(),
						STALL_TIMEOUT_MS,
						'Iterator timeout',
					);
				} catch {
					this.setStalledState(true);
					await sleep(10);
					continue;
				}

				if (result.done || !result.value) {
					break;
				}

				const {buffer, timestamp, duration} = result.value;
				totalBufferDuration += duration;

				this.audioBufferHealth = Math.max(0, totalBufferDuration);

				this.maybeResumeFromStall(totalBufferDuration);

				if (this.playing) {
					this.scheduleAudioChunk(buffer, timestamp);
				}

				// Throttling logic unchanged
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
			Log.error('[MediaPlayer] Failed to run audio iterator', error);
		}
	};
}
