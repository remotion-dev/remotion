import {pattern} from '@remotion/effects/pattern';
import React from 'react';
import {
	Easing,
	HtmlInCanvas,
	Img,
	Solid,
	interpolate,
	staticFile,
	useCurrentFrame,
} from 'remotion';
import {CursorGlyph} from '../CanvasCapturePreview';
import {
	EffectHeader,
	EffectProperties,
	EffectShowcaseShell,
	ParamRow,
	TOP_HEIGHT,
	WIDTH,
	clamp,
	fieldBox,
	formatNumber,
	getExpandProgress,
	getHighlightOpacity,
	getToggleIconScale,
	getTransitionProgress,
} from './EffectShowcaseScaffold';

const ACTION_DELAY = 30;
const ENABLE_FRAME = 30 + ACTION_DELAY;
const ENABLE_RELEASE_FRAME = ENABLE_FRAME + 6;
const ROW_OFFSET_START = 78 + ACTION_DELAY;
const ROW_OFFSET_END = 126 + ACTION_DELAY;
const OFFSET_V_KEYFRAME_SET_FRAME = 156 + ACTION_DELAY;
const OFFSET_V_START = 174 + ACTION_DELAY;
const OFFSET_V_END = 300 + ACTION_DELAY;
const CURSOR_IN_FRAME = 0;
const CURSOR_OUT_FRAME = 336 + ACTION_DELAY;
const ROW_OFFSET_CURSOR_RESIZE_LEAD = 12;
const OFFSET_V_CURSOR_RESIZE_LEAD = 1;
const VALUE_DRAG_START_X = 472;
const VALUE_DRAG_END_X = VALUE_DRAG_START_X + (568 - VALUE_DRAG_START_X) * 2.5;
const PATTERN_PARAM_FONT_SIZE = 38;
const PATTERN_PARAM_ROW_HEIGHT = 75;
const PATTERN_KEYFRAME_DIAMOND_SIZE = 28;
const PATTERN_EFFECT_ARROW_SIZE = 29;
const PATTERN_EFFECT_HEADER_LEFT_PADDING = 173.5;
const PATTERN_EFFECT_TOGGLE_SIZE = 45;
const PATTERN_EFFECT_TOGGLE_ICON_SIZE = 39;
const PATTERN_ROW_OFFSET_Y = TOP_HEIGHT + 70 + PATTERN_PARAM_ROW_HEIGHT * 1.5;
const PATTERN_OFFSET_V_Y = TOP_HEIGHT + 70 + PATTERN_PARAM_ROW_HEIGHT * 2.5;

const ROW_OFFSET_START_VALUE = 0;
const ROW_OFFSET_END_VALUE = 67;
const OFFSET_U = 0;
const OFFSET_V_START_VALUE = 0;
const OFFSET_V_END_VALUE = 1.71;

export const patternEffectShowcaseDurationInFrames = 390;

const sourceImage: React.CSSProperties = {
	height: 852,
	position: 'absolute',
	rotate: '0',
	scale: 0.59,
	translate: '124.9px -83.6px',
	width: 830,
};

const field: React.CSSProperties = {
	...fieldBox,
	fontSize: PATTERN_PARAM_FONT_SIZE,
	height: 48,
	width: 130,
};

