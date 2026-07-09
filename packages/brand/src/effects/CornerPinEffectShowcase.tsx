import {cornerPin} from '@remotion/effects/corner-pin';
import React from 'react';
import {
	AbsoluteFill,
	Easing,
	HtmlInCanvas,
	Img,
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
} from './EffectShowcaseScaffold';

const BILLBOARD_ASPECT_RATIO = '48 / 14';
const BILLBOARD_SOURCE_WIDTH = 2400;
const BILLBOARD_SOURCE_HEIGHT = Math.round((2400 / 48) * 14);
const BILLBOARD_PLATE_SCALE = 0.378;
const BILLBOARD_PLATE_TRANSLATE_X = -683.5;
const BILLBOARD_PLATE_TRANSLATE_Y = -119.4;

const ENABLE_FRAME = 30;
const ENABLE_RELEASE_FRAME = ENABLE_FRAME + 6;
const TOP_LEFT_START = 78;
const TOP_RIGHT_START = 132;
const BOTTOM_RIGHT_START = 186;
const BOTTOM_LEFT_START = 240;
const CORNER_MOVE_DURATION = 40;
const OPACITY_START = BOTTOM_LEFT_START + CORNER_MOVE_DURATION + 24;
const OPACITY_END = OPACITY_START + 48;
const CURSOR_IN_FRAME = 0;
const CURSOR_OUT_FRAME = OPACITY_END + 24;
const CORNER_PARAM_FONT_SIZE = 38;
const CORNER_PARAM_ROW_HEIGHT = 75;
const CORNER_KEYFRAME_DIAMOND_SIZE = 28;
const CORNER_EFFECT_ARROW_SIZE = 29;
const CORNER_EFFECT_HEADER_LEFT_PADDING = 173.5;
const CORNER_EFFECT_TOGGLE_SIZE = 45;
const CORNER_EFFECT_TOGGLE_ICON_SIZE = 39;
const CORNER_LABEL_WIDTH = 250;

const TOP_LEFT: readonly [number, number] = [0.15, 0.168];
const TOP_RIGHT: readonly [number, number] = [0.627, 0.212];
const BOTTOM_RIGHT: readonly [number, number] = [0.626, 0.755];
const BOTTOM_LEFT: readonly [number, number] = [0.147, 0.727];

const DEFAULT_TOP_LEFT: readonly [number, number] = [0, 0];
const DEFAULT_TOP_RIGHT: readonly [number, number] = [1, 0];
const DEFAULT_BOTTOM_RIGHT: readonly [number, number] = [1, 1];
const DEFAULT_BOTTOM_LEFT: readonly [number, number] = [0, 1];

const CORNER_STARTS = {
	topLeft: TOP_LEFT_START,
	topRight: TOP_RIGHT_START,
	bottomRight: BOTTOM_RIGHT_START,
	bottomLeft: BOTTOM_LEFT_START,
} as const;

export const cornerPinEffectShowcaseDurationInFrames = 390;

const fullscreenImage: React.CSSProperties = {
	height: '100%',
	left: 0,
	position: 'absolute',
	top: 0,
	width: '100%',
};

const backgroundImage: React.CSSProperties = {
	...fullscreenImage,
	objectFit: 'cover',
};

const previewViewport: React.CSSProperties = {
	height: TOP_HEIGHT,
	left: 0,
	overflow: 'hidden',
	position: 'absolute',
	top: 0,
	width: WIDTH,
};

const foregroundPlate: React.CSSProperties = {
	alignItems: 'center',
	aspectRatio: BILLBOARD_ASPECT_RATIO,
	display: 'flex',
	height: BILLBOARD_SOURCE_HEIGHT,
	justifyContent: 'center',
	left: 0,
	position: 'absolute',
	scale: BILLBOARD_PLATE_SCALE,
	top: 0,
	translate: `${BILLBOARD_PLATE_TRANSLATE_X}px ${BILLBOARD_PLATE_TRANSLATE_Y}px`,
	width: BILLBOARD_SOURCE_WIDTH,
};

const sourcePlate: React.CSSProperties = {
	alignItems: 'center',
	backgroundColor: 'white',
	display: 'flex',
	height: '100%',
	justifyContent: 'center',
	width: '100%',
};

const sourceLogo: React.CSSProperties = {
	width: '50%',
};

const sourceUvKnob: React.CSSProperties = {
	...foregroundPlate,
	overflow: 'visible',
	pointerEvents: 'none',
};

