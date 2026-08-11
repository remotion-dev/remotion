import {linearProgressiveBlur} from '@remotion/effects/linear-progressive-blur';
import {zigzag} from '@remotion/effects/zigzag';
import React from 'react';
import {Easing, interpolate, useCurrentFrame} from 'remotion';
import {
	ColorSwatches,
	EffectHeader,
	EffectProperties,
	EffectShowcaseShell,
	EnumValue,
	ParamRow,
	PreviewSolidLayer,
	UvKnob,
	clamp,
	fieldBox,
	formatDegrees,
	formatNumber,
	getExpandProgress,
	getHighlightOpacity,
	getToggleIconScale,
	getTransitionProgress,
	tinyFieldBox,
} from './EffectShowcaseScaffold';

const ZIGZAG_ENABLE_FRAME = 30;
const ANGLE_TWEAK_START = 78;
const ANGLE_TWEAK_END = 126;
const OFFSET_KEYFRAME_SET_FRAME = 156;
const OFFSET_START = 174;
const OFFSET_DURATION = 72;
const BLUR_ENABLE_FRAME = 270;
const END_BLUR_TWEAK_START = BLUR_ENABLE_FRAME + 38;
const END_BLUR_TWEAK_END = END_BLUR_TWEAK_START + 96;
const BLUR_END_MOVE_START = END_BLUR_TWEAK_END + 36;
const BLUR_END_MOVE_END = BLUR_END_MOVE_START + 60;

const ZIGZAG_COLORS = ['#0b84f3', '#fff4d8'] as const;
const ZIGZAG_THICKNESS = 34;
const ZIGZAG_GAP = 10;
const ZIGZAG_AMPLITUDE = 58;
const ZIGZAG_WAVELENGTH = 170;
const BLUR_START: readonly [number, number] = [0, 0.5];
const START_BLUR = 0;
const END_BLUR_START = 0;
const END_BLUR_END = 72;

export const zigzagLinearBlurShowcaseDurationInFrames = 540;

const getAngle = (frame: number) => {
	return interpolate(frame, [ANGLE_TWEAK_START, ANGLE_TWEAK_END], [0, 18], {
		...clamp,
		easing: Easing.bezier(0.16, 1, 0.3, 1),
	});
};

const getOffset = (frame: number) => {
	if (frame < OFFSET_START) {
		return 0;
	}

	return ((frame - OFFSET_START) / OFFSET_DURATION) * 180;
};

const getEndBlur = (frame: number) => {
	return interpolate(
		frame,
		[END_BLUR_TWEAK_START, END_BLUR_TWEAK_END],
		[END_BLUR_START, END_BLUR_END],
		clamp,
	);
};

const getBlurEnd = (frame: number): readonly [number, number] => {
	const x = interpolate(
		frame,
		[BLUR_END_MOVE_START, BLUR_END_MOVE_END],
		[1, 0.7],
		clamp,
	);
	const y = interpolate(
		frame,
		[BLUR_END_MOVE_START, BLUR_END_MOVE_END],
		[0.5, 1],
		clamp,
	);

	return [x, y];
};