const previewLayer: React.CSSProperties = {
	left: 0,
	position: 'absolute',
	top: 0,
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

const cursorPoints = [
	{frame: 0, x: 84, y: 1010},
	{frame: ENABLE_FRAME - 8, x: 201, y: TOP_HEIGHT + 35},
	{frame: ENABLE_FRAME + 8, x: 201, y: TOP_HEIGHT + 35},
	{frame: ROW_OFFSET_START - 12, x: 472, y: PATTERN_ROW_OFFSET_Y},
	{frame: ROW_OFFSET_START, x: 472, y: PATTERN_ROW_OFFSET_Y},
	{frame: ROW_OFFSET_END, x: VALUE_DRAG_END_X, y: PATTERN_ROW_OFFSET_Y},
	{frame: ROW_OFFSET_END + 10, x: VALUE_DRAG_END_X, y: PATTERN_ROW_OFFSET_Y},
	{
		frame: OFFSET_V_KEYFRAME_SET_FRAME - 8,
		x: 246,
		y: PATTERN_OFFSET_V_Y,
	},
	{
		frame: OFFSET_V_KEYFRAME_SET_FRAME + 8,
		x: 246,
		y: PATTERN_OFFSET_V_Y,
	},
	{frame: OFFSET_V_START, x: 472, y: PATTERN_OFFSET_V_Y},
	{frame: OFFSET_V_END, x: VALUE_DRAG_END_X, y: PATTERN_OFFSET_V_Y},
	{frame: OFFSET_V_END + 18, x: VALUE_DRAG_END_X, y: PATTERN_OFFSET_V_Y},
	{frame: CURSOR_OUT_FRAME, x: 940, y: 1180},
] as const satisfies readonly CursorPoint[];

const getRowOffset = (frame: number) => {
	return interpolate(
		frame,
		[ROW_OFFSET_START, ROW_OFFSET_END],
		[ROW_OFFSET_START_VALUE, ROW_OFFSET_END_VALUE],
		{
			...clamp,
			easing: Easing.bezier(0.42, 0, 0.58, 1),
		},
	);
};

const getOffsetV = (frame: number) => {
	return interpolate(
		frame,
		[OFFSET_V_START, OFFSET_V_END],
		[OFFSET_V_START_VALUE, OFFSET_V_END_VALUE],
		{
			...clamp,
			easing: Easing.bezier(0.5217, 0.2168, 0.7399, 0.6284),
		},
	);
};

const getCursorPoint = (frame: number): CursorPoint => {
	if (frame >= ROW_OFFSET_START && frame <= ROW_OFFSET_END) {
		const progress =
			(getRowOffset(frame) - ROW_OFFSET_START_VALUE) /
			(ROW_OFFSET_END_VALUE - ROW_OFFSET_START_VALUE);

		return {
			frame,
			x: interpolate(progress, [0, 1], [VALUE_DRAG_START_X, VALUE_DRAG_END_X]),
			y: PATTERN_ROW_OFFSET_Y,
		};
	}

	if (frame >= OFFSET_V_START && frame <= OFFSET_V_END) {
		const progress =
			(getOffsetV(frame) - OFFSET_V_START_VALUE) /
			(OFFSET_V_END_VALUE - OFFSET_V_START_VALUE);

		return {
			frame,
			x: interpolate(progress, [0, 1], [VALUE_DRAG_START_X, VALUE_DRAG_END_X]),
			y: PATTERN_OFFSET_V_Y,
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
		(frame >= ENABLE_FRAME - 1 && frame <= ENABLE_FRAME + 5) ||
		(frame >= OFFSET_V_KEYFRAME_SET_FRAME - 1 &&
			frame <= OFFSET_V_KEYFRAME_SET_FRAME + 5) ||
		(frame >= ROW_OFFSET_START && frame <= ROW_OFFSET_END) ||
		(frame >= OFFSET_V_START && frame <= OFFSET_V_END)
	);
};

const getCursor = (frame: number) => {
	if (
		(frame >= ROW_OFFSET_START - ROW_OFFSET_CURSOR_RESIZE_LEAD &&
			frame <= ROW_OFFSET_END) ||
		(frame >= OFFSET_V_START - OFFSET_V_CURSOR_RESIZE_LEAD &&
			frame <= OFFSET_V_END)
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

const PatternSource: React.FC = () => {
	return (
		<Img
			src={staticFile('effects-experiments/pattern-remotion.png')}
			style={sourceImage}
		/>
	);
};

const StudioUi: React.FC<{
	readonly frame: number;
	readonly rowOffset: number;
	readonly offsetV: number;
}> = ({frame, rowOffset, offsetV}) => {
	const enabled = frame >= ENABLE_RELEASE_FRAME;
	const expandProgress = getExpandProgress(frame, ENABLE_RELEASE_FRAME);
	const offsetVKeyframed = frame >= OFFSET_V_KEYFRAME_SET_FRAME;

	return (
		<>
			<EffectHeader
				label="pattern()"
				enabled={enabled}
				arrowSize={PATTERN_EFFECT_ARROW_SIZE}
				contentPaddingLeft={PATTERN_EFFECT_HEADER_LEFT_PADDING}
				expandProgress={expandProgress}
				fontSize={PATTERN_PARAM_FONT_SIZE}
				highlightOpacity={getHighlightOpacity({
					frame,
					start: ENABLE_FRAME,
					end: ENABLE_FRAME + 24,
				})}
				iconScale={getToggleIconScale(frame, ENABLE_RELEASE_FRAME - 1)}
				toggleIconSize={PATTERN_EFFECT_TOGGLE_ICON_SIZE}
				toggleSize={PATTERN_EFFECT_TOGGLE_SIZE}
			/>
			<EffectProperties
				rowCount={3}
				expandProgress={expandProgress}
				rowHeight={PATTERN_PARAM_ROW_HEIGHT}
			>
				<ParamRow
					label="Offset U"
					fontSize={PATTERN_PARAM_FONT_SIZE}
					keyframeDiamondSize={PATTERN_KEYFRAME_DIAMOND_SIZE}
					rowHeight={PATTERN_PARAM_ROW_HEIGHT}
				>
					<div style={field}>{formatNumber(OFFSET_U)}</div>
				</ParamRow>
				<ParamRow
					label="Row offset"
					fontSize={PATTERN_PARAM_FONT_SIZE}
					highlightOpacity={getHighlightOpacity({
						frame,
						start: ROW_OFFSET_START,
						end: ROW_OFFSET_END,
					})}
					keyframeDiamondSize={PATTERN_KEYFRAME_DIAMOND_SIZE}
					rowHeight={PATTERN_PARAM_ROW_HEIGHT}
				>
					<div style={field}>{Math.round(rowOffset)}</div>
				</ParamRow>
				<ParamRow
					label="Offset V"
					activeDiamond={offsetVKeyframed}
					fontSize={PATTERN_PARAM_FONT_SIZE}
					highlightOpacity={getHighlightOpacity({
						frame,
						start: OFFSET_V_KEYFRAME_SET_FRAME,
						end: OFFSET_V_END,
					})}
					keyframeDiamondSize={PATTERN_KEYFRAME_DIAMOND_SIZE}
					rowHeight={PATTERN_PARAM_ROW_HEIGHT}
				>
					<div style={field}>{formatNumber(offsetV)}</div>
				</ParamRow>
			</EffectProperties>
		</>
	);
};

export const PatternEffectShowcase: React.FC = () => {
	const frame = useCurrentFrame();
	const rowOffset = getRowOffset(frame);
	const offsetV = getOffsetV(frame);
	const enabled = frame >= ENABLE_RELEASE_FRAME;
	const patternOpacity = getTransitionProgress(frame, ENABLE_RELEASE_FRAME);
	const sourceOpacity = 1 - patternOpacity;

	return (
		<>
			<EffectShowcaseShell
				preview={
					<>
						<Solid
							width={WIDTH}
							height={TOP_HEIGHT}
							color="#e8fbff"
							style={previewLayer}
						/>
						<HtmlInCanvas
							width={WIDTH}
							height={TOP_HEIGHT}
							style={{...previewLayer, opacity: sourceOpacity}}
						>
							<PatternSource />
						</HtmlInCanvas>
						<HtmlInCanvas
							width={WIDTH}
							height={TOP_HEIGHT}
							style={{...previewLayer, opacity: patternOpacity}}
							effects={[
								pattern({
									offsetU: OFFSET_U,
									rowOffset,
									offsetV,
									disabled: !enabled,
								}),
							]}
						>
							<PatternSource />
						</HtmlInCanvas>
					</>
				}
				studio={
					<StudioUi frame={frame} rowOffset={rowOffset} offsetV={offsetV} />
				}
			/>
			<ShowcaseCursor frame={frame} />
		</>
	);
};
