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
import {sleep, withTimeout} from '../timeout-utils';

export const SEEK_THRESHOLD = 0.05;

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

	private sharedAudioContext: AudioContext;

	// audioDelay = mediaTimestamp + audioSyncAnchor - audioContext.currentTime
	private audioSyncAnchor: number = 0;

	private playing = false;
	private animationFrameId: number | null = null;

	private asyncId = 0;

	private initialized = false;
	private totalDuration = 0;

	// for remotion buffer state
	private isBuffering = false;
	private onBufferingChangeCallback?: (isBuffering: boolean) => void;

	private audioBufferHealth = 0;
	private audioIteratorStarted = false;
	private readonly HEALTHY_BUFER_THRESHOLD_SECONDS = 1;

	constructor({
		canvas,
		src,
		logLevel,
		sharedAudioContext,
	}: {
		canvas: HTMLCanvasElement;
		src: string;
		logLevel: LogLevel;
		sharedAudioContext: AudioContext;
	}) {
		this.canvas = canvas;
		this.src = src;
		this.logLevel = logLevel ?? 'info';
		this.sharedAudioContext = sharedAudioContext;

		const context = canvas.getContext('2d', {
			alpha: false,
			desynchronized: true,
		});
		if (!context) {
			throw new Error('Could not get 2D context from canvas');
		}

		this.context = context;
	}

	private input: Input<UrlSource> | null = null;

	public async initialize(startTime: number = 0): Promise<void> {
		try {
			const urlSource = new UrlSource(this.src);

			const input = new Input({
				source: urlSource,
				formats: ALL_FORMATS,
			});

			this.input = input;

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
			}

			if (audioTrack && this.sharedAudioContext) {
				this.audioSink = new AudioBufferSink(audioTrack);
				this.gainNode = this.sharedAudioContext.createGain();
				this.gainNode.connect(this.sharedAudioContext.destination);
			}

			if (this.sharedAudioContext) {
				this.audioSyncAnchor = this.sharedAudioContext.currentTime - startTime;
			}

			this.initialized = true;

			await this.startAudioIterator(startTime);

			await this.startVideoIterator(startTime);

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
			this.render();
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

			this.startRenderLoop();
		}
	}

	public pause(): void {
		this.playing = false;
		this.cleanupAudioQueue();
		this.stopRenderLoop();
	}

	public dispose(): void {
		this.input?.dispose();
		this.stopRenderLoop();
		this.videoFrameIterator?.return();
		this.cleanAudioIteratorAndNodes();
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

	public onBufferingChange(callback: (isBuffering: boolean) => void): void {
		this.onBufferingChangeCallback = callback;
	}

	private canRenderVideo(): boolean {
		return (
			this.audioIteratorStarted &&
			this.audioBufferHealth >= this.HEALTHY_BUFER_THRESHOLD_SECONDS
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
		this.context.drawImage(this.nextFrame!.canvas, 0, 0);
		this.nextFrame = null;
		this.updateNextFrame();
	}

	private startAudioIterator = async (timeToSeek: number): Promise<void> => {
		if (!this.audioSink || !this.sharedAudioContext) {
			return;
		}

		// Clean up existing audio iterator
		await this.audioBufferIterator?.return();
		this.audioIteratorStarted = false;
		this.audioBufferHealth = 0;

		try {
			this.audioBufferIterator = this.audioSink.buffers(timeToSeek);
			this.runAudioIterator();
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

		this.asyncId++;
		const currentAsyncId = this.asyncId;

		await this.videoFrameIterator?.return();

		this.videoFrameIterator = this.canvasSink.canvases(timeToSeek);

		try {
			const firstFrame = (await this.videoFrameIterator.next()).value ?? null;
			const secondFrame = (await this.videoFrameIterator.next()).value ?? null;

			if (currentAsyncId !== this.asyncId) {
				return;
			}

			if (firstFrame) {
				Internals.Log.trace(
					{logLevel: this.logLevel, tag: '@remotion/media'},
					`[MediaPlayer] Drew initial frame ${firstFrame.timestamp.toFixed(3)}s`,
				);
				this.context.drawImage(firstFrame.canvas, 0, 0);
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
		if (!this.isBuffering || !this.bufferingStartedAtMs) {
			return;
		}

		const now = performance.now();
		const bufferingDuration = now - this.bufferingStartedAtMs;

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

	// used to resume from buffering in case buffer was not healthy enough and timeout passed
	private maybeForceResumeFromBuffering(): void {
		if (!this.isBuffering || !this.bufferingStartedAtMs) {
			return;
		}

		const now = performance.now();
		const bufferingDuration = now - this.bufferingStartedAtMs;
		const forceTimeout = bufferingDuration > this.minBufferingTimeoutMs * 10;

		if (forceTimeout) {
			Internals.Log.trace(
				{logLevel: this.logLevel, tag: '@remotion/media'},
				`[MediaPlayer] Force resuming from buffering after ${bufferingDuration}ms`,
			);
			this.setBufferingState(false);
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

				this.audioBufferHealth = Math.max(0, totalBufferDuration);

				this.maybeResumeFromBuffering(totalBufferDuration);

				if (this.playing) {
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
