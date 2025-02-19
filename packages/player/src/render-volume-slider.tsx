import React, {useCallback, useMemo, useState} from 'react';
import {random} from 'remotion';
import {VOLUME_SLIDER_WIDTH} from './MediaVolumeSlider';
import {ICON_SIZE} from './icons';

const KNOB_SIZE = 12;

type RenderVolumeSliderProps = {
	readonly volume: number;
	readonly isVertical: boolean;
	readonly onBlur: () => void;
	readonly inputRef: React.RefObject<HTMLInputElement | null>;
	readonly setVolume: (u: number) => void;
};

export type RenderVolumeSlider = (
	props: RenderVolumeSliderProps,
) => React.ReactNode;

const BAR_HEIGHT = 5;

const DefaultVolumeSlider: React.FC<RenderVolumeSliderProps> = ({
	volume,
	isVertical,
	onBlur,
	inputRef,
	setVolume,
}) => {
	const sliderContainer = useMemo((): React.CSSProperties => {
		const paddingLeft = 5;
		const common: React.CSSProperties = {
			paddingLeft,
			height: ICON_SIZE,
			width: VOLUME_SLIDER_WIDTH,
			display: 'inline-flex',
			alignItems: 'center',
		};

		if (isVertical) {
			return {
				...common,
				position: 'absolute',
				transform: `rotate(-90deg) translateX(${
					VOLUME_SLIDER_WIDTH / 2 + ICON_SIZE / 2
				}px)`,
			};
		}

		return {
			...common,
		};
	}, [isVertical]);

	// Need to import it from React to fix React 17 ESM support.
	const randomId =
		// eslint-disable-next-line react-hooks/rules-of-hooks
		typeof React.useId === 'undefined' ? 'volume-slider' : React.useId();

	const [randomClass] = useState(() =>
		`__remotion-volume-slider-${random(randomId)}`.replace('.', ''),
	);

	const onVolumeChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			setVolume(parseFloat(e.target.value));
		},
		[setVolume],
	);

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
				white ${volume * 100}%, rgba(255, 255, 255, 0) ${volume * 100}%
			)`,
		};
		if (isVertical) {
			return {
				...commonStyle,
				bottom: ICON_SIZE + VOLUME_SLIDER_WIDTH / 2,
			};
		}

		return commonStyle;
	}, [isVertical, volume]);

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
		<div style={sliderContainer}>
			<style
				// eslint-disable-next-line react/no-danger
				dangerouslySetInnerHTML={{
					__html: sliderStyle,
				}}
			/>
			<input
				ref={inputRef}
				aria-label="Change volume"
				className={randomClass}
				max={1}
				min={0}
				onBlur={onBlur}
				onChange={onVolumeChange}
				step={0.01}
				type="range"
				value={volume}
				style={inputStyle}
			/>
		</div>
	);
};

export const renderDefaultVolumeSlider: RenderVolumeSlider = (
	props: RenderVolumeSliderProps,
) => {
	return <DefaultVolumeSlider {...props} />;
};
