import {grayscale} from '@remotion/effects/grayscale';
import {pixelDissolve} from '@remotion/effects/pixel-dissolve';
import {fontFamily, loadFont} from '@remotion/google-fonts/GeistMono';
import React from 'react';
import {
	Easing,
	Img,
	Interactive,
	Solid,
	interpolate,
	staticFile,
	useCurrentFrame,
} from 'remotion';
import {CursorGlyph} from './CanvasCapturePreview';
import {
	EffectHeader,
	EffectProperties,
	EffectShowcaseShell,
	ParamRow,
	TOP_HEIGHT as EFFECT_SHOWCASE_TOP_HEIGHT,
	WIDTH as EFFECT_SHOWCASE_WIDTH,
	clamp,
	fieldBox,
	formatNumber,
	getExpandProgress,
	getHighlightOpacity,
	getToggleIconScale,
	getTransitionProgress,
} from './effects/EffectShowcaseScaffold';

const GRAYSCALE_ENABLE_FRAME = 24;
const PIXEL_DISSOLVE_ENABLE_FRAME = 72;
const COLUMNS_DRAG_START = 100;
const COLUMNS_DRAG_END = 130;
const ROWS_DRAG_START = 150;
const ROWS_DRAG_END = 180;
const PROGRESS_TO_ONE_START = 205;
const PROGRESS_TO_ONE_END = 235;
const PROGRESS_KEYFRAME_SET_FRAME = 252;
const PROGRESS_TO_ZERO_START = 272;
const PROGRESS_TO_ZERO_END = 344;
const INITIAL_PIXEL_DISSOLVE_PROGRESS = 0.5;
const INITIAL_PIXEL_DISSOLVE_COLUMNS = 20;
const FINAL_PIXEL_DISSOLVE_COLUMNS = 80;
const INITIAL_PIXEL_DISSOLVE_ROWS = 20;
const FINAL_PIXEL_DISSOLVE_ROWS = 80;
const PIXEL_DISSOLVE_SEED = 0;
const PIXEL_DISSOLVE_FEATHER = 0.15;
const CURSOR_IN_FRAME = 0;
const CURSOR_OUT_FRAME = 372;
const VALUE_DRAG_START_X = 472;
const VALUE_DRAG_END_X = 640;
const PROGRESS_TO_ZERO_END_X = 348;
const PIXEL_DISSOLVE_HEADER_Y = EFFECT_SHOWCASE_TOP_HEIGHT + 165;
const PROGRESS_ROW_Y = EFFECT_SHOWCASE_TOP_HEIGHT + 230;
const COLUMNS_ROW_Y = EFFECT_SHOWCASE_TOP_HEIGHT + 290;
const ROWS_ROW_Y = EFFECT_SHOWCASE_TOP_HEIGHT + 350;
const PROGRESS_KEYFRAME_X = 246;

export const shipCardDurationInFrames = 390;

loadFont('normal', {
	subsets: ['latin', 'latin-ext'],
	weights: ['300'],
});

