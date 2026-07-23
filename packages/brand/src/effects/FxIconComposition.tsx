import React from 'react';
import {
	AbsoluteFill,
	Easing,
	interpolate,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {CursorGlyph} from '../CanvasCapturePreview';

const TOGGLE_SIZE = 140;
const ICON_SIZE = (TOGGLE_SIZE / 36) * 31;
const CLICK_FRAME = 54;
const PANEL_BG = '#2a3035';
const TOP_BG = '#11161c';

export const FxIcon: React.FC<{
	readonly size: number;
	readonly opacity?: number;
}> = ({opacity = 1, size}) => {
	return (
		<svg
			viewBox="0 0 16 16"
			fill="none"
			style={{height: size, opacity, width: size}}
		>
			<path
				d="M4.405 4.48C4.575 3.82 4.865 3.325 5.275 2.995C5.695 2.665 6.25 2.5 6.94 2.5H9.235V4.06H7.045C6.555 4.06 6.235 4.3 6.085 4.78L5.83 5.68H7.975V7.255H5.395L3.805 13H2.02L3.625 7.255H1.96V5.68H4.075L4.405 4.48ZM8.57102 9.085L6.87602 5.68H8.79602L9.86102 7.99L11.991 5.68H14.331L10.686 9.415L12.426 13H10.491L9.35102 10.585L7.02602 13H4.68602L8.57102 9.085Z"
				fill="white"
			/>
		</svg>
	);
};

export const FxIconComposition: React.FC = () => {
	const frame = useCurrentFrame();
	const {height, width} = useVideoConfig();
	const centerX = width / 2;
	const centerY = height / 2;
	const cursorProgress = interpolate(frame, [0, 46], [0, 1], {
		easing: Easing.out(Easing.cubic),
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const cursorCurveStart = {x: centerX + 230, y: height + 180};
	const cursorCurveControl = {x: centerX + 80, y: centerY + 360};
	const cursorCurveEnd = {x: centerX, y: centerY};
	const inverseCursorProgress = 1 - cursorProgress;
	const cursorX =
		inverseCursorProgress * inverseCursorProgress * cursorCurveStart.x +
		2 * inverseCursorProgress * cursorProgress * cursorCurveControl.x +
		cursorProgress * cursorProgress * cursorCurveEnd.x;
	const cursorY =
		inverseCursorProgress * inverseCursorProgress * cursorCurveStart.y +
		2 * inverseCursorProgress * cursorProgress * cursorCurveControl.y +
		cursorProgress * cursorProgress * cursorCurveEnd.y;
	const cursorRotation = interpolate(cursorProgress, [0, 1], [-18, 0]);
	const cursorClickScale = interpolate(
		frame,
		[CLICK_FRAME - 2, CLICK_FRAME, CLICK_FRAME + 6],
		[1, 0.82, 1],
		{
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp',
		},
	);
	const iconOpacity = frame < CLICK_FRAME ? 0 : 1;

	return (
		<AbsoluteFill
			style={{
				alignItems: 'center',
				backgroundColor: PANEL_BG,
				justifyContent: 'center',
			}}
		>
			<div
				style={{
					alignItems: 'center',
					backgroundColor: TOP_BG,
					display: 'flex',
					height: '100%',
					justifyContent: 'center',
					left: 0,
					position: 'absolute',
					top: 0,
					width: '100%',
				}}
			/>
			<div
				style={{
					alignItems: 'center',
					backgroundColor: 'rgba(0, 0, 0, 0.4)',
					borderRadius: (TOGGLE_SIZE / 36) * 4,
					display: 'flex',
					height: TOGGLE_SIZE,
					justifyContent: 'center',
					position: 'relative',
					width: TOGGLE_SIZE,
				}}
			>
				<FxIcon opacity={iconOpacity} size={ICON_SIZE} />
			</div>
			<div
				style={{
					height: 32,
					left: cursorX,
					pointerEvents: 'none',
					position: 'absolute',
					top: cursorY,
					transform: `rotate(${cursorRotation}deg) scale(${cursorClickScale})`,
					transformOrigin: '0 0',
					width: 32,
				}}
			>
				<CursorGlyph cursor="default" scale={1} cursorScale={3.25} />
			</div>
		</AbsoluteFill>
	);
};