const fieldPair: React.CSSProperties = {
	display: 'flex',
	gap: 10,
};

const field: React.CSSProperties = {
	...fieldBox,
	fontSize: CORNER_PARAM_FONT_SIZE,
	height: 48,
	width: 112,
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

const getCorner = (
	frame: number,
	start: readonly [number, number],
	end: readonly [number, number],
	moveStart: number,
): readonly [number, number] => {
	return [
		interpolate(
			frame,
			[moveStart, moveStart + CORNER_MOVE_DURATION],
			[start[0], end[0]],
			{
				...clamp,
				easing: Easing.bezier(0.16, 1, 0.3, 1),
			},
		),
		interpolate(
			frame,
			[moveStart, moveStart + CORNER_MOVE_DURATION],
			[start[1], end[1]],
			{
				...clamp,
				easing: Easing.bezier(0.16, 1, 0.3, 1),
			},
		),
	];
};

const getCorners = (frame: number) => {
	return {
		topLeft: getCorner(frame, DEFAULT_TOP_LEFT, TOP_LEFT, TOP_LEFT_START),
		topRight: getCorner(frame, DEFAULT_TOP_RIGHT, TOP_RIGHT, TOP_RIGHT_START),
		bottomRight: getCorner(
			frame,
			DEFAULT_BOTTOM_RIGHT,
			BOTTOM_RIGHT,
			BOTTOM_RIGHT_START,
		),
		bottomLeft: getCorner(
			frame,
			DEFAULT_BOTTOM_LEFT,
			BOTTOM_LEFT,
			BOTTOM_LEFT_START,
		),
	};
};

const mapBillboardUvToPreview = (
	uv: readonly [number, number],
): CursorPoint => {
	const sourceX = BILLBOARD_SOURCE_WIDTH * uv[0];
	const sourceY = BILLBOARD_SOURCE_HEIGHT * uv[1];
	const centerX = BILLBOARD_SOURCE_WIDTH / 2;
	const centerY = BILLBOARD_SOURCE_HEIGHT / 2;

	return {
		frame: 0,
		x:
			BILLBOARD_PLATE_TRANSLATE_X +
			centerX +
			(sourceX - centerX) * BILLBOARD_PLATE_SCALE,
		y:
			BILLBOARD_PLATE_TRANSLATE_Y +
			centerY +
			(sourceY - centerY) * BILLBOARD_PLATE_SCALE,
	};
};

const cornerDrags = [
	{
		start: TOP_LEFT_START,
		from: DEFAULT_TOP_LEFT,
		to: TOP_LEFT,
	},
	{
		start: TOP_RIGHT_START,
		from: DEFAULT_TOP_RIGHT,
		to: TOP_RIGHT,
	},
	{
		start: BOTTOM_RIGHT_START,
		from: DEFAULT_BOTTOM_RIGHT,
		to: BOTTOM_RIGHT,
	},
	{
		start: BOTTOM_LEFT_START,
		from: DEFAULT_BOTTOM_LEFT,
		to: BOTTOM_LEFT,
	},
] as const;

const cursorPoints = [
	{frame: 0, x: 84, y: 1010},
	{frame: ENABLE_FRAME - 8, x: 201, y: TOP_HEIGHT + 35},
	{frame: ENABLE_FRAME + 8, x: 201, y: TOP_HEIGHT + 35},
	{
		...mapBillboardUvToPreview(DEFAULT_TOP_LEFT),
		frame: TOP_LEFT_START - 12,
	},
	{...mapBillboardUvToPreview(DEFAULT_TOP_LEFT), frame: TOP_LEFT_START},
	{
		...mapBillboardUvToPreview(TOP_LEFT),
		frame: TOP_LEFT_START + CORNER_MOVE_DURATION + 8,
	},
	{
		...mapBillboardUvToPreview(DEFAULT_TOP_RIGHT),
		frame: TOP_RIGHT_START - 12,
	},
	{...mapBillboardUvToPreview(DEFAULT_TOP_RIGHT), frame: TOP_RIGHT_START},
	{
		...mapBillboardUvToPreview(TOP_RIGHT),
		frame: TOP_RIGHT_START + CORNER_MOVE_DURATION + 8,
	},
	{
		...mapBillboardUvToPreview(DEFAULT_BOTTOM_RIGHT),
		frame: BOTTOM_RIGHT_START - 12,
	},
	{
		...mapBillboardUvToPreview(DEFAULT_BOTTOM_RIGHT),
		frame: BOTTOM_RIGHT_START,
	},
	{
		...mapBillboardUvToPreview(BOTTOM_RIGHT),
		frame: BOTTOM_RIGHT_START + CORNER_MOVE_DURATION + 8,
	},
	{
		...mapBillboardUvToPreview(DEFAULT_BOTTOM_LEFT),
		frame: BOTTOM_LEFT_START - 12,
	},
	{...mapBillboardUvToPreview(DEFAULT_BOTTOM_LEFT), frame: BOTTOM_LEFT_START},
	{
		...mapBillboardUvToPreview(BOTTOM_LEFT),
		frame: BOTTOM_LEFT_START + CORNER_MOVE_DURATION + 8,
	},
	{frame: CURSOR_OUT_FRAME, x: 940, y: 1180},
] as const satisfies readonly CursorPoint[];

const getCursorPoint = (frame: number): CursorPoint => {
	for (const drag of cornerDrags) {
		if (frame >= drag.start && frame <= drag.start + CORNER_MOVE_DURATION) {
			const point = mapBillboardUvToPreview(
				getCorner(frame, drag.from, drag.to, drag.start),
			);

			return {...point, frame};
		}
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
		cornerDrags.some(
			(drag) =>
				frame >= drag.start && frame <= drag.start + CORNER_MOVE_DURATION,
		)
	);
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
			<CursorGlyph cursor="default" scale={1} cursorScale={2.5} />
		</div>
	);
};

