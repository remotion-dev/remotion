import {useCallback, useMemo} from 'react';
import {Internals} from 'remotion';
import {VOLUME_SLIDER_WIDTH} from './MediaVolumeSlider';
import {ICON_SIZE} from './icons';

type RenderVolumeSliderProps = {
	volume: number;
	isNarrow: boolean;
	className: string;
	onBlur: () => void;
	inputRef: React.RefObject<HTMLInputElement>;
};

export type RenderVolumeSlider = (
	props: RenderVolumeSliderProps,
) => React.ReactNode;

const BAR_HEIGHT = 5;

const DefaultVolumeSlider: React.FC<RenderVolumeSliderProps> = ({
	volume,
	isNarrow,
	className,
	onBlur,
	inputRef,
}) => {
	const [, setMediaVolume] = Internals.useMediaVolumeState();

	const sliderContainer = useMemo((): React.CSSProperties => {
		const paddingLeft = 5;
		const common: React.CSSProperties = {
			paddingLeft,
			height: ICON_SIZE,
			width: VOLUME_SLIDER_WIDTH,
		};

		if (isNarrow) {
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
	}, [isNarrow]);

	const onVolumeChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			setMediaVolume(parseFloat(e.target.value));
		},
		[setMediaVolume],
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
		if (isNarrow) {
			return {
				...commonStyle,
				bottom: ICON_SIZE + VOLUME_SLIDER_WIDTH / 2,
			};
		}

		return commonStyle;
	}, [isNarrow, volume]);

	return (
		<div style={sliderContainer}>
			<input
				ref={inputRef}
				aria-label="Change volume"
				className={className}
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
