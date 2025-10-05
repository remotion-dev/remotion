import type {WrappedAudioBuffer} from 'mediabunny';
import {ALL_FORMATS, AudioBufferSink, Input, UrlSource} from 'mediabunny';
import type {LogLevel} from 'remotion';
import {Internals} from 'remotion';
import {sleep, withTimeout} from '../video/timeout-utils';

export const SEEK_THRESHOLD = 0.05;

export class AudioPlayer {
	private src: string;
	private logLevel: LogLevel;
	private playbackRate: number;

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

	private initialized = false;
	private totalDuration = 0;

	// for remotion buffer state
	private isBuffering = false;
	private onBufferingChangeCallback?: (isBuffering: boolean) => void;

	private readonly HEALTHY_BUFER_THRESHOLD_SECONDS = 1;

	constructor({
		src,
		logLevel,
		sharedAudioContext,
	}: {
		src: string;
		logLevel: LogLevel;
		sharedAudioContext: AudioContext;
	}) {
		this.src = src;
		this.logLevel = logLevel ?? 'info';
		this.sharedAudioContext = sharedAudioContext;
		this.playbackRate = 1;
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

	public async initialize(startTime: number = 0): Promise<void> {
		try {
			const urlSource = new UrlSource(this.src);

			const input = new Input({
				source: urlSource,
				formats: ALL_FORMATS,
			});

			this.input = input;

			this.totalDuration = await input.computeDuration();
			const audioTrack = await input.getPrimaryAudioTrack();

			if (!audioTrack) {
				throw new Error(`No audio track found for ${this.src}`);
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

			const mediaTime = startTime * this.playbackRate;
			await this.startAudioIterator(mediaTime);
		} catch (error) {
			Internals.Log.error(
				{logLevel: this.logLevel, tag: '@remotion/media'},
				'[AudioPlayer] Failed to initialize',
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

		this.cleanupAudioQueue();
	}

	public async seekTo(time: number): Promise<void> {
		if (!this.isReady()) return;

		const newTime = Math.max(0, Math.min(time, this.totalDuration));
		const currentPlaybackTime = this.getPlaybackTime();
		const isSignificantSeek =
			Math.abs(newTime - currentPlaybackTime) > SEEK_THRESHOLD;

		if (isSignificantSeek) {
			this.audioSyncAnchor = this.sharedAudioContext.currentTime - newTime;

			if (this.audioSink) {
				await this.cleanAudioIteratorAndNodes();
			}

			const mediaTime = newTime * this.playbackRate;
			await this.startAudioIterator(mediaTime);
		}
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
		this.cleanupAudioQueue();
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

	public async setPlaybackRate(rate: number): Promise<void> {
		if (this.playbackRate === rate) return;

		this.playbackRate = rate;

		if (this.hasAudio() && this.playing) {
			const currentPlaybackTime = this.getPlaybackTime();
			const mediaTime = currentPlaybackTime * rate;

			await this.cleanAudioIteratorAndNodes();
			await this.startAudioIterator(mediaTime);
		}
	}

	public dispose(): void {
		this.input?.dispose();
		this.cleanAudioIteratorAndNodes();
	}

	private getPlaybackTime(): number {
		return this.sharedAudioContext.currentTime - this.audioSyncAnchor;
	}

	private getAdjustedTimestamp(mediaTimestamp: number): number {
		return mediaTimestamp / this.playbackRate;
	}

	private scheduleAudioChunk(
		buffer: AudioBuffer,
		mediaTimestamp: number,
	): void {
		const adjustedTimestamp = this.getAdjustedTimestamp(mediaTimestamp);
		const targetTime = adjustedTimestamp + this.audioSyncAnchor;
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

	public onBufferingChange(callback: (isBuffering: boolean) => void): void {
		this.onBufferingChangeCallback = callback;
	}

	private startAudioIterator = async (timeToSeek: number): Promise<void> => {
		if (!this.hasAudio()) return;

		// Clean up existing audio iterator
		await this.audioBufferIterator?.return();

		try {
			this.audioBufferIterator = this.audioSink!.buffers(timeToSeek);
			this.runAudioIterator();
		} catch (error) {
			Internals.Log.error(
				{logLevel: this.logLevel, tag: '@remotion/media'},
				'[AudioPlayer] Failed to start audio iterator',
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
				`[AudioPlayer] Resuming from buffering after ${bufferingDuration}ms - buffer recovered`,
			);
			this.setBufferingState(false);
		}
	}

	private runAudioIterator = async (): Promise<void> => {
		if (!this.hasAudio() || !this.audioBufferIterator) return;

		try {
			let totalBufferDuration = 0;
			let isFirstBuffer = true;

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

				this.maybeResumeFromBuffering(totalBufferDuration / this.playbackRate);

				if (this.playing && !this.muted) {
					if (isFirstBuffer) {
						this.audioSyncAnchor =
							this.sharedAudioContext.currentTime -
							this.getAdjustedTimestamp(timestamp);
						isFirstBuffer = false;
					}

					this.scheduleAudioChunk(buffer, timestamp);
				}

				if (
					this.getAdjustedTimestamp(timestamp) - this.getPlaybackTime() >=
					1
				) {
					await new Promise<void>((resolve) => {
						const check = () => {
							if (
								this.getAdjustedTimestamp(timestamp) - this.getPlaybackTime() <
								1
							) {
								resolve();
							} else {
								setTimeout(check, 10);
							}
						};

						check();
					});
				}
			}
		} catch (error) {
			Internals.Log.error(
				{logLevel: this.logLevel, tag: '@remotion/media'},
				'[AudioPlayer] Failed to run audio iterator',
				error,
			);
		}
	};
}
