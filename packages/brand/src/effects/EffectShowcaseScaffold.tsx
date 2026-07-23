import React from 'react';
import {AbsoluteFill, Easing, Solid, interpolate} from 'remotion';

export const WIDTH = 1080;
export const HEIGHT = 1350;
export const TOP_HEIGHT = 675;
export const BOTTOM_HEIGHT = HEIGHT - TOP_HEIGHT;
export const STUDIO_BLUE = '#0b84f3';
export const LIGHT_TEXT = '#dfe2e6';
export const PANEL_BG = '#1f2428';
export const SOLID_CREAM = '#fff4d8';

const BOTTOM_PANEL_LEFT_PADDING = 220;
const EFFECT_HEADER_LEFT_PADDING = 183;
const PARAM_ROW_HEIGHT = 60;
const EFFECT_HEADER_HEIGHT = 70;
const PARAM_FONT_SIZE = 30;
const KEYFRAME_INACTIVE = '#A6A7A9';
const BORDER = '#13161b';
const INPUT_BACKGROUND = '#2f363d';
const INPUT_BORDER_COLOR_UNHOVERED = 'rgba(0, 0, 0, 0.6)';
const ROW_HIGHLIGHT_OPACITY = 0.15;
const KEYFRAME_DIAMOND_SIZE = 22;
const EFFECT_TOGGLE_ANIMATION_DURATION = 12;
const EFFECT_EXPAND_DURATION = 14;
const PREVIEW_FADE_DURATION = 14;
const UV_KNOB_RADIUS = 12;
const UV_KNOB_STROKE_WIDTH = 4;

export const clamp = {
	extrapolateLeft: 'clamp',
	extrapolateRight: 'clamp',
} as const;

const mainFont: React.CSSProperties = {
	fontFamily:
		'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
};

const topHalf: React.CSSProperties = {
	left: 0,
	backgroundColor: '#080b10',
	height: TOP_HEIGHT,
	overflow: 'visible',
	position: 'relative',
	top: 0,
	width: WIDTH,
	zIndex: 1,
};

export const previewLayerStyle: React.CSSProperties = {
	backgroundColor: SOLID_CREAM,
	display: 'block',
	height: '100%',
	left: 0,
	position: 'absolute',
	top: 0,
	width: '100%',
};

const studioPanel: React.CSSProperties = {
	...mainFont,
	backgroundColor: PANEL_BG,
	borderTop: '1px solid #0d1014',
	boxSizing: 'border-box',
	color: LIGHT_TEXT,
	height: BOTTOM_HEIGHT,
	left: 0,
	position: 'absolute',
	top: TOP_HEIGHT,
	width: WIDTH,
};

const paramsPanel: React.CSSProperties = {
	borderBottom: `1px solid ${BORDER}`,
	flex: 1,
};

const effectLabel: React.CSSProperties = {
	alignItems: 'center',
	borderBottom: `1px solid ${BORDER}`,
	color: LIGHT_TEXT,
	display: 'flex',
	fontSize: PARAM_FONT_SIZE,
	fontWeight: 400,
	height: EFFECT_HEADER_HEIGHT,
};

const rowContent: React.CSSProperties = {
	alignItems: 'center',
	boxSizing: 'border-box',
	display: 'flex',
	height: '100%',
	paddingLeft: BOTTOM_PANEL_LEFT_PADDING,
	width: '100%',
};

const effectHeaderContent: React.CSSProperties = {
	...rowContent,
	paddingLeft: EFFECT_HEADER_LEFT_PADDING,
};

const effectArrow: React.CSSProperties = {
	alignItems: 'center',
	display: 'flex',
	height: 31,
	justifyContent: 'center',
	marginRight: 10,
	width: 31,
};

const effectToggle: React.CSSProperties = {
	alignItems: 'center',
	backgroundColor: 'rgba(0, 0, 0, 0.4)',
	borderRadius: 4,
	display: 'inline-flex',
	height: 36,
	justifyContent: 'center',
	marginRight: 12,
	position: 'relative',
	width: 36,
};

const effectToggleIcon: React.CSSProperties = {
	color: 'currentColor',
	height: 31,
	pointerEvents: 'none',
	width: 31,
};

const effectToggleIconWrapper: React.CSSProperties = {
	alignItems: 'center',
	display: 'flex',
	height: 31,
	justifyContent: 'center',
	transformOrigin: '50% 50%',
	width: 31,
};

