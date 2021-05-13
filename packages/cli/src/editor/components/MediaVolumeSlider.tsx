import {PlayerInternals} from '@remotion/player';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Internals, interpolate} from 'remotion';
import {VolumeOffIcon, VolumeOnIcon} from '../icons/media-volume';
import {ControlDiv} from './ControlButton';

const BAR_HEIGHT = 5;
const KNOB_SIZE = 12;
const VERTICAL_PADDING = 4;

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
	width: 100,
	borderRadius: BAR_HEIGHT / 2,
};

const getVolumeFromX = (clientX: number, width: number) => {
	const pos = clientX;
	const volume = interpolate(pos, [0, width], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	return volume;
};

const xSpacer: React.CSSProperties = {
	width: 5,
};

export const MediaVolumeSlider: React.FC = () => {
	const [mediaMuted, setMediaMuted] = Internals.useMediaMutedState();
	const [mediaVolume, setMediaVolume] = Internals.useMediaVolumeState();
	const [dragging, setDragging] = useState<boolean>(false);
	const currentRef = useRef<HTMLDivElement>(null);
	const iconDivRef = useRef<HTMLDivElement>(null);
	const parentDivRef = useRef<HTMLDivElement>(null);
	const size = PlayerInternals.useElementSize(currentRef);
	const hover = PlayerInternals.useHoverState(parentDivRef);

	const onClick = useCallback(() => {
		setMediaMuted(!mediaMuted);
		setMediaVolume(Number(mediaMuted));
	}, [setMediaMuted, mediaMuted, setMediaVolume]);

	const onPointerDown = useCallback(
		(e: React.PointerEvent<HTMLDivElement>) => {
			if (!size) {
				throw new Error('Player has no size');
			}

			console.log(e.clientX - size.left, size.width, 'leftsize');

			const _volume = getVolumeFromX(e.clientX - size.left, size.width);
			setMediaVolume(_volume);
			if (_volume <= 0) {
				setMediaMuted(true);
			}

			if (_volume > 0) {
				setMediaMuted(false);
			}

			setDragging(true);
		},
		[setMediaMuted, setMediaVolume, size]
	);

	const onPointerMove = useCallback(
		(e: PointerEvent) => {
			if (!size) {
				throw new Error('Player has no size');
			}

			if (!dragging) return;

			const _volume = getVolumeFromX(e.clientX - size.left, size.width);
			setMediaVolume(_volume);
			if (_volume <= 0) {
				setMediaMuted(true);
			}

			if (_volume > 0) {
				setMediaMuted(false);
			}
		},
		[dragging, setMediaMuted, setMediaVolume, size]
	);

	const onPointerUp = useCallback(() => {
		setDragging(false);
	}, []);

	useEffect(() => {
		if (!dragging) {
			return;
		}

		currentRef?.current?.addEventListener('pointermove', onPointerMove);
		currentRef?.current?.addEventListener('pointerup', onPointerUp);
		return () => {
			currentRef?.current?.removeEventListener('pointermove', onPointerMove);
			currentRef?.current?.removeEventListener('pointerup', onPointerUp);
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
			left: Math.max(
				-KNOB_SIZE / 2,
				mediaVolume * (size?.width ?? 0) - KNOB_SIZE / 2
			),
			boxShadow: '0 0 2px black',
			opacity: Number(hover),
		};
	}, [hover, mediaVolume, size?.width]);

	const fillStyle: React.CSSProperties = useMemo(() => {
		return {
			height: BAR_HEIGHT,
			backgroundColor: 'rgba(255, 255, 255, 1)',
			width: (mediaVolume / 1) * 100 + '%',
			borderRadius: BAR_HEIGHT / 2,
		};
	}, [mediaVolume]);

	return (
		<ControlDiv ref={parentDivRef}>
			<div ref={iconDivRef} onClick={onClick}>
				{mediaMuted ? <VolumeOffIcon /> : <VolumeOnIcon />}
			</div>
			<div style={xSpacer} />

			<div
				ref={currentRef}
				onPointerDown={onPointerDown}
				style={containerStyle}
			>
				{hover ? (
					<>
						<div style={{...barBackground}}>
							<div style={fillStyle} />
						</div>
						<div style={knobStyle} />
					</>
				) : (
					<div style={{width: 100}} />
				)}
			</div>
		</ControlDiv>
	);
};
