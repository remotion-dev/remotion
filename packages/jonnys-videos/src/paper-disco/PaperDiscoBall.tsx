import {gridlines} from '@remotion/effects/gridlines';
import {roughenEdges} from '@remotion/effects/roughen-edges';
import {sphere} from '@remotion/effects/sphere';
import React, {useMemo} from 'react';
import {
	CanvasImage,
	Interactive,
	interpolate,
	random,
	useCurrentFrame,
	useVideoConfig,
	type InteractiveTransformProps,
	type InteractivitySchema,
} from 'remotion';
import {cutoutPaperEffects} from './cutout-paper';
import {BALLPEN_INK, makeDiscTexture, makeDiscoBallTexture} from './textures';

type PaperDiscoBallProps = InteractiveTransformProps & {
	readonly gridOpacity: number | null;
	readonly size?: number;
	readonly posterize?: number;
	readonly revolutionsPerSecond?: number;
	readonly tilt?: number;
	readonly shadow?: boolean;
	readonly shadowOpacity?: number;
	readonly boil?: boolean;
	readonly padding?: number;
};

const paperDiscoBallSchema = {
	gridOpacity: {
		type: 'number',
		min: 0,
		max: 1,
		step: 0.01,
		default: 0.14,
		description: 'Notebook grid opacity',
		hiddenFromList: false,
	},
	size: {
		type: 'number',
		min: 100,
		max: 2000,
		step: 1,
		default: 900,
		description: 'Canvas size',
		hiddenFromList: false,
	},
	posterize: {
		type: 'number',
		min: 1,
		max: 12,
		step: 1,
		default: 3,
		description: 'Hold each pose for N frames (3 = "on threes")',
		hiddenFromList: false,
	},
	revolutionsPerSecond: {
		type: 'number',
		min: -1,
		max: 1,
		step: 0.01,
		default: 0.08,
		description: 'Spin speed',
		hiddenFromList: false,
	},
	tilt: {
		type: 'rotation-degrees',
		default: 0,
		description: 'Tilt toward camera',
	},
	shadow: {
		type: 'boolean',
		default: false,
		description: 'Paper cut-out drop shadow',
	},
	shadowOpacity: {
		type: 'number',
		min: 0,
		max: 1,
		step: 0.01,
		default: 0.6,
		description: 'Shadow opacity',
		hiddenFromList: false,
	},
	boil: {
		type: 'boolean',
		default: true,
		description: 'Stop-motion boiling pen lines (paper edges stay still)',
	},
	padding: {
		type: 'number',
		min: 0,
		max: 0.2,
		step: 0.005,
		default: 0.06,
		description: 'Paper margin around the drawing (fraction of size)',
		hiddenFromList: false,
	},
} as const satisfies InteractivitySchema;

/** Hand-drawn circle path: two loose passes like a ballpoint sketch. */
const sketchCircle = (
	cx: number,
	cy: number,
	r: number,
	seed: string,
	wobble: number,
) => {
	const points = 48;
	const paths: string[] = [];
	for (let pass = 0; pass < 2; pass++) {
		const start = random(`${seed}-start-${pass}`) * Math.PI * 2;
		const sweep = Math.PI * 2 * (pass === 0 ? 1.04 : 0.62);
		const parts: string[] = [];
		for (let i = 0; i <= points; i++) {
			const a = start + (i / points) * sweep;
			const rr =
				r +
				(random(`${seed}-${pass}-${i}`) - 0.5) * wobble +
				pass * wobble * 0.4;
			parts.push(
				`${i === 0 ? 'M' : 'L'}${(cx + Math.cos(a) * rr).toFixed(1)} ${(cy + Math.sin(a) * rr).toFixed(1)}`,
			);
		}
		paths.push(parts.join(' '));
	}
	return paths;
};

