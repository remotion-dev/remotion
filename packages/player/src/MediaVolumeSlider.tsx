import React, {
	useCallback,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import {Internals} from 'remotion';
import {ICON_SIZE, VolumeOffIcon, VolumeOnIcon} from './icons';
import {VOLUME_SLIDER_INPUT_CSS_CLASSNAME} from './player-css-classname';
import {useHoverState} from './use-hover-state';

const BAR_HEIGHT = 5;
const KNOB_SIZE = 12;
export const VOLUME_SLIDER_WIDTH = 100;

const scope = `.${VOLUME_SLIDER_INPUT_CSS_CLASSNAME}`;
const sliderStyle = `
	${scope}::-webkit-slider-thumb {
		-webkit-appearance: none;
		background-color: white;
		border-radius: ${KNOB_SIZE / 2}px;
		box-shadow: 0 0 2px black;
		height: ${KNOB_SIZE}px;
		width: ${KNOB_SIZE}px;
	}

	${scope}::-moz-range-thumb {
		-webkit-appearance: none;
		background-color: white;
		border-radius: ${KNOB_SIZE / 2}px;
		box-shadow: 0 0 2px black;
		height: ${KNOB_SIZE}px;
		width: ${KNOB_SIZE}px;
	}
`;

const sliderStyleVertical = `
${sliderStyle}
${scope} {
	position: absolute;
  bottom: ${ICON_SIZE / 2 + 4}px;
	height: ${VOLUME_SLIDER_WIDTH}px;
	width: ${BAR_HEIGHT}px;
}
`;

export const MediaVolumeSlider: React.FC<{
	displayVerticalVolumeSlider: Boolean;
}> = ({displayVerticalVolumeSlider}) => {
	const [mediaMuted, setMediaMuted] = Internals.useMediaMutedState();
	const [mediaVolume, setMediaVolume] = Internals.useMediaVolumeState();
	const [focused, setFocused] = useState<boolean>(false);
	const parentDivRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const hover = useHoverState(parentDivRef);
	const isMutedOrZero = mediaMuted || mediaVolume === 0;

	useLayoutEffect(() => {
		if (displayVerticalVolumeSlider) {
			Internals.CSSUtils.removeCSS(sliderStyle);
			Internals.CSSUtils.injectCSS(sliderStyleVertical);
		} else {
			Internals.CSSUtils.removeCSS(sliderStyleVertical);
			Internals.CSSUtils.injectCSS(sliderStyle);
		}
	}, [displayVerticalVolumeSlider]);

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
			padding: '6px',
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
		};
		if (displayVerticalVolumeSlider) {
			return {
				...commonStyle,
				width: BAR_HEIGHT,
				height: VOLUME_SLIDER_WIDTH,
			};
		}

		return {
			...commonStyle,
			WebkitAppearance: 'slider-vertical',
			height: BAR_HEIGHT,
			marginLeft: 5,
			width: VOLUME_SLIDER_WIDTH,
		};
	}, [displayVerticalVolumeSlider]);

	return (
		<div ref={parentDivRef} style={parentDivStyle}>
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
					className={VOLUME_SLIDER_INPUT_CSS_CLASSNAME}
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
