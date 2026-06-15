import {Button} from '@remotion/design';
import React, {useCallback, useMemo, useRef, useState} from 'react';
import {
	getSfxNameFromUrl,
	makeSfxDragData,
	setSfxDragData,
} from '../../components/sfx-demos/sfx-drag-data';
import {
	SFX_WAVEFORM_SAMPLE_COUNT,
	sfxWaveforms,
} from '../../components/sfx-demos/sfx-waveforms';
import {MusicIcon} from '../../src/components/icons/music';
import {Waveform as WaveformIcon} from '../../src/components/icons/waveform';

const controlsContainer: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'flex-start',
	gap: 12,
	width: '100%',
};

const controls: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'row',
	alignItems: 'center',
	gap: 16,
	flexWrap: 'wrap',
};

const dragGroup: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'flex-start',
	gap: 6,
	minWidth: 0,
};

const compactDragGroup: React.CSSProperties = {
	marginTop: 10,
	gap: 4,
};

const dragLabel: React.CSSProperties = {
	color: 'var(--ifm-color-emphasis-700)',
	fontSize: 12,
	fontWeight: 600,
	lineHeight: 1,
};

const dragChip: React.CSSProperties = {
	alignItems: 'center',
	backgroundColor: 'var(--ifm-color-emphasis-100)',
	border: '1px solid var(--ifm-color-emphasis-300)',
	borderRadius: 8,
	boxShadow: '0 1px 1px rgba(0, 0, 0, 0.04)',
	color: 'var(--ifm-font-color-base)',
	cursor: 'grab',
	display: 'flex',
	flexDirection: 'row',
	gap: 8,
	maxWidth: '100%',
	padding: '8px 10px',
	userSelect: 'none',
};

const compactDragChip: React.CSSProperties = {
	padding: '6px 8px',
};

const dragIconContainer: React.CSSProperties = {
	alignItems: 'center',
	backgroundColor: 'var(--ifm-background-color)',
	border: '1px solid var(--ifm-color-emphasis-200)',
	borderRadius: 6,
	display: 'flex',
	flex: '0 0 auto',
	height: 24,
	justifyContent: 'center',
	width: 24,
};

const compactDragIconContainer: React.CSSProperties = {
	height: 20,
	width: 20,
};

const dragIcon: React.CSSProperties = {
	height: 12,
	width: 12,
};

const fileNameLabel: React.CSSProperties = {
	fontFamily: 'var(--ifm-font-family-monospace)',
	fontSize: 13,
	lineHeight: 1.2,
	overflow: 'hidden',
	textOverflow: 'ellipsis',
	whiteSpace: 'nowrap',
};

const waveformGroup: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'column',
	gap: 6,
	width: '100%',
};

const waveformDragTarget: React.CSSProperties = {
	backgroundColor: 'var(--ifm-color-emphasis-100)',
	border: '1px solid var(--ifm-color-emphasis-300)',
	borderRadius: 8,
	boxSizing: 'border-box',
	color: 'var(--ifm-color-primary)',
	cursor: 'grab',
	display: 'flex',
	flexDirection: 'column',
	gap: 10,
	padding: 12,
	userSelect: 'none',
	width: '100%',
};

const waveformHeader: React.CSSProperties = {
	alignItems: 'center',
	color: 'var(--ifm-font-color-base)',
	display: 'flex',
	flexDirection: 'row',
	gap: 8,
	minWidth: 0,
};

const waveformSvg: React.CSSProperties = {
	display: 'block',
	height: 70,
	width: '100%',
};