const StudioUi: React.FC<{
	readonly frame: number;
	readonly angle: number;
	readonly offset: number;
	readonly endBlur: number;
	readonly blurEnd: readonly [number, number];
}> = ({frame, angle, offset, endBlur, blurEnd}) => {
	const zigzagEnabled = frame >= ZIGZAG_ENABLE_FRAME;
	const blurEnabled = frame >= BLUR_ENABLE_FRAME;
	const offsetKeyframed = frame >= OFFSET_KEYFRAME_SET_FRAME;
	const zigzagExpandProgress = getExpandProgress(frame, ZIGZAG_ENABLE_FRAME);
	const blurExpandProgress = getExpandProgress(frame, BLUR_ENABLE_FRAME);

	return (
		<>
			<EffectHeader
				label="zigzag()"
				enabled={zigzagEnabled}
				expandProgress={zigzagExpandProgress}
				highlightOpacity={getHighlightOpacity({
					frame,
					start: ZIGZAG_ENABLE_FRAME,
					end: ZIGZAG_ENABLE_FRAME + 24,
				})}
				iconScale={getToggleIconScale(frame, ZIGZAG_ENABLE_FRAME)}
			/>
			<EffectProperties rowCount={7} expandProgress={zigzagExpandProgress}>
				<ParamRow label="Colors">
					<ColorSwatches colors={ZIGZAG_COLORS} />
				</ParamRow>
				<ParamRow label="Direction">
					<EnumValue value="horizontal" />
				</ParamRow>
				<ParamRow
					label="Angle"
					highlightOpacity={getHighlightOpacity({
						frame,
						start: ANGLE_TWEAK_START,
						end: ANGLE_TWEAK_END,
					})}
				>
					<div style={{...fieldBox, width: 130}}>{formatDegrees(angle)}</div>
				</ParamRow>
				<ParamRow
					label="Offset"
					activeDiamond={offsetKeyframed}
					highlightOpacity={getHighlightOpacity({
						frame,
						start: OFFSET_KEYFRAME_SET_FRAME,
						end: OFFSET_START + OFFSET_DURATION + 18,
					})}
				>
					<div style={{...fieldBox, width: 130}}>{Math.round(offset)}</div>
				</ParamRow>
				<ParamRow label="Amplitude">
					<div style={{...fieldBox, width: 120}}>{ZIGZAG_AMPLITUDE}</div>
				</ParamRow>
				<ParamRow label="Wavelength">
					<div style={{...fieldBox, width: 120}}>{ZIGZAG_WAVELENGTH}</div>
				</ParamRow>
				<ParamRow label="Gap">
					<div style={{...fieldBox, width: 120}}>{ZIGZAG_GAP}</div>
				</ParamRow>
			</EffectProperties>
			<EffectHeader
				label="linearProgressiveBlur()"
				enabled={blurEnabled}
				expandProgress={blurExpandProgress}
				highlightOpacity={getHighlightOpacity({
					frame,
					start: BLUR_ENABLE_FRAME,
					end: BLUR_ENABLE_FRAME + 24,
				})}
				iconScale={getToggleIconScale(frame, BLUR_ENABLE_FRAME)}
			/>
			<EffectProperties rowCount={4} expandProgress={blurExpandProgress}>
				<ParamRow label="Start">
					<div style={tinyFieldBox}>{formatNumber(BLUR_START[0])}</div>
					<div style={{...tinyFieldBox, marginLeft: 10}}>
						{formatNumber(BLUR_START[1])}
					</div>
				</ParamRow>
				<ParamRow
					label="End"
					highlightOpacity={getHighlightOpacity({
						frame,
						start: BLUR_END_MOVE_START,
						end: BLUR_END_MOVE_END,
					})}
				>
					<div style={tinyFieldBox}>{formatNumber(blurEnd[0])}</div>
					<div style={{...tinyFieldBox, marginLeft: 10}}>
						{formatNumber(blurEnd[1])}
					</div>
				</ParamRow>
				<ParamRow label="Start Blur">
					<div style={{...fieldBox, width: 120}}>{START_BLUR}</div>
				</ParamRow>
				<ParamRow
					label="End Blur"
					highlightOpacity={getHighlightOpacity({
						frame,
						start: END_BLUR_TWEAK_START,
						end: END_BLUR_TWEAK_END,
					})}
				>
					<div style={{...fieldBox, width: 120}}>{Math.round(endBlur)}</div>
				</ParamRow>
			</EffectProperties>
		</>
	);
};

export const ZigzagLinearBlurShowcase: React.FC = () => {
	const frame = useCurrentFrame();
	const angle = getAngle(frame);
	const offset = getOffset(frame);
	const endBlur = getEndBlur(frame);
	const blurEnd = getBlurEnd(frame);
	const zigzagProgress = getTransitionProgress(frame, ZIGZAG_ENABLE_FRAME);
	const blurProgress = getTransitionProgress(frame, BLUR_ENABLE_FRAME);

	return (
		<EffectShowcaseShell
			preview={
				<>
					<PreviewSolidLayer />
					<PreviewSolidLayer
						opacity={zigzagProgress}
						effects={[
							zigzag({
								colors: ZIGZAG_COLORS,
								direction: 'horizontal',
								thickness: ZIGZAG_THICKNESS,
								gap: ZIGZAG_GAP,
								angle,
								offset,
								amplitude: ZIGZAG_AMPLITUDE,
								wavelength: ZIGZAG_WAVELENGTH,
							}),
						]}
					/>
					<PreviewSolidLayer
						opacity={zigzagProgress * blurProgress}
						effects={[
							zigzag({
								colors: ZIGZAG_COLORS,
								direction: 'horizontal',
								thickness: ZIGZAG_THICKNESS,
								gap: ZIGZAG_GAP,
								angle,
								offset,
								amplitude: ZIGZAG_AMPLITUDE,
								wavelength: ZIGZAG_WAVELENGTH,
							}),
							linearProgressiveBlur({
								start: BLUR_START,
								end: blurEnd,
								startBlur: START_BLUR,
								endBlur,
							}),
						]}
					/>
					<UvKnob
						frame={frame}
						uv={BLUR_START}
						start={BLUR_END_MOVE_START}
						end={BLUR_END_MOVE_END}
						lineTo={blurEnd}
					/>
					<UvKnob
						frame={frame}
						uv={blurEnd}
						start={BLUR_END_MOVE_START}
						end={BLUR_END_MOVE_END}
						lineTo={BLUR_START}
					/>
				</>
			}
			studio={
				<StudioUi
					frame={frame}
					angle={angle}
					offset={offset}
					endBlur={endBlur}
					blurEnd={blurEnd}
				/>
			}
		/>
	);
};
