import React, {useCallback, useMemo, useRef, useState} from 'react';
import {Internals} from 'remotion';
import {ICON_SIZE, VolumeOffIcon, VolumeOnIcon} from './icons.js';
import type {RenderVolumeSlider} from './render-volume-slider.js';
import {renderDefaultVolumeSlider} from './render-volume-slider.js';
import {useHoverState} from './use-hover-state.js';

export const VOLUME_SLIDER_WIDTH = 100;

export type RenderMuteButton = (props: {
	muted: boolean;
	volume: number;
}) => React.ReactNode;

export const MediaVolumeSlider: React.FC<{
	readonly displayVerticalVolumeSlider: boolean;
	readonly renderMuteButton: RenderMuteButton | null;
	readonly renderVolumeSlider: RenderVolumeSlider | null;
}> = ({displayVerticalVolumeSlider, renderMuteButton, renderVolumeSlider}) => {
	const [mediaMuted, setMediaMuted] = Internals.useMediaMutedState();
	const [mediaVolume, setMediaVolume] = Internals.useMediaVolumeState();
	const [focused, setFocused] = useState<boolean>(false);
	const parentDivRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const hover = useHoverState(parentDivRef, false);

	const onBlur = useCallback(() => {
		setTimeout(() => {
			// We need a small delay to check which element was focused next,
			// and if it wasn't the volume slider, we hide it
			if (inputRef.current && document.activeElement !== inputRef.current) {
				setFocused(false);
			}
		}, 10);
	}, []);

	const isVolume0 = mediaVolume === 0;
	const onClick = useCallback(() => {
		if (isVolume0) {
			setMediaVolume(1);
			setMediaMuted(false);
			return;
		}

		setMediaMuted((mute) => !mute);
	}, [isVolume0, setMediaMuted, setMediaVolume]);

	const parentDivStyle: React.CSSProperties = useMemo(() => {
		return {
			display: 'inline-flex',
			background: 'none',
			border: 'none',
			justifyContent: 'center',
			alignItems: 'center',
			touchAction: 'none',
			...(displayVerticalVolumeSlider && {position: 'relative' as const}),
		};
	}, [displayVerticalVolumeSlider]);

	const volumeContainer: React.CSSProperties = useMemo(() => {
		return {
			display: 'inline',
			width: ICON_SIZE,
			height: ICON_SIZE,
			cursor: 'pointer',
			appearance: 'none',
			background: 'none',
			border: 'none',
			padding: 0,
		};
	}, []);

	const renderDefaultMuteButton: RenderMuteButton = useCallback(
		({muted, volume}) => {
			const isMutedOrZero = muted || volume === 0;
			return (
				<button
					aria-label={isMutedOrZero ? 'Unmute sound' : 'Mute sound'}
					title={isMutedOrZero ? 'Unmute sound' : 'Mute sound'}
					onClick={onClick}
					onBlur={onBlur}
					onFocus={() => setFocused(true)}
					style={volumeContainer}
					type="button"
				>
					{isMutedOrZero ? <VolumeOffIcon /> : <VolumeOnIcon />}
				</button>
			);
		},
		[onBlur, onClick, volumeContainer],
	);

	const muteButton = useMemo(() => {
		return renderMuteButton
			? renderMuteButton({muted: mediaMuted, volume: mediaVolume})
			: renderDefaultMuteButton({muted: mediaMuted, volume: mediaVolume});
	}, [mediaMuted, mediaVolume, renderDefaultMuteButton, renderMuteButton]);

	const volumeSlider = useMemo(() => {
		return (focused || hover) && !mediaMuted && !Internals.isIosSafari()
			? (renderVolumeSlider ?? renderDefaultVolumeSlider)({
					isVertical: displayVerticalVolumeSlider,
					volume: mediaVolume,
					onBlur: () => setFocused(false),
					inputRef,
					setVolume: setMediaVolume,
				})
			: null;
	}, [
		displayVerticalVolumeSlider,
		focused,
		hover,
		mediaMuted,
		mediaVolume,
		renderVolumeSlider,
		setMediaVolume,
	]);

	return (
		<div ref={parentDivRef} style={parentDivStyle}>
			{muteButton}
			{volumeSlider}
		</div>
	);
};
