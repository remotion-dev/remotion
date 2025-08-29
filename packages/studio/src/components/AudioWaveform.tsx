import {parseMedia} from '@remotion/media-parser';
import {getPartialAudioData} from '@remotion/webcodecs';
import React, {useEffect, useRef, useState} from 'react';
import {Internals} from 'remotion';
import {LIGHT_TRANSPARENT} from '../helpers/colors';
import {
	getTimelineLayerHeight,
	TIMELINE_BORDER,
} from '../helpers/timeline-layout';
import {
	AudioWaveformBar,
	WAVEFORM_BAR_LENGTH,
	WAVEFORM_BAR_MARGIN,
} from './AudioWaveformBar';

const container: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'row',
	alignItems: 'flex-end',
	position: 'absolute',
	height: getTimelineLayerHeight('other'),
};
const errorMessage: React.CSSProperties = {
	fontSize: 13,
	paddingTop: 6,
	paddingBottom: 6,
	paddingLeft: 12,
	paddingRight: 12,
	alignSelf: 'flex-start',
	maxWidth: 450,
	opacity: 0.75,
};

const canvasStyle: React.CSSProperties = {
	position: 'absolute',
};

// Configurable chunk size strategies
const getChunkSize = (params: {
	totalDuration: number;
	numberOfBars: number;
	strategy?: 'fast' | 'balanced' | 'smooth' | 'custom';
	customSeconds?: number;
}) => {
	const {
		totalDuration,
		numberOfBars,
		strategy = 'balanced',
		customSeconds,
	} = params;

	if (strategy === 'custom' && customSeconds) {
		return Math.max(0.1, customSeconds);
	}

	const strategies: Record<'fast' | 'balanced' | 'smooth', number> = {
		// Fast: Larger chunks (2-15s), fewer network requests
		fast: Math.max(2, Math.min(15, totalDuration / 8)),

		// Balanced: Good speed + smooth progress (1-8s)
		balanced: Math.max(1, Math.min(8, totalDuration / 20)),

		// Smooth: Smaller chunks (0.5-4s), more frequent updates
		smooth: Math.max(
			0.5,
			Math.min(4, totalDuration / Math.max(numberOfBars / 10, 5)),
		),
	};

	// Handle custom strategy fallback
	if (strategy === 'custom') {
		return strategies.balanced; // fallback if no customSeconds provided
	}

	return strategies[strategy];
};

// Simple promise queue helper
const createQueue = (concurrency = 1) => {
	let running = 0;
	const tasks: Array<() => Promise<void>> = [];
	let aborted = false;

	const runNext = () => {
		if (aborted || running >= concurrency) return;
		const task = tasks.shift();
		if (!task) return;
		running++;
		task().finally(() => {
			running--;
			runNext();
		});
	};

	return {
		push: (fn: () => Promise<void>) => {
			if (aborted) return;
			tasks.push(fn);
			runNext();
		},
		abort: () => {
			aborted = true;
			tasks.length = 0;
		},
	};
};

