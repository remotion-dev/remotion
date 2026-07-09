import {halftone} from '@remotion/effects/halftone';
import {starburst} from '@remotion/starburst';
import React from 'react';
import {
	AbsoluteFill,
	Easing,
	Solid,
	interpolate,
	useCurrentFrame,
} from 'remotion';
import {CursorGlyph} from '../CanvasCapturePreview';

const WIDTH = 1080;
const HEIGHT = 1350;
const TOP_HEIGHT = 675;
const BOTTOM_HEIGHT = HEIGHT - TOP_HEIGHT;
const BOTTOM_PANEL_LEFT_PADDING = 220;
const EFFECT_HEADER_LEFT_PADDING = 183;
const PARAM_ROW_HEIGHT = 60;
const EFFECT_HEADER_HEIGHT = 70;
const PARAM_FONT_SIZE = 30;

const ORIGIN_MOVE_START = 78;
const ORIGIN_MOVE_END = 126;
const KEYFRAME_SET_FRAME = 174;
const ROTATION_START = 198;
const ROTATION_DURATION = 72;
const STARBURST_ENABLE_FRAME = 30;
const HALFTONE_ENABLE_DELAY = 72;
const HALFTONE_ENABLE_FRAME =
	ROTATION_START + ROTATION_DURATION / 2 + HALFTONE_ENABLE_DELAY;
const FX_ICON_JUMP_DURATION = 12;
const EFFECT_EXPAND_DURATION = 14;
const PREVIEW_CROSSFADE_DURATION = 14;
const HALFTONE_PARAM_ROWS = 4;
const HALFTONE_DOT_SIZE_TWEAK_START =
	HALFTONE_ENABLE_FRAME + EFFECT_EXPAND_DURATION + 24;
const HALFTONE_DOT_SIZE_TWEAK_END = HALFTONE_DOT_SIZE_TWEAK_START + 96;
const HALFTONE_SHAPE_TWEAK_FRAME = HALFTONE_DOT_SIZE_TWEAK_END + 48;
const HALFTONE_SHAPE_TWEAK_HIGHLIGHT_END = HALFTONE_SHAPE_TWEAK_FRAME + 48;
const ORIGIN_KNOB_APPEAR_FRAME = ORIGIN_MOVE_START - 18;

const STUDIO_BLUE = '#0b84f3';
const LIGHT_TEXT = '#dfe2e6';
const KEYFRAME_INACTIVE = '#A6A7A9';
const PANEL_BG = '#1f2428';
const BORDER = '#13161b';
const INPUT_BACKGROUND = '#2f363d';
const INPUT_BORDER_COLOR_UNHOVERED = 'rgba(0, 0, 0, 0.6)';
const ROW_HIGHLIGHT_OPACITY = 0.15;
const STARBURST_ORANGE = '#ff8a00';
const SOLID_CREAM = '#fff4d8';
const STARBURST_COLORS = [STARBURST_ORANGE, 'rgba(255, 244, 216, 0)'] as const;
const RAYS = 18;
const KEYFRAME_DIAMOND_SIZE = 22;
const HALFTONE_DOT_SIZE_START = 12;
const HALFTONE_DOT_SIZE_END = 20;
const HALFTONE_DOT_SPACING = 14;
const HALFTONE_DOT_COLOR = '#ff8a00';
const ORIGIN_KNOB_RADIUS = 16;
const ORIGIN_KNOB_STROKE_WIDTH = 4;
const CURSOR_IN_FRAME = 0;
const CURSOR_OUT_FRAME = HALFTONE_SHAPE_TWEAK_FRAME + 64;
const RESIZE_CURSOR_LEAD = 5;
const RESIZE_CURSOR_HOLD = 12;
const VALUE_DRAG_START_X = 472;
const VALUE_DRAG_END_X = 712;
const STARBURST_TOGGLE_CURSOR_Y = TOP_HEIGHT + EFFECT_HEADER_HEIGHT / 2;
const ROTATION_ROW_Y =
	TOP_HEIGHT + EFFECT_HEADER_HEIGHT + PARAM_ROW_HEIGHT * 2.5;