const CoordinateFields: React.FC<{
	readonly value: readonly [number, number];
}> = ({value}) => {
	return (
		<div style={fieldPair}>
			<div style={field}>{formatNumber(value[0])}</div>
			<div style={field}>{formatNumber(value[1])}</div>
		</div>
	);
};

const CornerRow: React.FC<{
	readonly frame: number;
	readonly label: string;
	readonly moveStart: number;
	readonly value: readonly [number, number];
}> = ({frame, label, moveStart, value}) => {
	return (
		<ParamRow
			label={label}
			activeDiamond={frame >= moveStart}
			fontSize={CORNER_PARAM_FONT_SIZE}
			highlightOpacity={getHighlightOpacity({
				frame,
				start: moveStart,
				end: moveStart + CORNER_MOVE_DURATION,
			})}
			keyframeDiamondSize={CORNER_KEYFRAME_DIAMOND_SIZE}
			labelWidth={CORNER_LABEL_WIDTH}
			rowHeight={CORNER_PARAM_ROW_HEIGHT}
		>
			<CoordinateFields value={value} />
		</ParamRow>
	);
};

const StudioUi: React.FC<{
	readonly frame: number;
	readonly corners: ReturnType<typeof getCorners>;
}> = ({frame, corners}) => {
	const enabled = frame >= ENABLE_RELEASE_FRAME;
	const expandProgress = getExpandProgress(frame, ENABLE_RELEASE_FRAME);

	return (
		<>
			<EffectHeader
				label="cornerPin()"
				enabled={enabled}
				arrowSize={CORNER_EFFECT_ARROW_SIZE}
				contentPaddingLeft={CORNER_EFFECT_HEADER_LEFT_PADDING}
				expandProgress={expandProgress}
				fontSize={CORNER_PARAM_FONT_SIZE}
				highlightOpacity={getHighlightOpacity({
					frame,
					start: ENABLE_FRAME,
					end: ENABLE_FRAME + 24,
				})}
				iconScale={getToggleIconScale(frame, ENABLE_RELEASE_FRAME - 1)}
				toggleIconSize={CORNER_EFFECT_TOGGLE_ICON_SIZE}
				toggleSize={CORNER_EFFECT_TOGGLE_SIZE}
			/>
			<EffectProperties
				rowCount={4}
				expandProgress={expandProgress}
				rowHeight={CORNER_PARAM_ROW_HEIGHT}
			>
				<CornerRow
					frame={frame}
					label="Top left"
					moveStart={CORNER_STARTS.topLeft}
					value={corners.topLeft}
				/>
				<CornerRow
					frame={frame}
					label="Top right"
					moveStart={CORNER_STARTS.topRight}
					value={corners.topRight}
				/>
				<CornerRow
					frame={frame}
					label="Bottom right"
					moveStart={CORNER_STARTS.bottomRight}
					value={corners.bottomRight}
				/>
				<CornerRow
					frame={frame}
					label="Bottom left"
					moveStart={CORNER_STARTS.bottomLeft}
					value={corners.bottomLeft}
				/>
			</EffectProperties>
		</>
	);
};