const effectToggleCenterLayer: React.CSSProperties = {
	alignItems: 'center',
	display: 'flex',
	height: '100%',
	justifyContent: 'center',
	left: 0,
	position: 'absolute',
	top: 0,
	width: '100%',
};

const rowStyle: React.CSSProperties = {
	alignItems: 'center',
	borderBottom: `1px solid ${BORDER}`,
	display: 'flex',
	height: PARAM_ROW_HEIGHT,
};

const rowLabel: React.CSSProperties = {
	color: LIGHT_TEXT,
	fontSize: PARAM_FONT_SIZE,
	fontWeight: 400,
	width: 190,
};

export const fieldBox: React.CSSProperties = {
	alignItems: 'center',
	color: STUDIO_BLUE,
	display: 'flex',
	fontSize: PARAM_FONT_SIZE,
	height: 38,
	paddingLeft: 10,
	paddingRight: 10,
};

export const tinyFieldBox: React.CSSProperties = {
	...fieldBox,
	width: 88,
};

const colorsField: React.CSSProperties = {
	...fieldBox,
	gap: 10,
	minWidth: 280,
};

const enumFieldBox: React.CSSProperties = {
	...fieldBox,
	backgroundColor: INPUT_BACKGROUND,
	border: `1px solid ${INPUT_BORDER_COLOR_UNHOVERED}`,
	boxSizing: 'border-box',
	color: 'white',
	height: 40,
	justifyContent: 'space-between',
	paddingLeft: 16,
	paddingRight: 14,
	width: 172,
};

const swatch: React.CSSProperties = {
	border: '1px solid rgba(255, 255, 255, 0.9)',
	borderRadius: 999,
	boxSizing: 'border-box',
	height: 26,
	width: 26,
};

const transparentSwatch: React.CSSProperties = {
	...swatch,
	backgroundColor: '#f7f7f7',
	backgroundImage:
		'linear-gradient(45deg, #9b9b9b 25%, transparent 25%), linear-gradient(-45deg, #9b9b9b 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #9b9b9b 75%), linear-gradient(-45deg, transparent 75%, #9b9b9b 75%)',
	backgroundPosition: '0 0, 0 13px, 13px -13px, -13px 0',
	backgroundSize: '26px 26px',
};

export const formatNumber = (value: number) => {
	return value.toFixed(2);
};

export const formatDegrees = (value: number) => {
	return `${Math.round(value)}°`;
};

export const getTransitionProgress = (frame: number, start: number) => {
	return interpolate(
		frame,
		[start, start + PREVIEW_FADE_DURATION],
		[0, 1],
		clamp,
	);
};

export const getExpandProgress = (frame: number, start: number) => {
	return interpolate(frame, [start, start + EFFECT_EXPAND_DURATION], [0, 1], {
		...clamp,
		easing: Easing.bezier(0.16, 1, 0.3, 1),
	});
};

export const getToggleIconScale = (frame: number, start: number) => {
	return interpolate(
		frame,
		[start, start + 5, start + EFFECT_TOGGLE_ANIMATION_DURATION],
		[0, 1.35, 1],
		clamp,
	);
};

export const getHighlightOpacity = ({
	frame,
	start,
	end,
	fadeDuration = 10,
}: {
	readonly frame: number;
	readonly start: number;
	readonly end: number;
	readonly fadeDuration?: number;
}) => {
	const fadeIn = interpolate(
		frame,
		[start - fadeDuration, start],
		[0, 1],
		clamp,
	);
	const fadeOut = interpolate(frame, [end, end + fadeDuration], [1, 0], clamp);

	return Math.min(fadeIn, fadeOut);
};

const getHighlightBackground = (opacity: number) => {
	return opacity > 0
		? `hsla(0, 0%, 100%, ${ROW_HIGHLIGHT_OPACITY * opacity})`
		: 'transparent';
};

const KeyframeDiamond: React.FC<{
	readonly active: boolean;
	readonly size?: number;
}> = ({active, size = KEYFRAME_DIAMOND_SIZE}) => {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 12 12"
			style={{display: 'block', overflow: 'visible'}}
		>
			<polygon
				points="6 1.5 10.5 6 6 10.5 1.5 6"
				fill={active ? STUDIO_BLUE : KEYFRAME_INACTIVE}
				stroke="rgba(0, 0, 0, 0.45)"
				strokeWidth="1"
				strokeLinejoin="round"
			/>
		</svg>
	);
};

