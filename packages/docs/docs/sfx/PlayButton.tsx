import {Button} from '@remotion/design';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
	getSfxNameFromUrl,
	makeSfxDragData,
	setSfxDragData,
} from '../../components/sfx-demos/sfx-drag-data';
import {sfxWaveforms} from '../../components/sfx-demos/sfx-waveforms';

const amountOfBars = 68;

const controls: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'row',
	alignItems: 'center',
	gap: 16,
	flexWrap: 'wrap',
};

const dragLabel: React.CSSProperties = {
	color: 'var(--ifm-color-emphasis-600)',
	fontSize: 12,
	fontWeight: 400,
	lineHeight: 1.35,
};

const waveformGroup: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'column',
	gap: 6,
	maxWidth: 400,
	width: '100%',
};

const waveformDragTarget: React.CSSProperties = {
	alignItems: 'center',
	backgroundColor: 'var(--ifm-color-emphasis-100)',
	border: '1px solid var(--ifm-color-emphasis-300)',
	borderRadius: 8,
	boxSizing: 'border-box',
	cursor: 'grab',
	display: 'flex',
	flexDirection: 'row',
	gap: 14,
	padding: 12,
	userSelect: 'none',
	width: '100%',
};

const waveformBars: React.CSSProperties = {
	alignItems: 'center',
	display: 'flex',
	flex: '1 1 auto',
	flexDirection: 'row',
	gap: 1,
	height: 64,
	justifyContent: 'center',
	minWidth: 0,
	overflow: 'hidden',
};

const waveformFallback: React.CSSProperties = {
	alignItems: 'center',
	color: 'var(--ifm-color-emphasis-700)',
	display: 'flex',
	fontSize: 13,
	height: 64,
};

const waveformButton: React.CSSProperties = {
	cursor: 'pointer',
	flex: '0 0 auto',
};

const getSfxFileNameFromUrl = (src: string): string => {
	try {
		const url = new URL(src);
		const fileName = url.pathname.split('/').pop();
		return fileName ? decodeURIComponent(fileName) : 'sound-effect.wav';
	} catch {
		return 'sound-effect.wav';
	}
};

const waveformCache = new Map<string, Uint8Array>();

const getBinaryFromBase64 = (base64: string): string => {
	if (typeof globalThis.atob === 'function') {
		return globalThis.atob(base64);
	}

	const buffer = (
		globalThis as typeof globalThis & {
			readonly Buffer?: {
				readonly from: (
					input: string,
					encoding: 'base64',
				) => {readonly toString: (encoding: 'binary') => string};
			};
		}
	).Buffer;

	if (!buffer) {
		throw new Error('No base64 decoder available');
	}

	return buffer.from(base64, 'base64').toString('binary');
};

const getWaveformSamples = (src: string): Uint8Array | null => {
	const cached = waveformCache.get(src);
	if (cached) {
		return cached;
	}

	const encoded = sfxWaveforms[src];
	if (!encoded) {
		return null;
	}

	const binary = getBinaryFromBase64(encoded);
	const samples = Uint8Array.from(binary, (char) => char.charCodeAt(0));
	waveformCache.set(src, samples);
	return samples;
};

const makeWaveformBars = (samples: Uint8Array): number[] => {
	if (samples.length === 0) {
		return [];
	}

	const bars: number[] = [];
	for (let bar = 0; bar < amountOfBars; bar++) {
		const start = Math.floor((bar / amountOfBars) * samples.length);
		const end = Math.max(
			start + 1,
			Math.floor(((bar + 1) / amountOfBars) * samples.length),
		);

		let peak = 0;
		for (let index = start; index < end; index++) {
			peak = Math.max(peak, samples[index] / 255);
		}

		bars.push(Math.sqrt(peak));
	}

	return bars;
};

const setDragDataForSfx = ({
	dataTransfer,
	name,
	src,
}: {
	readonly dataTransfer: DataTransfer;
	readonly name: string;
	readonly src: string;
}) => {
	setSfxDragData({
		dataTransfer,
		dragData: makeSfxDragData({
			name,
			url: src,
		}),
	});
};

