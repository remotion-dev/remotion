import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Internals, interpolate} from 'remotion';
import {ICON_SIZE, VolumeOffIcon, VolumeOnIcon} from './icons';
import {useHoverState} from './use-hover-state';
import {useElementSize} from './utils/use-element-size';

const BAR_HEIGHT = 5;
const KNOB_SIZE = 12;
const VERTICAL_PADDING = 4;
const VOLUME_SLIDER_WIDTH = 100;

const parentDivStyle: React.CSSProperties = {
	display: 'inline-flex',
	background: 'none',
	border: 'none',
	padding: '6px',
	justifyContent: 'center',
	alignItems: 'center',
};

const containerStyle: React.CSSProperties = {
	userSelect: 'none',
	paddingTop: VERTICAL_PADDING,
	paddingBottom: VERTICAL_PADDING,
	boxSizing: 'border-box',
	cursor: 'pointer',
	position: 'relative',
};

const barBackground: React.CSSProperties = {
	height: BAR_HEIGHT,
	backgroundColor: 'rgba(255, 255, 255, 0.5)',
	width: VOLUME_SLIDER_WIDTH,
	borderRadius: BAR_HEIGHT / 2,
};

const getVolumeFromX = (clientX: number, width: number) => {
	const pos = clientX;
	const volume =
		width === 0
			? 0
			: interpolate(pos, [0, width], [0, 1], {
					extrapolateLeft: 'clamp',
					extrapolateRight: 'clamp',
			  });
	return volume;
};

const xSpacer: React.CSSProperties = {
	width: 5,
};

const volumeContainer: React.CSSProperties = {
	display: 'inline',
	width: ICON_SIZE,
	height: ICON_SIZE,
	cursor: 'pointer',
};

export const MediaVolumeSlider: React.FC = () => {
	const [mediaMuted, setMediaMuted] = Internals.useMediaMutedState();
	const [mediaVolume, setMediaVolume] = Internals.useMediaVolumeState();
	const [dragging, setDragging] = useState<boolean>(false);
	const currentRef = useRef<HTMLDivElement>(null);
	const iconDivRef = useRef<HTMLDivElement>(null);
	const parentDivRef = useRef<HTMLDivElement>(null);
	const size = useElementSize(currentRef);
	const hover = useHoverState(parentDivRef);

	const hoverOrDragging = hover || dragging;

	const onClick = useCallback(() => {
		setMediaMuted((mute) => !mute);
	}, [setMediaMuted]);

	const onPointerDown = useCallback(
		(e: React.PointerEvent<HTMLDivElement>) => {
			if (!size) {
				throw new Error('Player has no size');
			}

			const _volume = getVolumeFromX(
				e.clientX - size.left - KNOB_SIZE / 2,
				size.width - KNOB_SIZE
			);
			setMediaVolume(_volume);

			setDragging(true);
		},
		[setMediaVolume, size]
	);

	const onPointerMove = useCallback(
		(e: PointerEvent) => {
			if (!size) {
				throw new Error('Player has no size');
			}

			if (!dragging) return;

			const _volume = getVolumeFromX(
				e.clientX - size.left - KNOB_SIZE / 2,
				size.width - KNOB_SIZE
			);
			setMediaVolume(_volume);
		},
		[dragging, setMediaVolume, size]
	);

	const onPointerUp = useCallback(() => {
		setDragging(false);
	}, []);

	useEffect(() => {
		if (!dragging) {
			return;
		}

		window.addEventListener('pointermove', onPointerMove);
		window.addEventListener('pointerup', onPointerUp);
		return () => {
			window.removeEventListener('pointermove', onPointerMove);
			window.removeEventListener('pointerup', onPointerUp);
		};
	}, [currentRef, dragging, onPointerMove, onPointerUp, onPointerDown]);

	const knobStyle: React.CSSProperties = useMemo(() => {
		return {
			height: KNOB_SIZE,
			width: KNOB_SIZE,
			borderRadius: KNOB_SIZE / 2,
			position: 'absolute',
			top: VERTICAL_PADDING - KNOB_SIZE / 2 + 5 / 2,
			backgroundColor: 'white',
			left: Math.max(0, mediaVolume * ((size?.width ?? 0) - KNOB_SIZE)),
			boxShadow: '0 0 2px black',
			opacity: Number(hoverOrDragging),
		};
	}, [hoverOrDragging, mediaVolume, size?.width]);

	const fillStyle: React.CSSProperties = useMemo(() => {
		return {
			height: BAR_HEIGHT,
			backgroundColor: 'rgba(255, 255, 255, 1)',
			width: (mediaVolume / 1) * 100 + '%',
			borderRadius: BAR_HEIGHT / 2,
		};
	}, [mediaVolume]);

	const isMutedOrZero = mediaMuted || mediaVolume === 0;

	return (
		<div ref={parentDivRef} style={parentDivStyle}>
			<div
				ref={iconDivRef}
				role="button"
				aria-label={isMutedOrZero ? 'Unmute sound' : 'Mute sound'}
				title={isMutedOrZero ? 'Unmute sound' : 'Mute sound'}
				onClick={onClick}
				style={volumeContainer}
			>
				{isMutedOrZero ? <VolumeOffIcon /> : <VolumeOnIcon />}
			</div>
			<div style={xSpacer} />

			<div
				ref={currentRef}
				onPointerDown={onPointerDown}
				style={containerStyle}
			>
				{hoverOrDragging ? (
					<>
						<div style={barBackground}>
							<div style={fillStyle} />
						</div>
						<div style={knobStyle} />
					</>
				) : null}
			</div>
		</div>
	);
};
