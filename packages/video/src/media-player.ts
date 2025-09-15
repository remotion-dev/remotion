import type {WrappedAudioBuffer, WrappedCanvas} from 'mediabunny';
import {
	ALL_FORMATS,
	AudioBufferSink,
	CanvasSink,
	Input,
	UrlSource,
} from 'mediabunny';
import {Log, type LogLevel} from './log';

const SEEK_THRESHOLD = 0.05;

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
	private expectedAudioTime: number = 0;

	private sharedAudioContext: AudioContext | null = null;
	private mediaTimeOffset: number = 0;

	private playing = false;
	private animationFrameId: number | null = null;

	private asyncId = 0;

	private initialized = false;
	private totalDuration = 0;

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

		// Initialize timing offset - media starts at time 0, so offset equals current audio context time
		if (this.sharedAudioContext) {
			this.mediaTimeOffset = this.sharedAudioContext.currentTime;
		}

		Log.trace(this.logLevel, `[MediaPlayer] Created for src: ${src}`);
	}

	public async initialize(): Promise<void> {
		if (this.initialized) {
			Log.trace(this.logLevel, `[MediaPlayer] Already initialized, skipping`);
			return;
		}

		try {
			Log.trace(this.logLevel, `[MediaPlayer] Initializing...`);

			const input = new Input({
				source: new UrlSource(this.src),
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
			}

			if (audioTrack && this.sharedAudioContext) {
				this.audioSink = new AudioBufferSink(audioTrack);
				this.gainNode = this.sharedAudioContext.createGain();
				this.gainNode.connect(this.sharedAudioContext.destination);
			}

			this.initialized = true;

			Log.trace(
				this.logLevel,
				`[MediaPlayer] Initialized successfully, duration: ${this.totalDuration}s`,
			);
		} catch (error) {
			Log.error('[MediaPlayer] Failed to initialize', error);
			throw error;
		}
	}

	public seekTo(time: number): void {
		if (!this.initialized || !this.sharedAudioContext) {
			return;
		}

		const newTime = Math.max(0, Math.min(time, this.totalDuration));
		const currentPlaybackTime = this.getPlaybackTime();
		const isSignificantSeek =
			Math.abs(newTime - currentPlaybackTime) > SEEK_THRESHOLD;

		// Update offset to make audio context time correspond to new media time
		this.mediaTimeOffset = this.sharedAudioContext.currentTime - newTime;

		if (isSignificantSeek) {
			Log.trace(
				this.logLevel,
				`[MediaPlayer] Significant seek to ${newTime.toFixed(3)}s - creating new iterator`,
			);
			this.startVideoIterator(newTime);

			// if playing, restart audio iterator at new position
			if (this.playing && this.audioSink) {
				this.audioBufferIterator?.return();
				this.audioBufferIterator = this.audioSink.buffers(newTime);

				// Stop current audio nodes
				for (const node of this.queuedAudioNodes) {
					node.stop();
				}

				this.queuedAudioNodes.clear();

				this.runAudioIterator();
			}
		} else {
			Log.trace(
				this.logLevel,
				`[MediaPlayer] Minor time update to ${newTime.toFixed(3)}s - using existing iterator`,
			);

			// if paused, trigger a single frame update to show current position
			if (!this.playing) {
				this.renderSingleFrame();
			}
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

			// start audio iterator if we have audio
			if (this.audioSink) {
				// clean up existing iterator and start a new one
				await this.audioBufferIterator?.return();
				this.audioBufferIterator = this.audioSink.buffers(
					this.getPlaybackTime(),
				);
				this.runAudioIterator();
			}
		}
	}

	public pause(): void {
		if (this.playing) {
			this.playing = false;

			// stop audio iterator
			this.audioBufferIterator?.return();
			this.audioBufferIterator = null;

			// stop all playing audio nodes
			for (const node of this.queuedAudioNodes) {
				node.stop();
			}

			this.queuedAudioNodes.clear();

			Log.trace(this.logLevel, `[MediaPlayer] Pause - stopping render loop`);
			this.stopRenderLoop();
		}
	}

	public dispose(): void {
		Log.trace(this.logLevel, `[MediaPlayer] Disposing...`);

		this.stopRenderLoop();

		// clean up video resources
		this.videoFrameIterator?.return();
		this.videoFrameIterator = null;
		this.nextFrame = null;
		this.canvasSink = null;

		// Clean up audio resources
		for (const node of this.queuedAudioNodes) {
			node.stop();
		}

		this.queuedAudioNodes.clear();
		this.audioBufferIterator?.return();
		this.audioBufferIterator = null;
		this.audioSink = null;
		this.gainNode = null;

		this.initialized = false;
		this.asyncId++;
	}

	public get currentTime(): number {
		return this.getPlaybackTime();
	}

	// current position in the media
	private getPlaybackTime(): number {
		if (!this.sharedAudioContext) {
			return 0;
		}

		// Audio context is single source of truth
		return this.sharedAudioContext.currentTime - this.mediaTimeOffset;
	}

	public get duration(): number {
		return this.totalDuration;
	}

	public get isPlaying(): boolean {
		return this.playing;
	}

	private renderSingleFrame(): void {
		const currentPlaybackTime = this.getPlaybackTime();

		if (this.nextFrame && this.nextFrame.timestamp <= currentPlaybackTime) {
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
		if (this.nextFrame && this.nextFrame.timestamp <= currentPlaybackTime) {
			Log.trace(
				this.logLevel,
				`[MediaPlayer] Drawing frame at ${this.nextFrame.timestamp.toFixed(3)}s (playback time: ${currentPlaybackTime.toFixed(3)}s)`,
			);
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
			}

			this.nextFrame = secondFrame;

			if (secondFrame) {
				Log.trace(
					this.logLevel,
					`[MediaPlayer] Buffered next frame ${secondFrame.timestamp.toFixed(3)}s`,
				);
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
					Log.trace(
						this.logLevel,
						`[MediaPlayer] Drawing immediate frame ${newNextFrame.timestamp.toFixed(3)}s`,
					);
					this.context.drawImage(newNextFrame.canvas, 0, 0);
				} else {
					this.nextFrame = newNextFrame;
					Log.trace(
						this.logLevel,
						`[MediaPlayer] Buffered next frame ${newNextFrame.timestamp.toFixed(3)}s`,
					);
					break;
				}
			}
		} catch (error) {
			Log.error('[MediaPlayer] Failed to update next frame', error);
		}
	};

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
			// Initialize expected audio time to current position for sample-perfect continuity
			this.expectedAudioTime = this.sharedAudioContext.currentTime;

			// to play back audio, we loop over all audio chunks (typically very short) of the file and play them at the correct
			// timestamp. the result is a continuous, uninterrupted audio signal.
			for await (const {buffer, timestamp} of this.audioBufferIterator) {
				const node = this.sharedAudioContext.createBufferSource();
				node.buffer = buffer;
				node.connect(this.gainNode);

				// use expectedAudioTime for sample-perfect continuity instead of timestamp-based scheduling
				// This ensures no gaps or overlaps between audio chunks
				if (this.expectedAudioTime >= this.sharedAudioContext.currentTime) {
					// If the audio starts in the future, schedule it at expected time
					node.start(this.expectedAudioTime);
				} else {
					// if it starts in the past, play the audible section with proper offset
					// in web audio api, we cannot schedule the start time in the past, so we need to use the current time and an offset
					const offset =
						this.sharedAudioContext.currentTime - this.expectedAudioTime;
					node.start(this.sharedAudioContext.currentTime, offset);
				}

				this.queuedAudioNodes.add(node);
				node.onended = () => {
					this.queuedAudioNodes.delete(node);
				};

				// update expected time for next chunk to ensure sample-perfect continuity
				this.expectedAudioTime += buffer.duration;

				// If we're more than a second ahead of the current playback time, let's slow down the loop until time has
				// passed. Use timestamp for throttling logic as it represents media time.
				if (timestamp - this.getPlaybackTime() >= 1) {
					await new Promise<void>((resolve) => {
						const id = setInterval(() => {
							if (timestamp - this.getPlaybackTime() < 1) {
								clearInterval(id);
								resolve();
							}
						}, 100);
					});
				}
			}
		} catch (error) {
			Log.error('[MediaPlayer] Failed to run audio iterator', error);
		}
	};
}