const SfxAudioDragTarget: React.FC<{
	readonly src: string;
	readonly name?: string;
	readonly button: React.ReactNode;
	readonly progress: number;
	readonly playing: boolean;
}> = ({src, name, button, progress, playing}) => {
	const sfxName = name ?? getSfxNameFromUrl(src);
	const fileName = getSfxFileNameFromUrl(src);
	const samples = useMemo(() => getWaveformSamples(src), [src]);
	const bars = useMemo(
		() => (samples ? makeWaveformBars(samples) : null),
		[samples],
	);

	const onDragStart = useCallback(
		(e: React.DragEvent<HTMLDivElement>) => {
			e.stopPropagation();
			setDragDataForSfx({
				dataTransfer: e.dataTransfer,
				name: sfxName,
				src,
			});
		},
		[sfxName, src],
	);

	return (
		<div style={waveformGroup}>
			<div
				aria-label={`Drag ${fileName} into Remotion Studio`}
				draggable
				onDragStart={onDragStart}
				style={waveformDragTarget}
				title={`Drag ${fileName} into Remotion Studio`}
			>
				<div draggable={false} style={waveformButton}>
					{button}
				</div>
				{bars ? (
					<div aria-hidden="true" style={waveformBars}>
						{bars.map((bar, index) => {
							const shown = playing && progress > index / amountOfBars;
							return (
								<div
									// eslint-disable-next-line react/no-array-index-key
									key={index}
									style={{
										backgroundColor: 'var(--ifm-color-emphasis-800)',
										borderRadius: 999,
										display: 'inline-block',
										flex: '1 1 3px',
										height: Math.max(6, Math.round(bar * 56)),
										maxWidth: 4,
										minWidth: 2,
										opacity: shown ? 1 : 0.36,
										transition:
											'height 0.2s ease, opacity 0.2s ease, background-color 0.2s ease',
										width: 4,
									}}
								/>
							);
						})}
					</div>
				) : (
					<div style={waveformFallback}>Waveform unavailable</div>
				)}
			</div>
			<span style={dragLabel}>
				Drag waveform into Remotion Studio to import sound effect
			</span>
		</div>
	);
};

export const PlayButton: React.FC<{
	readonly src: string;
	readonly size?: number;
	readonly depth?: number;
	readonly showDragTarget?: boolean;
}> = ({src, size = 48, depth, showDragTarget = true}) => {
	const [playing, setPlaying] = useState(false);
	const [progress, setProgress] = useState(0);
	const audioRef = useRef<HTMLAudioElement | null>(null);
	const progressFrameRef = useRef<number | null>(null);

	const iconSize = Math.round(size * 0.5);

	const cancelProgressFrame = useCallback(() => {
		if (progressFrameRef.current === null) {
			return;
		}

		globalThis.cancelAnimationFrame(progressFrameRef.current);
		progressFrameRef.current = null;
	}, []);

	const updateProgress = useCallback(function updateProgressFrame() {
		const audio = audioRef.current;
		if (!audio) {
			return;
		}

		if (Number.isFinite(audio.duration) && audio.duration > 0) {
			setProgress(Math.min(1, Math.max(0, audio.currentTime / audio.duration)));
		}

		if (!audio.paused && !audio.ended) {
			progressFrameRef.current =
				globalThis.requestAnimationFrame(updateProgressFrame);
		}
	}, []);

	const togglePlayback = useCallback(() => {
		if (playing) {
			cancelProgressFrame();
			audioRef.current?.pause();
			if (audioRef.current) {
				audioRef.current.currentTime = 0;
			}
			setPlaying(false);
			setProgress(0);
		} else {
			cancelProgressFrame();
			audioRef.current?.pause();

			const audio = new Audio(src);
			audio.preload = 'auto';
			audioRef.current = audio;

			audio.onended = () => {
				cancelProgressFrame();
				setPlaying(false);
				setProgress(0);
			};

			audio.onerror = () => {
				cancelProgressFrame();
				setPlaying(false);
				setProgress(0);
			};

			void audio
				.play()
				.then(() => {
					setPlaying(true);
					updateProgress();
				})
				.catch(() => {
					cancelProgressFrame();
					setPlaying(false);
					setProgress(0);
				});
		}
	}, [cancelProgressFrame, playing, src, updateProgress]);

	useEffect(() => {
		return () => {
			cancelProgressFrame();
			audioRef.current?.pause();
			audioRef.current = null;
		};
	}, [cancelProgressFrame]);

	const toggle = useCallback(
		(e: React.MouseEvent) => {
			e.preventDefault();
			e.stopPropagation();
			togglePlayback();
		},
		[togglePlayback],
	);

	const button = (
		<Button
			className={`rounded-full p-0`}
			draggable={false}
			style={{width: size, height: size, flex: '0 0 auto', cursor: 'pointer'}}
			onClick={toggle}
			title={playing ? 'Stop' : 'Play'}
			depth={depth}
		>
			{playing ? (
				<svg
					width={iconSize}
					height={iconSize}
					viewBox="0 0 24 24"
					fill="currentColor"
				>
					<rect x="6" y="4" width="4" height="16" />
					<rect x="14" y="4" width="4" height="16" />
				</svg>
			) : (
				<svg
					width={iconSize}
					height={iconSize}
					viewBox="0 0 24 24"
					fill="currentColor"
				>
					<polygon points="6,4 20,12 6,20" />
				</svg>
			)}
		</Button>
	);

	if (!showDragTarget) {
		return <div style={controls}>{button}</div>;
	}

	return (
		<SfxAudioDragTarget
			button={button}
			playing={playing}
			progress={progress}
			src={src}
		/>
	);
};