const photoStyle: React.CSSProperties = {
	position: 'absolute',
	translate: '298.2px 148.3px',
	width: 442,
	height: 442,
	scale: 1.281,
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
	{
		frame: GRAYSCALE_ENABLE_FRAME - 8,
		x: 201,
		y: EFFECT_SHOWCASE_TOP_HEIGHT + 35,
	},
	{
		frame: GRAYSCALE_ENABLE_FRAME + 8,
		x: 201,
		y: EFFECT_SHOWCASE_TOP_HEIGHT + 35,
	},
	{
		frame: PIXEL_DISSOLVE_ENABLE_FRAME - 8,
		x: 201,
		y: PIXEL_DISSOLVE_HEADER_Y,
	},
	{
		frame: PIXEL_DISSOLVE_ENABLE_FRAME + 8,
		x: 201,
		y: PIXEL_DISSOLVE_HEADER_Y,
	},
	{
		frame: COLUMNS_DRAG_START - 12,
		x: VALUE_DRAG_START_X,
		y: COLUMNS_ROW_Y,
	},
	{
		frame: COLUMNS_DRAG_START,
		x: VALUE_DRAG_START_X,
		y: COLUMNS_ROW_Y,
	},
	{
		frame: COLUMNS_DRAG_END,
		x: VALUE_DRAG_END_X,
		y: COLUMNS_ROW_Y,
	},
	{
		frame: ROWS_DRAG_START - 12,
		x: VALUE_DRAG_START_X,
		y: ROWS_ROW_Y,
	},
	{
		frame: ROWS_DRAG_START,
		x: VALUE_DRAG_START_X,
		y: ROWS_ROW_Y,
	},
	{
		frame: ROWS_DRAG_END,
		x: VALUE_DRAG_END_X,
		y: ROWS_ROW_Y,
	},
	{
		frame: PROGRESS_TO_ONE_START - 12,
		x: VALUE_DRAG_START_X,
		y: PROGRESS_ROW_Y,
	},
	{
		frame: PROGRESS_TO_ONE_START,
		x: VALUE_DRAG_START_X,
		y: PROGRESS_ROW_Y,
	},
	{
		frame: PROGRESS_TO_ONE_END,
		x: VALUE_DRAG_END_X,
		y: PROGRESS_ROW_Y,
	},
	{
		frame: PROGRESS_KEYFRAME_SET_FRAME - 8,
		x: PROGRESS_KEYFRAME_X,
		y: PROGRESS_ROW_Y,
	},
	{
		frame: PROGRESS_KEYFRAME_SET_FRAME + 8,
		x: PROGRESS_KEYFRAME_X,
		y: PROGRESS_ROW_Y,
	},
	{
		frame: PROGRESS_TO_ZERO_START,
		x: VALUE_DRAG_START_X,
		y: PROGRESS_ROW_Y,
	},
	{
		frame: PROGRESS_TO_ZERO_END,
		x: PROGRESS_TO_ZERO_END_X,
		y: PROGRESS_ROW_Y,
	},
	{frame: CURSOR_OUT_FRAME, x: 940, y: 1180},
] as const satisfies readonly CursorPoint[];

const ShipCardPhoto: React.FC<{
	readonly effects?: React.ComponentProps<typeof Img>['effects'];
}> = ({effects}) => {
	return (
		<Img
			src={staticFile('Mask group.png')}
			style={photoStyle}
			effects={effects}
		/>
	);
};

const ShipCardText: React.FC = () => {
	return (
		<>
			<Interactive.Div
				style={{
					position: 'absolute',
					translate: '88px 59px',
					color: 'white',
					fontFamily,
					fontSize: 44,
					fontWeight: 300,
					lineHeight: 1.13,
					letterSpacing: 0,
					whiteSpace: 'pre',
				}}
			>
				{'VIBE-CODING EFFECTS'}
			</Interactive.Div>
			<Interactive.Div
				style={{
					position: 'absolute',
					translate: '88px 548px',
					color: 'white',
					fontFamily,
					fontSize: 42,
					fontWeight: 300,
					lineHeight: 1.12,
					letterSpacing: 0,
					whiteSpace: 'pre',
				}}
			>
				{'JONNY BURGER\nNOT ACTUALLY SPEAKING'}
			</Interactive.Div>
		</>
	);
};

const dragEase = {
	...clamp,
	easing: Easing.bezier(0.42, 0, 0.58, 1),
};

const getPixelDissolveColumns = (frame: number) => {
	return interpolate(
		frame,
		[COLUMNS_DRAG_START, COLUMNS_DRAG_END],
		[INITIAL_PIXEL_DISSOLVE_COLUMNS, FINAL_PIXEL_DISSOLVE_COLUMNS],
		dragEase,
	);
};

const getPixelDissolveRows = (frame: number) => {
	return interpolate(
		frame,
		[ROWS_DRAG_START, ROWS_DRAG_END],
		[INITIAL_PIXEL_DISSOLVE_ROWS, FINAL_PIXEL_DISSOLVE_ROWS],
		dragEase,
	);
};

const getPixelDissolveProgress = (frame: number) => {
	if (frame < PROGRESS_TO_ONE_END) {
		return interpolate(
			frame,
			[PROGRESS_TO_ONE_START, PROGRESS_TO_ONE_END],
			[INITIAL_PIXEL_DISSOLVE_PROGRESS, 1],
			dragEase,
		);
	}

	return interpolate(
		frame,
		[PROGRESS_TO_ZERO_START, PROGRESS_TO_ZERO_END],
		[1, 0],
		dragEase,
	);
};

