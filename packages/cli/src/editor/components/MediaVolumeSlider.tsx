import {PlayerInternals} from '@remotion/player';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Internals, interpolate} from 'remotion';
import {VolumeOffIcon, VolumeOnIcon} from '../icons/media-volume';
import {ControlDiv} from './ControlButton';

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

			const volume = getVolumeFromX(e.clientX - size.left, size.width);
			console.log(volume, 'media volume');
			setMediaVolume(volume);
			if (volume === 0) {
				setMediaMuted(true);
			}

			setDragging(true);
		},
		[setMediaMuted, setMediaVolume, size]
	);

	const onPointerMove = useCallback(
		(e: PointerEvent) => {
			if (!dragging) return;
			console.log(e.clientX);
		},
		[dragging]
	);

	const onPointerUp = useCallback(() => {
		console.log('poiter up');
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

	return (
		<ControlDiv ref={parentDivRef}>
			<div ref={iconDivRef} onClick={onClick}>
				{mediaMuted ? <VolumeOffIcon /> : <VolumeOnIcon />}
			</div>
			<div style={xSpacer} />

			<div
				ref={currentRef}
				onPointerDown={onPointerDown}
				style={{
					width: 100,
					height: hover ? 10 : 0,
					backgroundColor: hover ? '#fff' : 'none',
				}}
			/>
		</ControlDiv>
	);
};
