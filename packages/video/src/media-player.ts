import type {WrappedCanvas} from 'mediabunny';
import {ALL_FORMATS, CanvasSink, Input, UrlSource} from 'mediabunny';
import {Log, type LogLevel} from './log';

export interface MediaPlayerOptions {
	readonly logLevel?: LogLevel;
}

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

	private targetTime = 0; // set by React component via seekTo()

	private playing = false;
	private animationFrameId: number | null = null;

	private asyncId = 0;

	private initialized = false;
	private totalDuration = 0;

	constructor({
		canvas,
		src,
		logLevel,
	}: {
		canvas: HTMLCanvasElement;
		src: string;
		logLevel: LogLevel;
	}) {
		this.canvas = canvas;
		this.src = src;
		this.logLevel = logLevel ?? 'info';

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

			if (!videoTrack) {
				throw new Error(`No video track found for ${this.src}`);
			}

			this.canvasSink = new CanvasSink(videoTrack, {
				poolSize: 2,
				fit: 'contain',
			});

			this.canvas.width = videoTrack.displayWidth;
			this.canvas.height = videoTrack.displayHeight;

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
		if (!this.initialized) {
			Log.trace(
				this.logLevel,
				`[MediaPlayer] Not initialized, ignoring seekTo(${time})`,
			);
			return;
		}

		const newTargetTime = Math.max(0, Math.min(time, this.totalDuration));

		const isSignificantSeek =
			Math.abs(newTargetTime - this.targetTime) > SEEK_THRESHOLD;

		this.targetTime = newTargetTime;

		if (isSignificantSeek) {
			Log.trace(
				this.logLevel,
				`[MediaPlayer] Significant seek to ${this.targetTime.toFixed(3)}s - creating new iterator`,
			);
			this.startVideoIterator(this.targetTime);
		} else {
			Log.trace(
				this.logLevel,
				`[MediaPlayer] Minor time update to ${this.targetTime.toFixed(3)}s - using existing iterator`,
			);

			// if paused, trigger a single frame update to show current position
			if (!this.playing) {
				this.renderSingleFrame();
			}
		}
	}

	public play(): void {
		if (!this.playing) {
			this.playing = true;
			Log.trace(this.logLevel, `[MediaPlayer] Play - starting render loop`);
			this.startRenderLoop();
		}
	}

	public pause(): void {
		if (this.playing) {
			this.playing = false;
			Log.trace(this.logLevel, `[MediaPlayer] Pause - stopping render loop`);
			this.stopRenderLoop();
		}
	}

	public dispose(): void {
		Log.trace(this.logLevel, `[MediaPlayer] Disposing...`);

		this.stopRenderLoop();
		this.videoFrameIterator?.return();
		this.videoFrameIterator = null;
		this.nextFrame = null;
		this.canvasSink = null;
		this.initialized = false;
		this.asyncId++;
	}

	public get currentTime(): number {
		return this.targetTime;
	}

	public get duration(): number {
		return this.totalDuration;
	}

	public get isPlaying(): boolean {
		return this.playing;
	}

	private renderSingleFrame(): void {
		if (this.nextFrame && this.nextFrame.timestamp <= this.targetTime) {
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
		if (this.nextFrame && this.nextFrame.timestamp <= this.targetTime) {
			Log.trace(
				this.logLevel,
				`[MediaPlayer] Drawing frame at ${this.nextFrame.timestamp.toFixed(3)}s (target: ${this.targetTime.toFixed(3)}s)`,
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

				if (newNextFrame.timestamp <= this.targetTime) {
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
}
