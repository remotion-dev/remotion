import React, {useCallback, useMemo, useRef} from 'react';
import {clamp} from '../../helpers/color-conversion';
import {
	BORDER_WHITE_2PX,
	COLOR_PICKER_HANDLE_SHADOW,
	COLOR_PICKER_HUE_GRADIENT,
} from '../../helpers/colors';

const SLIDER_HEIGHT = 12;
const HANDLE_WIDTH = 8;

const containerStyle: React.CSSProperties = {
	position: 'relative',
	height: SLIDER_HEIGHT,
	width: '100%',
	borderRadius: 3,
	cursor: 'ew-resize',
	background: COLOR_PICKER_HUE_GRADIENT,
	touchAction: 'none',
};

export const HueSlider: React.FC<{
	readonly hue: number;
	readonly onChange: (next: number) => void;
	readonly onChangeComplete: (next: number) => void;
}> = ({hue, onChange, onChangeComplete}) => {
	const ref = useRef<HTMLDivElement>(null);

	const updateFromEvent = useCallback(
		(clientX: number, isFinal: boolean) => {
			const {current} = ref;
			if (!current) {
				return;
			}

			const rect = current.getBoundingClientRect();
			const x = clamp((clientX - rect.left) / rect.width, 0, 1);
			const next = x * 360;
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
			left: `${(hue / 360) * 100}%`,
			marginLeft: -HANDLE_WIDTH / 2,
			width: HANDLE_WIDTH,
			height: SLIDER_HEIGHT + 4,
			borderRadius: 2,
			border: BORDER_WHITE_2PX,
			boxShadow: COLOR_PICKER_HANDLE_SHADOW,
			pointerEvents: 'none',
		};
	}, [hue]);

	return (
		<div ref={ref} style={containerStyle} onPointerDown={onPointerDown}>
			<div style={handleStyle} />
		</div>
	);
};