export const ParamRow: React.FC<{
	readonly label: string;
	readonly activeDiamond?: boolean;
	readonly fontSize?: number;
	readonly highlightOpacity?: number;
	readonly keyframeDiamondSize?: number;
	readonly labelWidth?: number;
	readonly rowHeight?: number;
	readonly children: React.ReactNode;
}> = ({
	label,
	activeDiamond = false,
	fontSize = PARAM_FONT_SIZE,
	highlightOpacity = 0,
	keyframeDiamondSize = KEYFRAME_DIAMOND_SIZE,
	labelWidth = 190,
	rowHeight = PARAM_ROW_HEIGHT,
	children,
}) => {
	return (
		<div
			style={{
				...rowStyle,
				backgroundColor: getHighlightBackground(highlightOpacity),
				height: rowHeight,
			}}
		>
			<div style={rowContent}>
				<div
					style={{
						alignItems: 'center',
						display: 'flex',
						justifyContent: 'center',
						width: 52,
					}}
				>
					<KeyframeDiamond active={activeDiamond} size={keyframeDiamondSize} />
				</div>
				<div style={{...rowLabel, fontSize, width: labelWidth}}>{label}</div>
				<div
					style={{
						alignItems: 'center',
						display: 'flex',
						flex: 1,
						minWidth: 0,
					}}
				>
					{children}
				</div>
			</div>
		</div>
	);
};

export const ColorSwatches: React.FC<{
	readonly colors: readonly string[];
}> = ({colors}) => {
	return (
		<div style={colorsField}>
			{colors.map((color) => {
				const isTransparent = color === 'transparent' || color.includes(', 0)');

				return (
					<div
						key={color}
						style={
							isTransparent
								? transparentSwatch
								: {
										...swatch,
										backgroundColor: color,
									}
						}
					/>
				);
			})}
		</div>
	);
};

export const EnumValue: React.FC<{
	readonly value: string;
}> = ({value}) => {
	return (
		<div style={enumFieldBox}>
			<span>{value}</span>
			<svg width="13" viewBox="0 0 320 512">
				<path
					fill="currentColor"
					d="M31.3 192h257.3c17.8 0 26.7 21.5 14.1 34.1L174.1 354.8c-7.8 7.8-20.5 7.8-28.3 0L17.2 226.1C4.6 213.5 13.5 192 31.3 192z"
				/>
			</svg>
		</div>
	);
};

const EffectArrow: React.FC<{
	readonly expandProgress: number;
	readonly size?: number;
}> = ({expandProgress, size = 23}) => {
	return (
		<div
			style={{...effectArrow, transform: `rotate(${expandProgress * 90}deg)`}}
		>
			<svg
				width={size}
				height={size}
				viewBox="0 0 8 8"
				style={{display: 'block'}}
			>
				<path d="M2 1L6 4L2 7Z" fill="#ccc" />
			</svg>
		</div>
	);
};

const EffectToggle: React.FC<{
	readonly enabled: boolean;
	readonly iconScale?: number;
	readonly iconSize?: number;
	readonly size?: number;
}> = ({enabled, iconScale = 1, iconSize = 31, size = 36}) => {
	return (
		<div style={{...effectToggle, height: size, width: size}}>
			{enabled ? (
				<div
					style={{
						...effectToggleCenterLayer,
						opacity: iconScale <= 0 ? 0 : 1,
					}}
				>
					<div
						style={{
							...effectToggleIconWrapper,
							height: iconSize,
							transform: `scale(${iconScale})`,
							width: iconSize,
						}}
					>
						<svg
							viewBox="0 0 16 16"
							fill="none"
							style={{...effectToggleIcon, height: iconSize, width: iconSize}}
						>
							<path
								d="M4.405 4.48C4.575 3.82 4.865 3.325 5.275 2.995C5.695 2.665 6.25 2.5 6.94 2.5H9.235V4.06H7.045C6.555 4.06 6.235 4.3 6.085 4.78L5.83 5.68H7.975V7.255H5.395L3.805 13H2.02L3.625 7.255H1.96V5.68H4.075L4.405 4.48ZM8.57102 9.085L6.87602 5.68H8.79602L9.86102 7.99L11.991 5.68H14.331L10.686 9.415L12.426 13H10.491L9.35102 10.585L7.02602 13H4.68602L8.57102 9.085Z"
								fill="white"
							/>
						</svg>
					</div>
				</div>
			) : null}
		</div>
	);
};

