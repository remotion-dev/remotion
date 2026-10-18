import {dropShadow} from '@remotion/effects/drop-shadow';
import {paper} from '@remotion/effects/paper';
import {roughenEdges} from '@remotion/effects/roughen-edges';
import {TransitionSeries} from '@remotion/transitions';
import React, {useMemo} from 'react';
import {
	useVideoConfig,
	AbsoluteFill,
	CanvasImage,
	Easing,
	Interactive,
	interpolate,
	random,
	useCurrentFrame,
} from 'remotion';
import {DIGIT_GLYPHS, type DigitFont} from './digit-glyphs';
import {PAPER_SCAN_DATA_URL} from './paper-scan';

export const COUNTDOWN_DURATION_IN_FRAMES = 59;

type ClippingStyle = {
	readonly paper: string;
	readonly ink: string;
	readonly font: DigitFont;
};

// Ransom-note clippings: each number looks cut from a different print source
const CLIPPINGS = {
	newsprint: {paper: '#ebe4d2', ink: '#141414', font: 'abril'},
	magazineRed: {paper: '#e3382c', ink: '#fff4df', font: 'anton'},
	magazineYellow: {paper: '#ffcf2e', ink: '#151515', font: 'ultra'},
	glossyBlue: {paper: '#3160ff', ink: '#ffffff', font: 'abril'},
} as const satisfies Record<string, ClippingStyle>;

type ClippingName = keyof typeof CLIPPINGS;

const STYLE_FOR_NUMBER: Record<string, ClippingName> = {
	'3': 'newsprint',
	'2': 'magazineRed',
	'1': 'magazineYellow',
};
const TILT_FOR_NUMBER: Record<string, number> = {'3': -6, '2': 5, '1': -3};

const CANVAS_W = 820;
const CANVAS_H = 980;

/**
 * An odd, hand-cut shape: a lopsided polygon with uneven corners,
 * like something snipped out of a magazine with scissors.
 */
const oddShapePath = (seed: string, w: number, h: number, pad: number) => {
	const cx = w / 2;
	const cy = h / 2;
	const rx = w / 2 - pad;
	const ry = h / 2 - pad;
	const n = 6 + Math.floor(random(`${seed}-n`) * 3);
	const offset = random(`${seed}-o`) * Math.PI;
	const pts: string[] = [];
	for (let i = 0; i < n; i++) {
		const a =
			offset + (i / n) * Math.PI * 2 + (random(`${seed}-a${i}`) - 0.5) * 0.5;
		// Squarish radius so it reads as a cut-out, not a blob
		const sq = 1 / Math.max(Math.abs(Math.cos(a)), Math.abs(Math.sin(a)));
		const r = Math.min(sq, 1.25) * (0.74 + random(`${seed}-r${i}`) * 0.26);
		pts.push(
			`${(cx + Math.cos(a) * rx * r * 0.97).toFixed(1)},${(cy + Math.sin(a) * ry * r * 0.97).toFixed(1)}`,
		);
	}
	return `M${pts.join(' L')} Z`;
};

/**
 * One single layer: the paper scan clipped to the odd shape, tinted with the
 * clipping colour, with the digit printed into it. Everything is in the same
 * image, so paper() textures the digit together with the paper.
 */
