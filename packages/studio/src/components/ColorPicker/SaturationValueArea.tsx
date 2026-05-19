import React, {useCallback, useMemo, useRef} from 'react';
import {clamp, hsvToRgb} from '../../helpers/color-conversion';

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
	background: 'linear-gradient(to top, #000, transparent)',
};

const saturationOverlay: React.CSSProperties = {
	position: 'absolute',
	inset: 0,
	background: 'linear-gradient(to right, #fff, transparent)',
};

export const SaturationValueArea: React.FC<{
	readonly hue: number;
	readonly saturation: number;
	readonly value: number;
	readonly onChange: (next: {s: number; v: number}) => void;
	readonly onChangeComplete: (next: {s: number; v: number}) => void;
}> = ({hue, saturation, value, onChange, onChangeComplete}) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const lastSV = useRef({s: saturation, v: value});

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
			lastSV.current = next;
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
			(e.target as HTMLElement).setPointerCapture?.(e.pointerId);
			updateFromEvent(e.clientX, e.clientY, false);

			const onMove = (ev: PointerEvent) => {
				updateFromEvent(ev.clientX, ev.clientY, false);
			};

			const onUp = (ev: PointerEvent) => {
				window.removeEventListener('pointermove', onMove);
				window.removeEventListener('pointerup', onUp);
				updateFromEvent(ev.clientX, ev.clientY, true);
			};

			window.addEventListener('pointermove', onMove);
			window.addEventListener('pointerup', onUp);
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
			border: '2px solid #fff',
			boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.6)',
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