const HALFTONE_HEADER_Y =
	TOP_HEIGHT +
	EFFECT_HEADER_HEIGHT +
	PARAM_ROW_HEIGHT * 5 +
	EFFECT_HEADER_HEIGHT / 2;
const HALFTONE_SHAPE_ROW_Y =
	TOP_HEIGHT +
	EFFECT_HEADER_HEIGHT +
	PARAM_ROW_HEIGHT * 5 +
	EFFECT_HEADER_HEIGHT +
	PARAM_ROW_HEIGHT * 0.5;
const HALFTONE_DOT_SIZE_ROW_Y =
	TOP_HEIGHT +
	EFFECT_HEADER_HEIGHT +
	PARAM_ROW_HEIGHT * 5 +
	EFFECT_HEADER_HEIGHT +
	PARAM_ROW_HEIGHT * 1.5;

export const starburstEffectShowcaseDurationInFrames = 582;

const clamp = {
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

const solidStyle: React.CSSProperties = {
	backgroundColor: SOLID_CREAM,
	display: 'block',
	height: '100%',
	width: '100%',
};

const previewLayerStyle: React.CSSProperties = {
	...solidStyle,
	left: 0,
	position: 'absolute',
	top: 0,
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

const studioBody: React.CSSProperties = {
	display: 'flex',
	height: BOTTOM_HEIGHT,
};

const inspector: React.CSSProperties = {
	display: 'flex',
	flex: 1,
	flexDirection: 'column',
	minWidth: 0,
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

const effectArrowSvg: React.CSSProperties = {
	display: 'block',
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

const effectToggleJumpLayer: React.CSSProperties = {
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

const fieldBox: React.CSSProperties = {
	alignItems: 'center',
	color: STUDIO_BLUE,
	display: 'flex',
	fontSize: PARAM_FONT_SIZE,
	height: 38,
	paddingLeft: 10,
	paddingRight: 10,
};

const tinyFieldBox: React.CSSProperties = {
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
	color: 'white',
	boxSizing: 'border-box',
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

const cursorContainer: React.CSSProperties = {
	height: 32,
	left: 0,
	pointerEvents: 'none',
	position: 'absolute',
	top: 0,
	width: 32,
	zIndex: 10,
};

type CursorPoint = {
	readonly frame: number;
	readonly x: number;
	readonly y: number;
};

const formatNumber = (value: number) => {
	return value.toFixed(2);
};

const formatDegrees = (value: number) => {
	return `${Math.round(value)}°`;
};

const getRotation = (frame: number) => {
	if (frame < ROTATION_START) {
		return 0;
	}

	return ((frame - ROTATION_START) / ROTATION_DURATION) * 360;
};

const getOriginY = (frame: number) => {
	return interpolate(frame, [ORIGIN_MOVE_START, ORIGIN_MOVE_END], [0.5, 1], {
		...clamp,
		easing: Easing.bezier(0.16, 1, 0.3, 1),
	});
};

const getHalftoneDotSize = (frame: number) => {
	return interpolate(
		frame,
		[HALFTONE_DOT_SIZE_TWEAK_START, HALFTONE_DOT_SIZE_TWEAK_END],
		[HALFTONE_DOT_SIZE_START, HALFTONE_DOT_SIZE_END],
		clamp,
	);
};

const cursorPoints = [
	{frame: 0, x: 84, y: 1010},
	{frame: STARBURST_ENABLE_FRAME - 8, x: 201, y: STARBURST_TOGGLE_CURSOR_Y},
	{frame: STARBURST_ENABLE_FRAME + 8, x: 201, y: STARBURST_TOGGLE_CURSOR_Y},
	{frame: ORIGIN_MOVE_START - 12, x: WIDTH * 0.5, y: TOP_HEIGHT * 0.5},
	{frame: ORIGIN_MOVE_START, x: WIDTH * 0.5, y: TOP_HEIGHT * 0.5},
	{frame: ORIGIN_MOVE_END + 10, x: WIDTH * 0.5, y: TOP_HEIGHT},
	{frame: KEYFRAME_SET_FRAME - 8, x: 246, y: ROTATION_ROW_Y},
	{frame: KEYFRAME_SET_FRAME + 8, x: 246, y: ROTATION_ROW_Y},
	{frame: ROTATION_START - 10, x: VALUE_DRAG_START_X, y: ROTATION_ROW_Y},
	{frame: ROTATION_START, x: VALUE_DRAG_START_X, y: ROTATION_ROW_Y},
	{
		frame: ROTATION_START + ROTATION_DURATION,
		x: VALUE_DRAG_END_X,
		y: ROTATION_ROW_Y,
	},
	{
		frame: ROTATION_START + ROTATION_DURATION + 12,
		x: VALUE_DRAG_END_X,
		y: ROTATION_ROW_Y,
	},
	{frame: HALFTONE_ENABLE_FRAME - 8, x: 201, y: HALFTONE_HEADER_Y},
	{frame: HALFTONE_ENABLE_FRAME + 8, x: 201, y: HALFTONE_HEADER_Y},
	{
		frame: HALFTONE_DOT_SIZE_TWEAK_START - 12,
		x: VALUE_DRAG_START_X,
		y: HALFTONE_DOT_SIZE_ROW_Y,
	},
	{
		frame: HALFTONE_DOT_SIZE_TWEAK_START,
		x: VALUE_DRAG_START_X,
		y: HALFTONE_DOT_SIZE_ROW_Y,
	},
	{
		frame: HALFTONE_DOT_SIZE_TWEAK_END,
		x: VALUE_DRAG_END_X,
		y: HALFTONE_DOT_SIZE_ROW_Y,
	},
	{
		frame: HALFTONE_DOT_SIZE_TWEAK_END + 12,
		x: VALUE_DRAG_END_X,
		y: HALFTONE_DOT_SIZE_ROW_Y,
	},
	{
		frame: HALFTONE_SHAPE_TWEAK_FRAME - 8,
		x: 552,
		y: HALFTONE_SHAPE_ROW_Y,
	},
	{
		frame: HALFTONE_SHAPE_TWEAK_FRAME + 8,
		x: 552,
		y: HALFTONE_SHAPE_ROW_Y,
	},
	{frame: CURSOR_OUT_FRAME, x: 940, y: 1180},
] as const satisfies readonly CursorPoint[];

const getCursorPoint = (frame: number): CursorPoint => {
	if (frame >= ORIGIN_MOVE_START && frame <= ORIGIN_MOVE_END) {
		return {
			frame,
			x: WIDTH * 0.5,
			y: TOP_HEIGHT * getOriginY(frame),
		};
	}

	if (frame >= ROTATION_START && frame <= ROTATION_START + ROTATION_DURATION) {
		const progress = getRotation(frame) / 360;

		return {
			frame,
			x: interpolate(progress, [0, 1], [VALUE_DRAG_START_X, VALUE_DRAG_END_X]),
			y: ROTATION_ROW_Y,
		};
	}

	if (
		frame >= HALFTONE_DOT_SIZE_TWEAK_START &&
		frame <= HALFTONE_DOT_SIZE_TWEAK_END
	) {
		const progress =
			(getHalftoneDotSize(frame) - HALFTONE_DOT_SIZE_START) /
			(HALFTONE_DOT_SIZE_END - HALFTONE_DOT_SIZE_START);

		return {
			frame,
			x: interpolate(progress, [0, 1], [VALUE_DRAG_START_X, VALUE_DRAG_END_X]),
			y: HALFTONE_DOT_SIZE_ROW_Y,
		};
	}

	for (let i = 0; i < cursorPoints.length - 1; i++) {
		const from = cursorPoints[i];
		const to = cursorPoints[i + 1];

		if (frame >= from.frame && frame <= to.frame) {
			const progress = interpolate(frame, [from.frame, to.frame], [0, 1], {
				...clamp,
				easing: Easing.bezier(0.16, 1, 0.3, 1),
			});

			return {
				frame,
				x: interpolate(progress, [0, 1], [from.x, to.x]),
				y: interpolate(progress, [0, 1], [from.y, to.y]),
			};
		}
	}

	return cursorPoints.at(-1)!;
};

const isCursorDown = (frame: number) => {
	return (
		(frame >= STARBURST_ENABLE_FRAME - 1 &&
			frame <= STARBURST_ENABLE_FRAME + 5) ||
		(frame >= KEYFRAME_SET_FRAME - 1 && frame <= KEYFRAME_SET_FRAME + 5) ||
		(frame >= HALFTONE_ENABLE_FRAME - 1 &&
			frame <= HALFTONE_ENABLE_FRAME + 5) ||
		(frame >= HALFTONE_SHAPE_TWEAK_FRAME - 1 &&
			frame <= HALFTONE_SHAPE_TWEAK_FRAME + 5) ||
		(frame >= ORIGIN_MOVE_START && frame <= ORIGIN_MOVE_END) ||
		(frame >= ROTATION_START && frame <= ROTATION_START + ROTATION_DURATION) ||
		(frame >= HALFTONE_DOT_SIZE_TWEAK_START &&
			frame <= HALFTONE_DOT_SIZE_TWEAK_END)
	);
};

const getCursor = (frame: number) => {
	if (
		(frame >= ROTATION_START - RESIZE_CURSOR_LEAD &&
			frame <= ROTATION_START + ROTATION_DURATION + RESIZE_CURSOR_HOLD) ||
		(frame >= HALFTONE_DOT_SIZE_TWEAK_START - RESIZE_CURSOR_LEAD &&
			frame <= HALFTONE_DOT_SIZE_TWEAK_END + RESIZE_CURSOR_HOLD)
	) {
		return 'resizewesteast';
	}

	return 'default';
};

const ShowcaseCursor: React.FC<{
	readonly frame: number;
}> = ({frame}) => {
	const point = getCursorPoint(frame);
	const opacity = Math.min(
		interpolate(frame, [CURSOR_IN_FRAME, CURSOR_IN_FRAME + 12], [0, 1], clamp),
		interpolate(
			frame,
			[CURSOR_OUT_FRAME - 12, CURSOR_OUT_FRAME],
			[1, 0],
			clamp,
		),
	);
	const clickScale = isCursorDown(frame) ? 0.9 : 1;

	return (
		<div
			style={{
				...cursorContainer,
				opacity,
				transform: `translate(${point.x}px, ${point.y}px) scale(${clickScale})`,
			}}
		>
			<CursorGlyph cursor={getCursor(frame)} scale={1} cursorScale={2.5} />
		</div>
	);
};

const getHalftoneShape = (frame: number): 'circle' | 'line' => {
	return frame >= HALFTONE_SHAPE_TWEAK_FRAME ? 'line' : 'circle';
};

const getTransitionProgress = (frame: number, start: number) => {
	return interpolate(
		frame,
		[start, start + PREVIEW_CROSSFADE_DURATION],
		[0, 1],
		clamp,
	);
};

const getHighlightOpacity = ({
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

const getOriginKnobProgress = (frame: number) => {
	return getHighlightOpacity({
		frame,
		start: ORIGIN_KNOB_APPEAR_FRAME,
		end: ORIGIN_MOVE_END + 22,
		fadeDuration: 12,
	});
};

const KeyframeDiamond: React.FC<{
	readonly active: boolean;
}> = ({active}) => {
	return (
		<svg
			width={KEYFRAME_DIAMOND_SIZE}
			height={KEYFRAME_DIAMOND_SIZE}
			viewBox="0 0 12 12"
			style={{
				display: 'block',
				overflow: 'visible',
			}}
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

const ParamRow: React.FC<{
	readonly label: string;
	readonly activeDiamond?: boolean;
	readonly highlightOpacity?: number;
	readonly children: React.ReactNode;
}> = ({label, activeDiamond = false, highlightOpacity = 0, children}) => {
	return (
		<div
			style={{
				...rowStyle,
				backgroundColor: getHighlightBackground(highlightOpacity),
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
					<KeyframeDiamond active={activeDiamond} />
				</div>
				<div style={rowLabel}>{label}</div>
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

const ColorsValue: React.FC = () => {
	return (
		<div style={colorsField}>
			{STARBURST_COLORS.map((color) => {
				const isTransparent = color.includes(', 0)');

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

const EnumValue: React.FC<{
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
}> = ({expandProgress}) => {
	return (
		<div
			style={{
				...effectArrow,
				transform: `rotate(${expandProgress * 90}deg)`,
			}}
		>
			<svg width="23" height="23" viewBox="0 0 8 8" style={effectArrowSvg}>
				<path d="M2 1L6 4L2 7Z" fill="#ccc" />
			</svg>
		</div>
	);
};

const EffectToggle: React.FC<{
	readonly enabled: boolean;
	readonly iconScale?: number;
}> = ({enabled, iconScale = 1}) => {
	return (
		<div style={effectToggle}>
			{enabled ? (
				<div
					style={{
						...effectToggleJumpLayer,
						opacity: iconScale <= 0 ? 0 : 1,
					}}
				>
					<div
						style={{
							...effectToggleIconWrapper,
							transform: `scale(${iconScale})`,
						}}
					>
						<svg viewBox="0 0 16 16" fill="none" style={effectToggleIcon}>
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

const EffectHeader: React.FC<{
	readonly label: string;
	readonly enabled: boolean;
	readonly expandProgress?: number;
	readonly highlightOpacity?: number;
	readonly iconScale?: number;
}> = ({
	label,
	enabled,
	expandProgress = 1,
	highlightOpacity = 0,
	iconScale,
}) => {
	return (
		<div
			style={{
				...effectLabel,
				backgroundColor: getHighlightBackground(highlightOpacity),
			}}
		>
			<div style={effectHeaderContent}>
				<EffectToggle enabled={enabled} iconScale={iconScale} />
				<EffectArrow expandProgress={expandProgress} />
				{label}
			</div>
		</div>
	);
};

const EffectProperties: React.FC<{
	readonly children: React.ReactNode;
	readonly expandProgress?: number;
	readonly rowCount: number;
}> = ({children, expandProgress = 1, rowCount}) => {
	return (
		<div
			style={{
				height: rowCount * PARAM_ROW_HEIGHT * expandProgress,
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

const OriginKnob: React.FC<{
	readonly frame: number;
	readonly originY: number;
}> = ({frame, originY}) => {
	const progress = getOriginKnobProgress(frame);
	const scale = interpolate(progress, [0, 1], [0.42, 1], clamp);
	const centerX = WIDTH * 0.5;
	const centerY = TOP_HEIGHT * originY;

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
			<circle
				cx={centerX}
				cy={centerY}
				r={ORIGIN_KNOB_RADIUS * scale}
				fill="white"
				stroke={STUDIO_BLUE}
				strokeWidth={ORIGIN_KNOB_STROKE_WIDTH}
				vectorEffect="non-scaling-stroke"
			/>
		</svg>
	);
};

const StudioUi: React.FC<{
	readonly frame: number;
	readonly originY: number;
	readonly rotation: number;
	readonly halftoneDotSize: number;
	readonly halftoneShape: 'circle' | 'line';
}> = ({frame, originY, rotation, halftoneDotSize, halftoneShape}) => {
	const rotationKeyframed = frame >= KEYFRAME_SET_FRAME;
	const starburstEnabled = frame >= STARBURST_ENABLE_FRAME;
	const halftoneEnabled = frame >= HALFTONE_ENABLE_FRAME;
	const starburstHighlightOpacity = getHighlightOpacity({
		frame,
		start: STARBURST_ENABLE_FRAME,
		end: STARBURST_ENABLE_FRAME + EFFECT_EXPAND_DURATION + 10,
	});
	const originHighlightOpacity = getHighlightOpacity({
		frame,
		start: ORIGIN_MOVE_START,
		end: ORIGIN_MOVE_END,
	});
	const rotationHighlightOpacity = getHighlightOpacity({
		frame,
		start: KEYFRAME_SET_FRAME,
		end: ROTATION_START + ROTATION_DURATION + 20,
	});
	const halftoneHighlightOpacity = getHighlightOpacity({
		frame,
		start: HALFTONE_ENABLE_FRAME,
		end: HALFTONE_ENABLE_FRAME + EFFECT_EXPAND_DURATION + 10,
	});
	const dotSizeHighlightOpacity = getHighlightOpacity({
		frame,
		start: HALFTONE_DOT_SIZE_TWEAK_START,
		end: HALFTONE_DOT_SIZE_TWEAK_END,
	});
	const shapeHighlightOpacity = getHighlightOpacity({
		frame,
		start: HALFTONE_SHAPE_TWEAK_FRAME,
		end: HALFTONE_SHAPE_TWEAK_HIGHLIGHT_END,
	});
	const starburstExpandProgress = interpolate(
		frame,
		[STARBURST_ENABLE_FRAME, STARBURST_ENABLE_FRAME + EFFECT_EXPAND_DURATION],
		[0, 1],
		{
			...clamp,
			easing: Easing.bezier(0.16, 1, 0.3, 1),
		},
	);
	const starburstIconScale = interpolate(
		frame,
		[
			STARBURST_ENABLE_FRAME,
			STARBURST_ENABLE_FRAME + 5,
			STARBURST_ENABLE_FRAME + FX_ICON_JUMP_DURATION,
		],
		[0, 1.35, 1],
		clamp,
	);
	const halftoneExpandProgress = interpolate(
		frame,
		[HALFTONE_ENABLE_FRAME, HALFTONE_ENABLE_FRAME + EFFECT_EXPAND_DURATION],
		[0, 1],
		{
			...clamp,
			easing: Easing.bezier(0.16, 1, 0.3, 1),
		},
	);
	const halftoneIconScale = interpolate(
		frame,
		[
			HALFTONE_ENABLE_FRAME,
			HALFTONE_ENABLE_FRAME + 5,
			HALFTONE_ENABLE_FRAME + FX_ICON_JUMP_DURATION,
		],
		[0, 1.35, 1],
		clamp,
	);

	return (
		<div style={studioPanel}>
			<div style={studioBody}>
				<div style={inspector}>
					<div style={paramsPanel}>
						<EffectHeader
							label="starburst()"
							enabled={starburstEnabled}
							expandProgress={starburstExpandProgress}
							highlightOpacity={starburstHighlightOpacity}
							iconScale={starburstIconScale}
						/>
						<EffectProperties
							rowCount={5}
							expandProgress={starburstExpandProgress}
						>
							<ParamRow label="Rays">
								<div style={{...fieldBox, width: 120}}>{RAYS}</div>
							</ParamRow>
							<ParamRow label="Colors">
								<ColorsValue />
							</ParamRow>
							<ParamRow
								label="Rotation"
								activeDiamond={rotationKeyframed}
								highlightOpacity={rotationHighlightOpacity}
							>
								<div
									style={{
										...fieldBox,
										width: 130,
									}}
								>
									{formatDegrees(rotation)}
								</div>
							</ParamRow>
							<ParamRow label="Smoothness">
								<div style={{...fieldBox, width: 120}}>0</div>
							</ParamRow>
							<ParamRow
								label="Origin"
								highlightOpacity={originHighlightOpacity}
							>
								<div style={tinyFieldBox}>0.50</div>
								<div style={{...tinyFieldBox, marginLeft: 10}}>
									{formatNumber(originY)}
								</div>
							</ParamRow>
						</EffectProperties>
						<EffectHeader
							label="halftone()"
							enabled={halftoneEnabled}
							expandProgress={halftoneExpandProgress}
							highlightOpacity={halftoneHighlightOpacity}
							iconScale={halftoneIconScale}
						/>
						<EffectProperties
							rowCount={HALFTONE_PARAM_ROWS}
							expandProgress={halftoneExpandProgress}
						>
							<ParamRow label="Shape" highlightOpacity={shapeHighlightOpacity}>
								<EnumValue value={halftoneShape} />
							</ParamRow>
							<ParamRow
								label="Dot Size"
								highlightOpacity={dotSizeHighlightOpacity}
							>
								<div style={{...fieldBox, width: 120}}>
									{Math.round(halftoneDotSize)}
								</div>
							</ParamRow>
							<ParamRow label="Dot Spacing">
								<div style={{...fieldBox, width: 120}}>
									{HALFTONE_DOT_SPACING}
								</div>
							</ParamRow>
							<ParamRow label="Dot Color">
								<div style={colorsField}>
									<div
										style={{
											...swatch,
											backgroundColor: HALFTONE_DOT_COLOR,
										}}
									/>
								</div>
							</ParamRow>
						</EffectProperties>
					</div>
				</div>
			</div>
		</div>
	);
};

export const StarburstEffectShowcase: React.FC = () => {
	const frame = useCurrentFrame();
	const originY = getOriginY(frame);
	const rotation = getRotation(frame);
	const halftoneDotSize = getHalftoneDotSize(frame);
	const halftoneShape = getHalftoneShape(frame);
	const origin: readonly [number, number] = [0.5, originY];
	const starburstProgress = getTransitionProgress(
		frame,
		STARBURST_ENABLE_FRAME,
	);
	const halftoneProgress = getTransitionProgress(frame, HALFTONE_ENABLE_FRAME);
	const lineShapeProgress = getTransitionProgress(
		frame,
		HALFTONE_SHAPE_TWEAK_FRAME,
	);
	const baseOpacity = 1;
	const starburstOpacity = starburstProgress;
	const halftoneCircleOpacity = starburstProgress * halftoneProgress;
	const halftoneLineOpacity =
		starburstProgress * halftoneProgress * lineShapeProgress;

	return (
		<AbsoluteFill style={{backgroundColor: PANEL_BG}}>
			<div style={topHalf}>
				<Solid
					width={WIDTH}
					height={TOP_HEIGHT}
					color={SOLID_CREAM}
					style={{...previewLayerStyle, opacity: baseOpacity}}
				/>
				<Solid
					width={WIDTH}
					height={TOP_HEIGHT}
					color={SOLID_CREAM}
					style={{...previewLayerStyle, opacity: starburstOpacity}}
					effects={[
						starburst({
							rays: RAYS,
							colors: STARBURST_COLORS,
							rotation,
							origin,
						}),
					]}
				/>
				<Solid
					width={WIDTH}
					height={TOP_HEIGHT}
					color={SOLID_CREAM}
					style={{
						...previewLayerStyle,
						opacity: halftoneCircleOpacity,
					}}
					effects={[
						starburst({
							rays: RAYS,
							colors: STARBURST_COLORS,
							rotation,
							origin,
						}),
						halftone({
							shape: 'circle',
							dotSize: halftoneDotSize,
							dotSpacing: HALFTONE_DOT_SPACING,
							dotColor: HALFTONE_DOT_COLOR,
						}),
					]}
				/>
				<Solid
					width={WIDTH}
					height={TOP_HEIGHT}
					color={SOLID_CREAM}
					style={{...previewLayerStyle, opacity: halftoneLineOpacity}}
					effects={[
						starburst({
							rays: RAYS,
							colors: STARBURST_COLORS,
							rotation,
							origin,
						}),
						halftone({
							shape: 'line',
							dotSize: halftoneDotSize,
							dotSpacing: HALFTONE_DOT_SPACING,
							dotColor: HALFTONE_DOT_COLOR,
						}),
					]}
				/>
				<OriginKnob frame={frame} originY={originY} />
			</div>
			<StudioUi
				frame={frame}
				originY={originY}
				rotation={rotation}
				halftoneDotSize={halftoneDotSize}
				halftoneShape={halftoneShape}
			/>
			<ShowcaseCursor frame={frame} />
		</AbsoluteFill>
	);
};