const waveformFallback: React.CSSProperties = {
	alignItems: 'center',
	color: 'var(--ifm-color-emphasis-700)',
	display: 'flex',
	fontSize: 13,
	height: 70,
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

const makeWaveformPath = (samples: Uint8Array): string => {
	if (samples.length === 0) {
		return '';
	}

	const top: string[] = [];
	const bottom: string[] = [];
	const maxAmplitude = 44;
	const center = 50;
	for (let index = 0; index < samples.length; index++) {
		const scaled = Math.sqrt(samples[index] / 255) * maxAmplitude;
		const amplitude = Math.max(0.8, scaled);
		top.push(`${index} ${center - amplitude}`);
		bottom.push(`${index} ${center + amplitude}`);
	}

	return `M ${top.join(' L ')} L ${bottom.reverse().join(' L ')} Z`;
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

export const SfxDragChip: React.FC<{
	readonly src: string;
	readonly name?: string;
	readonly compact?: boolean;
}> = ({src, name, compact = false}) => {
	const sfxName = name ?? getSfxNameFromUrl(src);
	const fileName = getSfxFileNameFromUrl(src);

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

	const onClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
	}, []);

	return (
		<div style={{...dragGroup, ...(compact ? compactDragGroup : {})}}>
			<span style={dragLabel}>Drag into Studio</span>
			<div
				draggable
				onClick={onClick}
				onDragStart={onDragStart}
				style={{...dragChip, ...(compact ? compactDragChip : {})}}
				title={`Drag ${fileName} into Remotion Studio`}
			>
				<span
					style={{
						...dragIconContainer,
						...(compact ? compactDragIconContainer : {}),
					}}
				>
					<MusicIcon style={dragIcon} />
				</span>
				<span style={fileNameLabel}>{fileName}</span>
			</div>
		</div>
	);
};

const SfxWaveformDragTarget: React.FC<{
	readonly src: string;
	readonly name?: string;
}> = ({src, name}) => {
	const sfxName = name ?? getSfxNameFromUrl(src);
	const fileName = getSfxFileNameFromUrl(src);
	const samples = useMemo(() => getWaveformSamples(src), [src]);
	const path = useMemo(
		() => (samples ? makeWaveformPath(samples) : null),
		[samples],
	);
	const viewBox = `0 0 ${SFX_WAVEFORM_SAMPLE_COUNT - 1} 100`;

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

	const onClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
	}, []);

	return (
		<div style={waveformGroup}>
			<span style={dragLabel}>Drag into Studio</span>
			<div
				aria-label={`Drag ${fileName} into Remotion Studio`}
				draggable
				onClick={onClick}
				onDragStart={onDragStart}
				style={waveformDragTarget}
				title={`Drag ${fileName} into Remotion Studio`}
			>
				<div style={waveformHeader}>
					<span style={dragIconContainer}>
						<WaveformIcon style={dragIcon} />
					</span>
					<span style={fileNameLabel}>{fileName}</span>
				</div>
				{path ? (
					<svg
						aria-hidden="true"
						focusable="false"
						preserveAspectRatio="none"
						style={waveformSvg}
						viewBox={viewBox}
					>
						<line
							x1="0"
							x2={SFX_WAVEFORM_SAMPLE_COUNT - 1}
							y1="50"
							y2="50"
							stroke="currentColor"
							strokeOpacity="0.16"
						/>
						<path d={path} fill="currentColor" opacity="0.88" />
					</svg>
				) : (
					<div style={waveformFallback}>Waveform unavailable</div>
				)}
			</div>
		</div>
	);
};

export const PlayButton: React.FC<{
	readonly src: string;
	readonly size?: number;
	readonly depth?: number;
	readonly showDragChip?: boolean;
}> = ({src, size = 48, depth, showDragChip = true}) => {
	const [playing, setPlaying] = useState(false);
	const audioRef = useRef<HTMLAudioElement | null>(null);

	const iconSize = Math.round(size * 0.5);

	const toggle = useCallback(
		(e: React.MouseEvent) => {
			e.preventDefault();
			e.stopPropagation();
			if (playing) {
				audioRef.current?.pause();
				if (audioRef.current) {
					audioRef.current.currentTime = 0;
				}
				setPlaying(false);
			} else {
				const audio = new Audio(src);
				audioRef.current = audio;
				audio.play();
				audio.addEventListener('ended', () => {
					setPlaying(false);
				});
				setPlaying(true);
			}
		},
		[playing, src],
	);

	const button = (
		<Button
			className={`rounded-full p-0`}
			style={{width: size, height: size, flex: '0 0 auto'}}
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

	if (!showDragChip) {
		return <div style={controls}>{button}</div>;
	}

	return (
		<div style={controlsContainer}>
			<div style={controls}>{button}</div>
			<SfxWaveformDragTarget src={src} />
		</div>
	);
};