export const AudioWaveform: React.FC<{
	readonly src: string;
	readonly visualizationWidth: number;
	readonly startFrom: number;
	readonly durationInFrames: number;
	readonly volume: string | number;
	readonly doesVolumeChange: boolean;
	readonly playbackRate: number;
	readonly chunkStrategy?: 'fast' | 'balanced' | 'smooth' | 'custom';
	readonly chunkSizeInSeconds?: number;
}> = ({
	src,
	startFrom,
	durationInFrames,
	visualizationWidth,
	volume,
	doesVolumeChange,
	playbackRate,
	chunkStrategy = 'fast',
	chunkSizeInSeconds,
}) => {
	const [amplitudes, setAmplitudes] = useState<number[]>([]);
	const [error, setError] = useState<Error | null>(null);
	const mountState = useRef({isMounted: true});
	const abortRef = useRef<AbortController | null>(null);
	const queueRef = useRef<ReturnType<typeof createQueue> | null>(null);
	const sumsRef = useRef<Float64Array | null>(null);
	const countsRef = useRef<Uint32Array | null>(null);

	const vidConf = Internals.useUnsafeVideoConfig();
	if (vidConf === null) {
		throw new Error('Expected video config');
	}

	const canvas = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const {current} = mountState;
		current.isMounted = true;
		return () => {
			current.isMounted = false;
		};
	}, []);

	useEffect(() => {
		if (!canvas.current) {
			return;
		}

		const context = canvas.current.getContext('2d');
		if (!context) {
			return;
		}

		context.clearRect(
			0,
			0,
			visualizationWidth,
			getTimelineLayerHeight('other'),
		);
		if (!doesVolumeChange || typeof volume === 'number') {
			// The volume is a number, meaning it could change on each frame-
			// User did not use the (f: number) => number syntax, so we can't draw
			// a visualization.
			return;
		}

		const volumes = volume.split(',').map((v) => Number(v));
		context.beginPath();
		context.moveTo(0, getTimelineLayerHeight('other'));
		volumes.forEach((v, index) => {
			const x = (index / (volumes.length - 1)) * visualizationWidth;
			const y =
				(1 - v) * (getTimelineLayerHeight('other') - TIMELINE_BORDER * 2) + 1;
			if (index === 0) {
				context.moveTo(x, y);
			} else {
				context.lineTo(x, y);
			}
		});
		context.strokeStyle = LIGHT_TRANSPARENT;
		context.stroke();
	}, [visualizationWidth, amplitudes, startFrom, volume, doesVolumeChange]);

	useEffect(() => {
		const N = Math.max(
			1,
			Math.floor(
				visualizationWidth / (WAVEFORM_BAR_LENGTH + WAVEFORM_BAR_MARGIN),
			),
		);
		const tStart = startFrom / vidConf.fps;
		const tEnd = tStart + (durationInFrames / vidConf.fps) * playbackRate;
		const duration = Math.max(0, tEnd - tStart);

		const sums = new Float64Array(N);
		const counts = new Uint32Array(N);
		sumsRef.current = sums;
		countsRef.current = counts;
		setAmplitudes(new Array(N).fill(0));
		setError(null);

		// Abort previous operations
		abortRef.current?.abort();
		queueRef.current?.abort();

		const ctrl = new AbortController();
		const queue = createQueue(3);
		abortRef.current = ctrl;
		queueRef.current = queue;

		// Get metadata first (fast, no decoding)
		parseMedia({
			src,
			fields: {
				durationInSeconds: true,
			},
		})
			.then(() => {
				if (ctrl.signal.aborted || !mountState.current.isMounted) return;

				// Calculate chunk size using strategy
				const chunkSize = getChunkSize({
					totalDuration: duration,
					numberOfBars: N,
					strategy: chunkStrategy,
					customSeconds: chunkSizeInSeconds,
				});

				// Update amplitudes from current sums/counts
				const updateAmplitudes = () => {
					if (!mountState.current.isMounted) return;
					setAmplitudes(
						Array.from({length: N}, (_, j) => {
							const c = counts[j];
							return c ? sums[j] / c : 0;
						}),
					);
				};

				// Process audio in chunks
				for (let c = tStart; c < tEnd; c += chunkSize) {
					const cStart = c;
					const cEnd = Math.min(tEnd, c + chunkSize);

					queue.push(async () => {
						if (ctrl.signal.aborted || !mountState.current.isMounted) return;

						try {
							const samples = await getPartialAudioData({
								src,
								fromSeconds: cStart,
								toSeconds: cEnd,
								channelIndex: 0,
								signal: ctrl.signal,
							});

							if (ctrl.signal.aborted || !mountState.current.isMounted) return;

							// Simple binning: map each sample to its bar
							const sps = samples.length / Math.max(1e-6, cEnd - cStart);
							for (let i = 0; i < samples.length; i++) {
								const t = cStart + i / sps;
								const idx = Math.floor(((t - tStart) / duration) * N);
								if (idx >= 0 && idx < N) {
									sums[idx] += Math.abs(samples[i]);
									counts[idx]++;
								}
							}

							// Update UI after each chunk
							updateAmplitudes();
						} catch (err) {
							if (!ctrl.signal.aborted && mountState.current.isMounted) {
								setError(err as Error);
							}
						}
					});
				}
			})
			.catch((err) => {
				if (!ctrl.signal.aborted && mountState.current.isMounted) {
					setError(err as Error);
				}
			});

		return () => {
			ctrl.abort();
			queue.abort();
		};
	}, [
		src,
		startFrom,
		durationInFrames,
		visualizationWidth,
		playbackRate,
		vidConf.fps,
		chunkStrategy,
		chunkSizeInSeconds,
	]);

	if (error) {
		return (
			<div style={container}>
				<div style={errorMessage}>
					No waveform available. Audio might not support CORS.
				</div>
			</div>
		);
	}

	if (amplitudes.length === 0) {
		return null;
	}

	return (
		<div style={container}>
			{amplitudes.map((amplitude, index) => {
				return (
					<AudioWaveformBar
						// eslint-disable-next-line react/no-array-index-key
						key={index}
						amplitude={amplitude * (typeof volume === 'number' ? volume : 1)}
					/>
				);
			})}

			<canvas
				ref={canvas}
				style={canvasStyle}
				width={visualizationWidth}
				height={getTimelineLayerHeight('other')}
			/>
		</div>
	);
};