const PaperDiscoBallInner: React.FC<PaperDiscoBallProps> = ({
	gridOpacity,
	size = 900,
	posterize = 3,
	revolutionsPerSecond = 0.08,
	tilt = 0,
	shadow = false,
	shadowOpacity = 0.6,
	boil = true,
	padding = 0.06,
	style,
}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const texture = useMemo(() => makeDiscoBallTexture(), []);

	const discRadius = Math.round(size * 0.44);
	const radius = Math.round(discRadius - size * padding);
	const disc = useMemo(
		() => makeDiscTexture(size, discRadius),
		[size, discRadius],
	);

	const step = Math.floor(frame / posterize);
	const boilStep = boil ? step % 3 : 0;
	const c = size / 2;
	const outline = sketchCircle(
		c,
		c,
		radius,
		`outline-${boilStep}`,
		size * 0.006,
	);

	// Hatched shading crescent on the lower right, clipped to the ball
	const hatchLines: string[] = [];
	const spacing = size * 0.026;
	for (let i = -radius * 2; i < radius * 2; i += spacing) {
		const j = (random(`hatch-${i}-${boilStep}`) - 0.5) * spacing * 0.5;
		hatchLines.push(`M${c + i + j} ${c + radius} L${c + i + radius + j} ${c}`);
	}

	return (
		<div style={{width: size, height: size, position: 'relative', ...style}}>
			{/* The paper cut-out, with margin around the drawing */}
			<CanvasImage
				name="Paper cut-out"
				src={disc}
				width={size}
				height={size}
				fit="fill"
				style={{position: 'absolute', inset: 0}}
				effects={cutoutPaperEffects({
					gridOpacity,
					edgeRoughness: null,
					unit: size / 900,
					seed: 21,
					shadow,
					shadowOpacity,
				})}
			/>
			{/* The ballpen drawing, wrapped onto a sphere */}
			<CanvasImage
				name="Ballpen disco ball"
				src={texture}
				width={size}
				height={size}
				fit="fill"
				style={{position: 'absolute', inset: 0}}
				effects={[
					sphere({
						radius,
						rotationX: tilt,
						rotationY: interpolate(
							frame,
							[0, fps],
							[0, revolutionsPerSecond * 360],
							{posterize, extrapolateRight: 'extend'},
						),
						rotationZ: 0,
						shading: 0,
					}),
					// Notebook grid, aligned across the cut-out and the drawing
					gridlines({
						gridSize: Math.round(size * 0.05),
						lineWidth: Math.max(1, size * 0.0016),
						lineColor: `rgba(42, 59, 85, ${gridOpacity ?? 0.14})`,
						maskToSourceAlpha: true,
					}),
					roughenEdges({
						amount: 1,
						border: Math.max(2, size * 0.004),
						scale: 0.2,
						seed: 40,
					}),
				]}
			/>
			{/* Pen outline + hatched shading */}
			<svg
				width={size}
				height={size}
				viewBox={`0 0 ${size} ${size}`}
				style={{position: 'absolute', inset: 0}}
			>
				<defs>
					<clipPath id="ball-clip">
						<circle cx={c} cy={c} r={radius} />
					</clipPath>
					<mask id="crescent">
						<rect width={size} height={size} fill="black" />
						<circle cx={c} cy={c} r={radius} fill="white" />
						<circle
							cx={c - radius * 0.22}
							cy={c - radius * 0.22}
							r={radius * 0.98}
							fill="black"
						/>
					</mask>
				</defs>
				<g clipPath="url(#ball-clip)" mask="url(#crescent)">
					<path
						d={hatchLines.join(' ')}
						stroke={BALLPEN_INK}
						strokeWidth={Math.max(2, size * 0.004)}
						opacity={0.22}
						fill="none"
						strokeLinecap="round"
					/>
				</g>
				{outline.map((d, i) => (
					<path
						key={i}
						d={d}
						stroke={BALLPEN_INK}
						strokeWidth={Math.max(2, size * (i === 0 ? 0.009 : 0.005))}
						fill="none"
						strokeLinecap="round"
						strokeLinejoin="round"
						opacity={i === 0 ? 0.95 : 0.6}
					/>
				))}
			</svg>
		</div>
	);
};

export const PaperDiscoBall = Interactive.create({
	Component: PaperDiscoBallInner,
	componentName: '<PaperDiscoBall>',
	schema: paperDiscoBallSchema,
});
