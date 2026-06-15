import {Button} from '@remotion/design';
import React, {useCallback, useRef, useState} from 'react';
import {
	getSfxNameFromUrl,
	makeSfxDragData,
	setSfxDragData,
} from '../../components/sfx-demos/sfx-drag-data';
import {MusicIcon} from '../../src/components/icons/music';

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

const getSfxFileNameFromUrl = (src: string): string => {
	try {
		const url = new URL(src);
		const fileName = url.pathname.split('/').pop();
		return fileName ? decodeURIComponent(fileName) : 'sound-effect.wav';
	} catch {
		return 'sound-effect.wav';
	}
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
			setSfxDragData({
				dataTransfer: e.dataTransfer,
				dragData: makeSfxDragData({
					name: sfxName,
					url: src,
				}),
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

	return (
		<div style={controls}>
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
			{showDragChip ? <SfxDragChip src={src} /> : null}
		</div>
	);
};