const BillboardArtwork: React.FC<{
	readonly corners: ReturnType<typeof getCorners>;
	readonly enabled: boolean;
	readonly opacity: number;
}> = ({corners, enabled, opacity}) => {
	return (
		<HtmlInCanvas
			width={BILLBOARD_SOURCE_WIDTH}
			height={BILLBOARD_SOURCE_HEIGHT}
			style={foregroundPlate}
			pixelDensity={2}
			effects={[
				cornerPin({
					...corners,
					disabled: !enabled,
				}),
			]}
		>
			<AbsoluteFill style={{...sourcePlate, opacity}}>
				<Img
					src={staticFile('effects-experiments/element-0.png')}
					style={sourceLogo}
				/>
			</AbsoluteFill>
		</HtmlInCanvas>
	);
};

const SourceUvKnob: React.FC<{
	readonly activeEnd: number;
	readonly frame: number;
	readonly uv: readonly [number, number];
	readonly activeStart: number;
}> = ({activeEnd, frame, uv, activeStart}) => {
	const progress = interpolate(
		frame,
		[ENABLE_RELEASE_FRAME, ENABLE_RELEASE_FRAME + 12],
		[0, 1],
		clamp,
	);
	const activeProgress = getHighlightOpacity({
		frame,
		start: activeStart,
		end: activeEnd,
		fadeDuration: 10,
	});
	const scale = interpolate(activeProgress, [0, 1], [0.78, 1.18], clamp);

	if (progress <= 0) {
		return null;
	}

	return (
		<svg
			width={BILLBOARD_SOURCE_WIDTH}
			height={BILLBOARD_SOURCE_HEIGHT}
			viewBox={`0 0 ${BILLBOARD_SOURCE_WIDTH} ${BILLBOARD_SOURCE_HEIGHT}`}
			style={{...sourceUvKnob, opacity: progress}}
		>
			<circle
				cx={BILLBOARD_SOURCE_WIDTH * uv[0]}
				cy={BILLBOARD_SOURCE_HEIGHT * uv[1]}
				r={(12 * scale) / BILLBOARD_PLATE_SCALE}
				fill="white"
				stroke="#0b84f3"
				strokeWidth={4 / BILLBOARD_PLATE_SCALE}
				vectorEffect="non-scaling-stroke"
			/>
		</svg>
	);
};

export const CornerPinEffectShowcase: React.FC = () => {
	const frame = useCurrentFrame();
	const corners = getCorners(frame);
	const opacity = interpolate(frame, [OPACITY_START, OPACITY_END], [0.6, 1], {
		...clamp,
		easing: Easing.bezier(0.16, 1, 0.3, 1),
	});

	return (
		<>
			<EffectShowcaseShell
				preview={
					<div style={previewViewport}>
						<Img
							src={staticFile('effects-experiments/bulletin-billboard.jpg')}
							style={backgroundImage}
						/>
						<BillboardArtwork
							corners={corners}
							enabled={frame >= ENABLE_RELEASE_FRAME}
							opacity={opacity}
						/>
						<SourceUvKnob
							frame={frame}
							uv={corners.topLeft}
							activeStart={TOP_LEFT_START}
							activeEnd={TOP_LEFT_START + CORNER_MOVE_DURATION}
						/>
						<SourceUvKnob
							frame={frame}
							uv={corners.topRight}
							activeStart={TOP_RIGHT_START}
							activeEnd={TOP_RIGHT_START + CORNER_MOVE_DURATION}
						/>
						<SourceUvKnob
							frame={frame}
							uv={corners.bottomRight}
							activeStart={BOTTOM_RIGHT_START}
							activeEnd={BOTTOM_RIGHT_START + CORNER_MOVE_DURATION}
						/>
						<SourceUvKnob
							frame={frame}
							uv={corners.bottomLeft}
							activeStart={BOTTOM_LEFT_START}
							activeEnd={BOTTOM_LEFT_START + CORNER_MOVE_DURATION}
						/>
					</div>
				}
				studio={<StudioUi frame={frame} corners={corners} />}
			/>
			<ShowcaseCursor frame={frame} />
		</>
	);
};
