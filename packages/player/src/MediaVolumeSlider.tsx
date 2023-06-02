import React, {useCallback, useMemo, useRef, useState} from 'react';
import {Internals, random} from 'remotion';
import {ICON_SIZE, VolumeOffIcon, VolumeOnIcon} from './icons.js';
import {useHoverState} from './use-hover-state.js';

const BAR_HEIGHT = 5;
const KNOB_SIZE = 12;
export const VOLUME_SLIDER_WIDTH = 100;

export const MediaVolumeSlider: React.FC<{
	displayVerticalVolumeSlider: Boolean;
}> = ({displayVerticalVolumeSlider}) => {
	const [mediaMuted, setMediaMuted] = Internals.useMediaMutedState();
	const [mediaVolume, setMediaVolume] = Internals.useMediaVolumeState();
	const [focused, setFocused] = useState<boolean>(false);
	const parentDivRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const hover = useHoverState(parentDivRef);
	// Need to import it from React to fix React 17 ESM support.
	const randomId =
		// eslint-disable-next-line react-hooks/rules-of-hooks
		typeof React.useId === 'undefined' ? 'volume-slider' : React.useId();
	const [randomClass] = useState(() =>
		`__remotion-volume-slider-${random(randomId)}`.replace('.', '')
	);
	const isMutedOrZero = mediaMuted || mediaVolume === 0;

	const onVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setMediaVolume(parseFloat(e.target.value));
	};

	const onBlur = () => {
		setTimeout(() => {
			// We need a small delay to check which element was focused next,
			// and if it wasn't the volume slider, we hide it
			if (document.activeElement !== inputRef.current) {
				setFocused(false);
			}
		}, 10);
	};

	const onClick = useCallback(() => {
		if (mediaVolume === 0) {
			setMediaVolume(1);
			setMediaMuted(false);
			return;
		}

		setMediaMuted((mute) => !mute);
	}, [mediaVolume, setMediaMuted, setMediaVolume]);

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

	const inputStyle = useMemo((): React.CSSProperties => {
		const commonStyle: React.CSSProperties = {
			WebkitAppearance: 'none',
			backgroundColor: 'rgba(255, 255, 255, 0.5)',
			borderRadius: BAR_HEIGHT / 2,
			cursor: 'pointer',
			height: BAR_HEIGHT,
			width: VOLUME_SLIDER_WIDTH,
			backgroundImage: `linear-gradient(
				to right,
				white ${mediaVolume * 100}%, rgba(255, 255, 255, 0) ${mediaVolume * 100}%
			)`,
		};
		if (displayVerticalVolumeSlider) {
			return {
				...commonStyle,
				transform: `rotate(-90deg)`,
				position: 'absolute',
				bottom: ICON_SIZE + VOLUME_SLIDER_WIDTH / 2 + 5,
			};
		}

		return {
			...commonStyle,
			marginLeft: 5,
		};
	}, [displayVerticalVolumeSlider, mediaVolume]);

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

	return (
		<div ref={parentDivRef} style={parentDivStyle}>
			<style
				// eslint-disable-next-line react/no-danger
				dangerouslySetInnerHTML={{
					__html: sliderStyle,
				}}
			/>
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
			{(focused || hover) && !mediaMuted ? (
				<input
					ref={inputRef}
					aria-label="Change volume"
					className={randomClass}
					max={1}
					min={0}
					onBlur={() => setFocused(false)}
					onChange={onVolumeChange}
					step={0.01}
					type="range"
					value={mediaVolume}
					style={inputStyle}
				/>
			) : null}
		</div>
	);
};
