import React, {useCallback, useMemo, useRef} from 'react';
import {clamp, hsvToRgb} from '../../helpers/color-conversion';
import {
	BORDER_WHITE_2PX,
	COLOR_PICKER_ALPHA_TRANSPARENT,
	COLOR_PICKER_HANDLE_SHADOW,
} from '../../helpers/colors';
import {
	CHECKER_BACKGROUND_COLOR,
	CHECKER_BACKGROUND_IMAGE,
	CHECKER_BACKGROUND_POSITION,
	CHECKER_BACKGROUND_SIZE,
} from './checker';

const SLIDER_HEIGHT = 12;
const HANDLE_WIDTH = 8;

const wrapperStyle: React.CSSProperties = {
	position: 'relative',
	height: SLIDER_HEIGHT,
	width: '100%',
	borderRadius: 3,
	overflow: 'hidden',
	cursor: 'ew-resize',
	backgroundColor: CHECKER_BACKGROUND_COLOR,
	backgroundImage: CHECKER_BACKGROUND_IMAGE,
	backgroundSize: CHECKER_BACKGROUND_SIZE,
	backgroundPosition: CHECKER_BACKGROUND_POSITION,
	touchAction: 'none',
};

const innerStyle: React.CSSProperties = {
	position: 'absolute',
	inset: 0,
};

export const AlphaSlider: React.FC<{
	readonly hue: number;
	readonly saturation: number;
	readonly value: number;
	readonly alpha: number;
	readonly onChange: (next: number) => void;
	readonly onChangeComplete: (next: number) => void;
}> = ({hue, saturation, value, alpha, onChange, onChangeComplete}) => {
	const ref = useRef<HTMLDivElement>(null);

	const opaqueColor = useMemo(() => {
		const {r, g, b} = hsvToRgb({h: hue, s: saturation, v: value});
		return `rgb(${r}, ${g}, ${b})`;
	}, [hue, saturation, value]);

	const gradientStyle: React.CSSProperties = useMemo(() => {
		return {
			...innerStyle,
			background: `linear-gradient(to right, ${COLOR_PICKER_ALPHA_TRANSPARENT}, ${opaqueColor})`,
		};
	}, [opaqueColor]);

	const updateFromEvent = useCallback(
		(clientX: number, isFinal: boolean) => {
			const {current} = ref;
			if (!current) {
				return;
			}

			const rect = current.getBoundingClientRect();
			const next = clamp((clientX - rect.left) / rect.width, 0, 1);
			if (isFinal) {
				onChangeComplete(next);
			} else {
				onChange(next);
			}
		},
		[onChange, onChangeComplete],
	);

	const onPointerDown = useCallback(
		(e: React.PointerEvent<HTMLDivElement>) => {
			if (e.button !== 0) {
				return;
			}

			e.preventDefault();
			updateFromEvent(e.clientX, false);

			const onMove = (ev: PointerEvent) => {
				updateFromEvent(ev.clientX, false);
			};

			const onUp = (ev: PointerEvent) => {
				window.removeEventListener('pointermove', onMove);
				window.removeEventListener('pointerup', onUp);
				updateFromEvent(ev.clientX, true);
			};

			window.addEventListener('pointermove', onMove);
			window.addEventListener('pointerup', onUp);
		},
		[updateFromEvent],
	);

	const handleStyle: React.CSSProperties = useMemo(() => {
		return {
			position: 'absolute',
			top: -2,
			left: `${alpha * 100}%`,
			marginLeft: -HANDLE_WIDTH / 2,
			width: HANDLE_WIDTH,
			height: SLIDER_HEIGHT + 4,
			borderRadius: 2,
			border: BORDER_WHITE_2PX,
			boxShadow: COLOR_PICKER_HANDLE_SHADOW,
			pointerEvents: 'none',
		};
	}, [alpha]);

	return (
		<div ref={ref} style={wrapperStyle} onPointerDown={onPointerDown}>
			<div style={gradientStyle} />
			<div style={handleStyle} />
		</div>
	);
};
