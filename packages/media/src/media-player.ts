import type {WrappedCanvas} from 'mediabunny';
import {
	ALL_FORMATS,
	AudioBufferSink,
	CanvasSink,
	Input,
	UrlSource,
} from 'mediabunny';
import type {LogLevel, useBufferState} from 'remotion';
import {Internals} from 'remotion';
import {
	makeAudioIterator,
	type AudioIterator,
} from './audio/audio-preview-iterator';
import type {DebugStats} from './debug-overlay/preview-overlay';
import {drawPreviewOverlay} from './debug-overlay/preview-overlay';
import {getTimeInSeconds} from './get-time-in-seconds';
import {isNetworkError} from './is-network-error';
import {
	createVideoIterator,
	type VideoIterator,
} from './video/video-preview-iterator';

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
	private debugStats: DebugStats = {
		videoIteratorsCreated: 0,
		framesRendered: 0,
	};

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

	private initialized = false;
	private totalDuration: number | undefined;

	// for remotion buffer state
	private isBuffering = false;
	private onBufferingChangeCallback?: (isBuffering: boolean) => void;

	private mediaEnded = false;

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
				this.startAudioIterator(startTime);
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
			this.audioBufferIterator?.destroy();
			this.audioBufferIterator = null;

			return;
		}

		const currentPlaybackTime = this.getPlaybackTime();
		if (currentPlaybackTime === newTime) {
			return;
		}

		const satisfyResult =
			await this.videoFrameIterator?.tryToSatisfySeek(newTime);

		if (satisfyResult?.type === 'satisfied') {
			this.drawFrame(satisfyResult.frame);
			return;
		}

		if (this.currentSeekNonce !== nonce) {
			return;
		}

		this.mediaEnded = false;
		this.audioSyncAnchor = this.sharedAudioContext.currentTime - newTime;

		this.startAudioIterator(newTime);
		this.startVideoIterator(newTime, nonce);
	}

	public async play(): Promise<void> {
		if (!this.isReady()) return;

		if (!this.playing) {
			if (this.sharedAudioContext.state === 'suspended') {
				await this.sharedAudioContext.resume();
			}

			this.playing = true;
		}
	}

	public pause(): void {
		this.playing = false;
		this.audioBufferIterator?.cleanupAudioQueue();
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
				this.debugStats,
				this.sharedAudioContext.state,
				this.sharedAudioContext.currentTime,
			);
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

		const nextFrame = await iterator.getNextOrNullIfNotAvailable();
		if (iterator.isDestroyed()) {
			return;
		}

		if (nextFrame.type === 'got-frame-or-end') {
			if (nextFrame.frame) {
				this.drawFrame(nextFrame.frame);
			} else {
				// TODO: Media ended
			}
		} else {
			if (nonce !== this.currentSeekNonce) {
				return;
			}

			// Frame is not immediately available, so we are buffering
			// until it is
			const delayHandle = this.bufferState?.delayPlayback();
			const frame = (await nextFrame.waitPromise()) ?? null;
			delayHandle?.unblock();
			if (nonce !== this.currentSeekNonce) {
				return;
			}

			if (this.videoFrameIterator.isDestroyed()) {
				return;
			}

			if (frame) {
				this.audioSyncAnchor =
					this.sharedAudioContext.currentTime - frame.timestamp;

				this.drawFrame(frame);
			}
		}
	};

	private runAudioIterator = async (
		startFromSecond: number,
		audioIterator: AudioIterator,
	): Promise<void> => {
		if (!this.hasAudio()) return;

		try {
			let isFirstBuffer = true;

			while (true) {
				if (audioIterator.isDestroyed()) {
					return;
				}

				const result = await audioIterator.getNext();

				// media has ended
				if (result.done || !result.value) {
					this.mediaEnded = true;
					break;
				}

				const {buffer, timestamp} = result.value;

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