const getDragProgress = (
	frame: number,
	start: number,
	end: number,
): number | null => {
	if (frame < start || frame > end) {
		return null;
	}

	return interpolate(frame, [start, end], [0, 1], dragEase);
};

const getCursorPoint = (frame: number): CursorPoint => {
	const columnsDragProgress = getDragProgress(
		frame,
		COLUMNS_DRAG_START,
		COLUMNS_DRAG_END,
	);
	if (columnsDragProgress !== null) {
		return {
			frame,
			x: interpolate(
				columnsDragProgress,
				[0, 1],
				[VALUE_DRAG_START_X, VALUE_DRAG_END_X],
			),
			y: COLUMNS_ROW_Y,
		};
	}

	const rowsDragProgress = getDragProgress(
		frame,
		ROWS_DRAG_START,
		ROWS_DRAG_END,
	);
	if (rowsDragProgress !== null) {
		return {
			frame,
			x: interpolate(
				rowsDragProgress,
				[0, 1],
				[VALUE_DRAG_START_X, VALUE_DRAG_END_X],
			),
			y: ROWS_ROW_Y,
		};
	}

	const progressToOneDragProgress = getDragProgress(
		frame,
		PROGRESS_TO_ONE_START,
		PROGRESS_TO_ONE_END,
	);
	if (progressToOneDragProgress !== null) {
		return {
			frame,
			x: interpolate(
				progressToOneDragProgress,
				[0, 1],
				[VALUE_DRAG_START_X, VALUE_DRAG_END_X],
			),
			y: PROGRESS_ROW_Y,
		};
	}

	const progressToZeroDragProgress = getDragProgress(
		frame,
		PROGRESS_TO_ZERO_START,
		PROGRESS_TO_ZERO_END,
	);
	if (progressToZeroDragProgress !== null) {
		return {
			frame,
			x: interpolate(
				progressToZeroDragProgress,
				[0, 1],
				[VALUE_DRAG_START_X, PROGRESS_TO_ZERO_END_X],
			),
			y: PROGRESS_ROW_Y,
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
		(frame >= GRAYSCALE_ENABLE_FRAME - 1 &&
			frame <= GRAYSCALE_ENABLE_FRAME + 5) ||
		(frame >= PIXEL_DISSOLVE_ENABLE_FRAME - 1 &&
			frame <= PIXEL_DISSOLVE_ENABLE_FRAME + 5) ||
		(frame >= COLUMNS_DRAG_START && frame <= COLUMNS_DRAG_END) ||
		(frame >= ROWS_DRAG_START && frame <= ROWS_DRAG_END) ||
		(frame >= PROGRESS_TO_ONE_START && frame <= PROGRESS_TO_ONE_END) ||
		(frame >= PROGRESS_KEYFRAME_SET_FRAME - 1 &&
			frame <= PROGRESS_KEYFRAME_SET_FRAME + 5) ||
		(frame >= PROGRESS_TO_ZERO_START && frame <= PROGRESS_TO_ZERO_END)
	);
};

const getCursor = (frame: number) => {
	if (
		(frame >= COLUMNS_DRAG_START - 8 && frame <= COLUMNS_DRAG_END) ||
		(frame >= ROWS_DRAG_START - 8 && frame <= ROWS_DRAG_END) ||
		(frame >= PROGRESS_TO_ONE_START - 8 && frame <= PROGRESS_TO_ONE_END) ||
		(frame >= PROGRESS_TO_ZERO_START - 8 && frame <= PROGRESS_TO_ZERO_END)
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

const StudioUi: React.FC<{
	readonly columns: number;
	readonly frame: number;
	readonly pixelDissolveProgress: number;
	readonly rows: number;
}> = ({columns, frame, pixelDissolveProgress, rows}) => {
	const grayscaleEnabled = frame >= GRAYSCALE_ENABLE_FRAME;
	const pixelDissolveEnabled = frame >= PIXEL_DISSOLVE_ENABLE_FRAME;
	const grayscaleExpandProgress = getExpandProgress(
		frame,
		GRAYSCALE_ENABLE_FRAME,
	);
	const pixelDissolveExpandProgress = getExpandProgress(
		frame,
		PIXEL_DISSOLVE_ENABLE_FRAME,
	);

	return (
		<>
			<EffectHeader
				label="grayscale()"
				enabled={grayscaleEnabled}
				expandProgress={grayscaleExpandProgress}
				highlightOpacity={getHighlightOpacity({
					frame,
					start: GRAYSCALE_ENABLE_FRAME,
					end: GRAYSCALE_ENABLE_FRAME + 24,
				})}
				iconScale={getToggleIconScale(frame, GRAYSCALE_ENABLE_FRAME)}
			/>
			<EffectProperties rowCount={1} expandProgress={grayscaleExpandProgress}>
				<ParamRow label="Amount">
					<div style={{...fieldBox, width: 120}}>{formatNumber(1)}</div>
				</ParamRow>
			</EffectProperties>
			<EffectHeader
				label="pixelDissolve()"
				enabled={pixelDissolveEnabled}
				expandProgress={pixelDissolveExpandProgress}
				highlightOpacity={getHighlightOpacity({
					frame,
					start: PIXEL_DISSOLVE_ENABLE_FRAME,
					end: PIXEL_DISSOLVE_ENABLE_FRAME + 24,
				})}
				iconScale={getToggleIconScale(frame, PIXEL_DISSOLVE_ENABLE_FRAME)}
			/>
			<EffectProperties
				rowCount={5}
				expandProgress={pixelDissolveExpandProgress}
			>
				<ParamRow
					label="Progress"
					activeDiamond={frame >= PROGRESS_KEYFRAME_SET_FRAME}
					highlightOpacity={getHighlightOpacity({
						frame,
						start: PROGRESS_TO_ONE_START,
						end: PROGRESS_TO_ZERO_END,
					})}
				>
					<div style={{...fieldBox, width: 120}}>
						{formatNumber(pixelDissolveProgress)}
					</div>
				</ParamRow>
				<ParamRow
					label="Columns"
					highlightOpacity={getHighlightOpacity({
						frame,
						start: COLUMNS_DRAG_START,
						end: COLUMNS_DRAG_END,
					})}
				>
					<div style={{...fieldBox, width: 120}}>{Math.round(columns)}</div>
				</ParamRow>
				<ParamRow
					label="Rows"
					highlightOpacity={getHighlightOpacity({
						frame,
						start: ROWS_DRAG_START,
						end: ROWS_DRAG_END,
					})}
				>
					<div style={{...fieldBox, width: 120}}>{Math.round(rows)}</div>
				</ParamRow>
				<ParamRow label="Seed">
					<div style={{...fieldBox, width: 120}}>{PIXEL_DISSOLVE_SEED}</div>
				</ParamRow>
				<ParamRow label="Feather">
					<div style={{...fieldBox, width: 120}}>
						{formatNumber(PIXEL_DISSOLVE_FEATHER)}
					</div>
				</ParamRow>
			</EffectProperties>
		</>
	);
};

export const ShipCard: React.FC = () => {
	const frame = useCurrentFrame();
	const grayscaleProgress = getTransitionProgress(
		frame,
		GRAYSCALE_ENABLE_FRAME,
	);
	const pixelDissolveProgress = getPixelDissolveProgress(frame);
	const pixelDissolveColumns = getPixelDissolveColumns(frame);
	const pixelDissolveRows = getPixelDissolveRows(frame);

	return (
		<>
			<EffectShowcaseShell
				preview={
					<>
						<Solid
							width={EFFECT_SHOWCASE_WIDTH}
							height={EFFECT_SHOWCASE_TOP_HEIGHT}
							style={{
								position: 'absolute',
							}}
							color={'#000000'}
						/>
						<ShipCardPhoto
							effects={[
								grayscale({
									amount: grayscaleProgress,
								}),
								pixelDissolve({
									progress:
										frame >= PIXEL_DISSOLVE_ENABLE_FRAME
											? pixelDissolveProgress
											: 0,
									columns: Math.round(pixelDissolveColumns),
									rows: Math.round(pixelDissolveRows),
									seed: PIXEL_DISSOLVE_SEED,
									feather: PIXEL_DISSOLVE_FEATHER,
									disabled: frame < PIXEL_DISSOLVE_ENABLE_FRAME,
								}),
							]}
						/>
						<ShipCardText />
					</>
				}
				studio={
					<StudioUi
						columns={pixelDissolveColumns}
						frame={frame}
						pixelDissolveProgress={pixelDissolveProgress}
						rows={pixelDissolveRows}
					/>
				}
			/>
			<ShowcaseCursor frame={frame} />
		</>
	);
};