export const EffectHeader: React.FC<{
	readonly arrowSize?: number;
	readonly contentPaddingLeft?: number;
	readonly label: string;
	readonly enabled: boolean;
	readonly expandProgress?: number;
	readonly fontSize?: number;
	readonly highlightOpacity?: number;
	readonly toggleIconSize?: number;
	readonly iconScale?: number;
	readonly toggleSize?: number;
}> = ({
	arrowSize,
	contentPaddingLeft = EFFECT_HEADER_LEFT_PADDING,
	label,
	enabled,
	expandProgress = 1,
	fontSize = PARAM_FONT_SIZE,
	highlightOpacity = 0,
	toggleIconSize,
	iconScale,
	toggleSize,
}) => {
	return (
		<div
			style={{
				...effectLabel,
				backgroundColor: getHighlightBackground(highlightOpacity),
				fontSize,
			}}
		>
			<div style={{...effectHeaderContent, paddingLeft: contentPaddingLeft}}>
				<EffectToggle
					enabled={enabled}
					iconScale={iconScale}
					iconSize={toggleIconSize}
					size={toggleSize}
				/>
				<EffectArrow expandProgress={expandProgress} size={arrowSize} />
				{label}
			</div>
		</div>
	);
};

export const EffectProperties: React.FC<{
	readonly children: React.ReactNode;
	readonly expandProgress?: number;
	readonly rowHeight?: number;
	readonly rowCount: number;
}> = ({
	children,
	expandProgress = 1,
	rowHeight = PARAM_ROW_HEIGHT,
	rowCount,
}) => {
	return (
		<div
			style={{
				height: rowCount * rowHeight * expandProgress,
				overflow: 'hidden',
			}}
		>
			<div
				style={{
					opacity: expandProgress,
					transform: `translateY(${(1 - expandProgress) * -18}px)`,
				}}
			>
				{children}
			</div>
		</div>
	);
};

export const UvKnob: React.FC<{
	readonly frame: number;
	readonly uv: readonly [number, number];
	readonly start: number;
	readonly end: number;
	readonly lineTo?: readonly [number, number];
}> = ({frame, uv, start, end, lineTo}) => {
	const progress = getHighlightOpacity({
		frame,
		start,
		end: end + 22,
		fadeDuration: 12,
	});
	const scale = interpolate(progress, [0, 1], [0.42, 1], clamp);
	const centerX = WIDTH * uv[0];
	const centerY = TOP_HEIGHT * uv[1];

	if (progress <= 0) {
		return null;
	}

	return (
		<svg
			width={WIDTH}
			height={TOP_HEIGHT}
			viewBox={`0 0 ${WIDTH} ${TOP_HEIGHT}`}
			style={{
				left: 0,
				opacity: progress,
				overflow: 'visible',
				pointerEvents: 'none',
				position: 'absolute',
				top: 0,
			}}
		>
			{lineTo ? (
				<line
					x1={centerX}
					y1={centerY}
					x2={WIDTH * lineTo[0]}
					y2={TOP_HEIGHT * lineTo[1]}
					stroke={STUDIO_BLUE}
					strokeWidth={2}
					vectorEffect="non-scaling-stroke"
				/>
			) : null}
			<circle
				cx={centerX}
				cy={centerY}
				r={UV_KNOB_RADIUS * scale}
				fill="white"
				stroke={STUDIO_BLUE}
				strokeWidth={UV_KNOB_STROKE_WIDTH}
				vectorEffect="non-scaling-stroke"
			/>
		</svg>
	);
};

export const EffectShowcaseShell: React.FC<{
	readonly preview: React.ReactNode;
	readonly studio: React.ReactNode;
}> = ({preview, studio}) => {
	return (
		<AbsoluteFill style={{backgroundColor: PANEL_BG}}>
			<div style={topHalf}>{preview}</div>
			<div style={studioPanel}>
				<div style={{display: 'flex', height: BOTTOM_HEIGHT}}>
					<div
						style={{
							display: 'flex',
							flex: 1,
							flexDirection: 'column',
							minWidth: 0,
						}}
					>
						<div style={paramsPanel}>{studio}</div>
					</div>
				</div>
			</div>
		</AbsoluteFill>
	);
};

export const PreviewSolidLayer: React.FC<{
	readonly opacity?: number;
	readonly effects?: React.ComponentProps<typeof Solid>['effects'];
}> = ({opacity = 1, effects}) => {
	return (
		<Solid
			width={WIDTH}
			height={TOP_HEIGHT}
			color={SOLID_CREAM}
			style={{...previewLayerStyle, opacity}}
			effects={effects}
		/>
	);
};
