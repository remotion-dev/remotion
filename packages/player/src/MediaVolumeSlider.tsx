import React, {useCallback, useMemo, useRef, useState} from 'react';
import {Internals, random} from 'remotion';
import {ICON_SIZE, VolumeOffIcon, VolumeOnIcon} from './icons.js';
import type {RenderVolumeSlider} from './render-volume-slider.js';
import {renderDefaultVolumeSlider} from './render-volume-slider.js';
import {useHoverState} from './use-hover-state.js';

const KNOB_SIZE = 12;
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

	// Need to import it from React to fix React 17 ESM support.
	const randomId =
		// eslint-disable-next-line react-hooks/rules-of-hooks
		typeof React.useId === 'undefined' ? 'volume-slider' : React.useId();

	const [randomClass] = useState(() =>
		`__remotion-volume-slider-${random(randomId)}`.replace('.', ''),
	);

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

	const sliderStyle = `
	.${randomClass}::-webkit-slider-thumb {
		-webkit-appearance: none;
		background-color: white;
		border-radius: ${KNOB_SIZE / 2}px;
		box-shadow: 0 0 2px black;
		height: ${KNOB_SIZE}px;
		width: ${KNOB_SIZE}px;
	}

	.${randomClass}::-moz-range-thumb {
		-webkit-appearance: none;
		background-color: white;
		border-radius: ${KNOB_SIZE / 2}px;
		box-shadow: 0 0 2px black;
		height: ${KNOB_SIZE}px;
		width: ${KNOB_SIZE}px;
	}
`;

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

	return (
		<div ref={parentDivRef} style={parentDivStyle}>
			<style
				// eslint-disable-next-line react/no-danger
				dangerouslySetInnerHTML={{
					__html: sliderStyle,
				}}
			/>
			{renderMuteButton
				? renderMuteButton({muted: mediaMuted, volume: mediaVolume})
				: renderDefaultMuteButton({muted: mediaMuted, volume: mediaVolume})}
			{(focused || hover) && !mediaMuted && !Internals.isIosSafari()
				? (renderVolumeSlider ?? renderDefaultVolumeSlider)({
						className: randomClass,
						isNarrow: displayVerticalVolumeSlider,
						volume: mediaVolume,
						onBlur: () => setFocused(false),
						inputRef,
					})
				: null}
		</div>
	);
};
