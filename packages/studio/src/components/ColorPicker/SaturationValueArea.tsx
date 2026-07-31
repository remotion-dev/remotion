import React, {useCallback, useMemo, useRef} from 'react';
import {clamp, hsvToRgb} from '../../helpers/color-conversion';
import {
	BORDER_WHITE_2PX,
	COLOR_PICKER_HANDLE_SHADOW,
	COLOR_PICKER_SATURATION_BLACK_GRADIENT,
	COLOR_PICKER_SATURATION_VALUE_GRADIENT,
} from '../../helpers/colors';
import {startPointerSession} from '../../helpers/pointer-session';

const AREA_HEIGHT = 140;

const containerStyle: React.CSSProperties = {
	position: 'relative',
	width: '100%',
	height: AREA_HEIGHT,
	cursor: 'crosshair',
	borderRadius: 3,
	overflow: 'hidden',
	touchAction: 'none',
};

const valueOverlay: React.CSSProperties = {
	position: 'absolute',
	inset: 0,
	background: COLOR_PICKER_SATURATION_BLACK_GRADIENT,
};

const saturationOverlay: React.CSSProperties = {
	position: 'absolute',
	inset: 0,
	background: COLOR_PICKER_SATURATION_VALUE_GRADIENT,
};

export const SaturationValueArea: React.FC<{
	readonly hue: number;
	readonly saturation: number;
	readonly value: number;
	readonly onChange: (next: {s: number; v: number}) => void;
	readonly onChangeComplete: (next: {s: number; v: number}) => void;
}> = ({hue, saturation, value, onChange, onChangeComplete}) => {
	const containerRef = useRef<HTMLDivElement>(null);

	const baseColor = useMemo(() => {
		const {r, g, b} = hsvToRgb({h: hue, s: 1, v: 1});
		return `rgb(${r}, ${g}, ${b})`;
	}, [hue]);

	const updateFromEvent = useCallback(
		(clientX: number, clientY: number, isFinal: boolean) => {
			const {current} = containerRef;
			if (!current) {
				return;
			}

			const rect = current.getBoundingClientRect();
			const x = clamp((clientX - rect.left) / rect.width, 0, 1);
			const y = clamp((clientY - rect.top) / rect.height, 0, 1);
			const next = {s: x, v: 1 - y};
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
			updateFromEvent(e.clientX, e.clientY, false);
			let lastPosition = {clientX: e.clientX, clientY: e.clientY};

			startPointerSession({
				event: e.nativeEvent,
				target: e.currentTarget,
				onMove: (ev) => {
					lastPosition = {clientX: ev.clientX, clientY: ev.clientY};
					updateFromEvent(ev.clientX, ev.clientY, false);
				},
				onEnd: (reason, ev) => {
					const shouldUseEndEvent =
						reason === 'pointerup' || reason === 'buttons-released';
					updateFromEvent(
						shouldUseEndEvent && ev ? ev.clientX : lastPosition.clientX,
						shouldUseEndEvent && ev ? ev.clientY : lastPosition.clientY,
						true,
					);
				},
			});
		},
		[updateFromEvent],
	);

	const containerWithBg: React.CSSProperties = useMemo(() => {
		return {
			...containerStyle,
			backgroundColor: baseColor,
		};
	}, [baseColor]);

	const handleStyle: React.CSSProperties = useMemo(() => {
		return {
			position: 'absolute',
			left: `${saturation * 100}%`,
			top: `${(1 - value) * 100}%`,
			width: 12,
			height: 12,
			marginLeft: -6,
			marginTop: -6,
			borderRadius: '50%',
			border: BORDER_WHITE_2PX,
			boxShadow: COLOR_PICKER_HANDLE_SHADOW,
			pointerEvents: 'none',
		};
	}, [saturation, value]);

	return (
		<div
			ref={containerRef}
			style={containerWithBg}
			onPointerDown={onPointerDown}
		>
			<div style={saturationOverlay} />
			<div style={valueOverlay} />
			<div style={handleStyle} />
		</div>
	);
};