const makeClippingTexture = (number: string, style: ClippingStyle) => {
	const path = oddShapePath(`${number}-front`, CANVAS_W, CANVAS_H, 70);
	const glyph =
		DIGIT_GLYPHS[style.font][number as keyof (typeof DIGIT_GLYPHS)['abril']];
	const [x0, y0, x1, y1] = glyph.bounds;
	const scale = (CANVAS_H * 0.5) / (y1 - y0);
	const tx = CANVAS_W / 2 - ((x0 + x1) / 2) * scale;
	const ty = CANVAS_H / 2 + ((y0 + y1) / 2) * scale;
	const inkBlend =
		style.ink === '#141414' || style.ink === '#151515' ? 'multiply' : 'normal';
	const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${CANVAS_W}" height="${CANVAS_H}" viewBox="0 0 ${CANVAS_W} ${CANVAS_H}">
<defs><clipPath id="c"><path d="${path}"/></clipPath></defs>
<g clip-path="url(#c)">
<image href="${PAPER_SCAN_DATA_URL}" x="0" y="0" width="${CANVAS_W}" height="${CANVAS_H}" preserveAspectRatio="xMidYMid slice"/>
<rect width="${CANVAS_W}" height="${CANVAS_H}" fill="${style.paper}" style="mix-blend-mode:multiply"/>
<path d="${glyph.d}" fill="${style.ink}" style="mix-blend-mode:${inkBlend}" transform="translate(${tx.toFixed(1)} ${ty.toFixed(1)}) scale(${scale.toFixed(4)} ${(-scale).toFixed(4)})"/>
</g>
</svg>`;
	return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

const CountdownPageInner: React.FC<{
	readonly number: string;
}> = ({number}) => {
	const {durationInFrames} = useVideoConfig();
	const frame = useCurrentFrame();
	const style = CLIPPINGS[STYLE_FOR_NUMBER[number] ?? 'glossyBlue'];
	const tilt = TILT_FOR_NUMBER[number] ?? 4;
	const src = useMemo(
		() => makeClippingTexture(number, style),
		[number, style],
	);

	return (
		<AbsoluteFill
			showInTimeline={false}
			style={{
				alignItems: 'center',
				justifyContent: 'center',
				overflow: 'hidden',
				pointerEvents: 'none',
			}}
		>
			<CanvasImage
				name={`Clipping ${number}`}
				src={src}
				width={CANVAS_W}
				height={CANVAS_H}
				fit="fill"
				style={{
					// Each clipping slides across the frame at its full size.
					translate: interpolate(
						frame,
						[0, 4, durationInFrames - 5, durationInFrames - 1],
						['1260px 0px', '0px 0px', '0px 0px', '-1260px 0px'],
						{
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							easing: Easing.inOut(Easing.cubic),
						},
					),
					rotate: `${tilt}deg`,
				}}
				effects={[
					paper({
						amount: 0.85,
						colorFront: '#b9b2a4',
						colorBack: '#ffffff',
						contrast: 0.3,
						roughness: 0.45,
						fiber: 0.45,
						fiberSize: 0.2,
						crumples: 0.55,
						crumpleSize: 0.3,
						folds: 0.35,
						foldCount: 3,
						drops: 0.05,
						seed: number.charCodeAt(0),
					}),
					roughenEdges({
						amount: 1,
						border: 7,
						scale: 0.1,
						seed: number.charCodeAt(0) * 7,
					}),
					dropShadow({
						radius: 16,
						offsetX: 10,
						offsetY: 18,
						opacity: 0.7,
						color: '#000000',
					}),
				]}
			/>
		</AbsoluteFill>
	);
};

export const CountdownPage = Interactive.create({
	Component: CountdownPageInner,
	schema: {
		number: {type: 'string', default: '3', description: 'Number'},
	},
	layout: 'absolute-fill',
});

const CountdownInner: React.FC = () => {
	return (
		<TransitionSeries name="Countdown numbers">
			<TransitionSeries.Sequence name="Countdown 3" durationInFrames={20}>
				<CountdownPage name="Number 3" number="3" />
			</TransitionSeries.Sequence>
			<TransitionSeries.Sequence name="Countdown 2" durationInFrames={20}>
				<CountdownPage name="Number 2" number="2" />
			</TransitionSeries.Sequence>
			<TransitionSeries.Sequence name="Countdown 1" durationInFrames={19}>
				<CountdownPage name="Number 1" number="1" />
			</TransitionSeries.Sequence>
		</TransitionSeries>
	);
};

export const Countdown = Interactive.create({
	Component: CountdownInner,
	layout: 'absolute-fill',
});
