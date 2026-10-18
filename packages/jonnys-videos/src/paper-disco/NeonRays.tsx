import {dropShadow} from '@remotion/effects/drop-shadow';
import {gridlines} from '@remotion/effects/gridlines';
import {paper} from '@remotion/effects/paper';
import {roughenEdges} from '@remotion/effects/roughen-edges';
import React from 'react';
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

// Shared palette, tuned to read on white paper
export const PALETTE = {
	magenta: '#ff1493',
	gold: '#ffb400',
	violet: '#7a2bff',
	cyan: '#00c8ff',
	ink: '#16161d',
};

// Stabilo highlighter pink and blue, alternating
export const STABILO_PINK = '#ff4f9a';
export const STABILO_BLUE = '#17a9ec';
export const NEON_COLORS_DARK = [STABILO_PINK, STABILO_BLUE];
// 4 colors so 8 (or 12, 16) rays cycle evenly
export const NEON_COLORS_LIGHT = [
	PALETTE.magenta,
	PALETTE.gold,
	PALETTE.violet,
	PALETTE.cyan,
];

type NeonRaysProps = InteractiveTransformProps & {
	readonly gridOpacity: number | null;
	readonly width?: number;
	readonly height?: number;
	readonly centerX?: number;
	readonly centerY?: number;
	readonly rays?: number;
	readonly length?: number;
	readonly posterize?: number;
	readonly degreesPerSecond?: number;
	readonly flicker?: number;
	readonly spread?: number;
	readonly progress?: number;
	readonly theme?: 'light' | 'dark';
	readonly colorHopSteps?: number;
	readonly look?: 'tissue-paper' | 'flat';
	readonly rayOpacity?: number;
};

const neonRaysSchema = {
	gridOpacity: {
		type: 'number',
		min: 0,
		max: 1,
		step: 0.01,
		default: 0.16,
		description: 'Notebook grid opacity',
		hiddenFromList: false,
	},
	centerX: {
		type: 'number',
		min: 0,
		max: 4000,
		step: 1,
		default: 540,
		description: 'Center X',
		hiddenFromList: false,
	},
	centerY: {
		type: 'number',
		min: 0,
		max: 4000,
		step: 1,
		default: 960,
		description: 'Center Y',
		hiddenFromList: false,
	},
	rays: {
		type: 'number',
		min: 2,
		max: 48,
		step: 1,
		default: 8,
		description: 'Number of rays',
		hiddenFromList: false,
	},
	length: {
		type: 'number',
		min: 50,
		max: 3000,
		step: 1,
		default: 1500,
		description: 'Ray length',
		hiddenFromList: false,
	},
	posterize: {
		type: 'number',
		min: 1,
		max: 12,
		step: 1,
		default: 3,
		description: 'Hold each pose for N frames',
		hiddenFromList: false,
	},
	degreesPerSecond: {
		type: 'number',
		min: -180,
		max: 180,
		step: 1,
		default: 12,
		description: 'Spin speed',
		hiddenFromList: false,
	},
	flicker: {
		type: 'number',
		min: 0,
		max: 1,
		step: 0.01,
		default: 0,
		description: 'Chance a ray flickers off per step',
		hiddenFromList: false,
	},
	spread: {
		type: 'number',
		min: 0.05,
		max: 1,
		step: 0.01,
		default: 0.5,
		description: 'How much of each slice the ray fills',
		hiddenFromList: false,
	},
	theme: {
		type: 'enum',
		variants: {light: {}, dark: {}},
		default: 'dark',
		description: 'Light paper or dark stage',
	},
	colorHopSteps: {
		type: 'number',
		min: 0,
		max: 30,
		step: 1,
		default: 0,
		description: 'Colors shift one ray every N poses (0 = off)',
		hiddenFromList: false,
	},
	look: {
		type: 'enum',
		variants: {'tissue-paper': {}, flat: {}},
		default: 'tissue-paper',
		description: 'Torn tissue paper or flat vector',
	},
	rayOpacity: {
		type: 'number',
		min: 0,
		max: 1,
		step: 0.01,
		default: 0.85,
		description: 'Ray opacity',
		hiddenFromList: false,
	},
	progress: {
		type: 'number',
		min: 0,
		max: 1,
		step: 0.01,
		default: 1,
		description: 'How far the rays have shot out (animate for intros)',
		hiddenFromList: false,
	},
} as const satisfies InteractivitySchema;

const NeonRaysInner: React.FC<NeonRaysProps> = ({
	gridOpacity,
	width: widthProp,
	height: heightProp,
	centerX = 540,
	centerY = 960,
	rays = 8,
	length = 1500,
	posterize = 3,
	degreesPerSecond = 12,
	flicker = 0,
	spread = 0.5,
	progress = 1,
	theme = 'dark',
	colorHopSteps = 0,
	look = 'tissue-paper',
	rayOpacity = 0.85,
	style,
}) => {
	const frame = useCurrentFrame();
	const config = useVideoConfig();
	const width = widthProp ?? config.width;
	const height = heightProp ?? config.height;
	const step = Math.floor(frame / posterize);
	const rotation = interpolate(frame, [0, config.fps], [0, degreesPerSecond], {
		posterize,
		extrapolateRight: 'extend',
	});

	const isLight = theme === 'light';
	const NEON_COLORS = isLight ? NEON_COLORS_LIGHT : NEON_COLORS_DARK;
	const outer = length * progress;

	const hop = colorHopSteps > 0 ? Math.floor(step / colorHopSteps) : 0;
	const wedges = new Array(rays).fill(true).map((_, i) => {
		const color = NEON_COLORS[(i + hop) % NEON_COLORS.length];
		const a = (i / rays) * Math.PI * 2 + (rotation * Math.PI) / 180;
		// Wide triangular wedge, each taking `spread` of its slot
		const half = (Math.PI / rays) * spread;
		const len = outer * (0.9 + 0.1 * random(`len-${i}`));
		const p1 = [
			centerX + Math.cos(a - half) * len,
			centerY + Math.sin(a - half) * len,
		];
		const p2 = [
			centerX + Math.cos(a + half) * len,
			centerY + Math.sin(a + half) * len,
		];
		const off = random(`tube-${i}-${step}`) < flicker;
		return {
			color,
			points: `${centerX.toFixed(1)},${centerY.toFixed(1)} ${p1.map((n) => n.toFixed(1)).join(',')} ${p2.map((n) => n.toFixed(1)).join(',')}`,
			opacity: off ? 0.45 : 1,
		};
	});

	if (look === 'flat') {
		return (
			<svg
				width={width}
				height={height}
				viewBox={`0 0 ${width} ${height}`}
				style={{overflow: 'visible', ...style}}
			>
				<g opacity={rayOpacity}>
					{wedges.map((w, i) => (
						<polygon
							key={i}
							points={w.points}
							fill={w.color}
							opacity={w.opacity}
						/>
					))}
				</g>
			</svg>
		);
	}

	// Cover the viewport in every rotation, including room for paper edges and shadows.
	// Rasterizing at viewport size cuts the strips before the parent can rotate them.
	const viewportRadius = Math.max(
		Math.hypot(centerX, centerY),
		Math.hypot(width - centerX, centerY),
		Math.hypot(centerX, height - centerY),
		Math.hypot(width - centerX, height - centerY),
	);
	const renderRadius = Math.ceil(Math.min(length, viewportRadius)) + 64;
	const renderSize = renderRadius * 2;
	const renderLeft = centerX - renderRadius;
	const renderTop = centerY - renderRadius;

	// Tissue paper: each wedge is a torn sheet; overlaps darken like real tissue
	const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${renderSize}" height="${renderSize}" viewBox="${renderLeft} ${renderTop} ${renderSize} ${renderSize}">${wedges
		.map(
			(w) =>
				`<polygon points="${w.points}" fill="${w.color}" opacity="${w.opacity}"/>`,
		)
		.join('')}</svg>`;
	const src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

	return (
		<div style={{width, height, overflow: 'visible', ...style}}>
			<CanvasImage
				name="Tissue paper rays"
				src={src}
				width={renderSize}
				height={renderSize}
				fit="fill"
				style={{
					position: 'absolute',
					left: renderLeft,
					top: renderTop,
					opacity: rayOpacity,
				}}
				effects={[
					paper({
						amount: 0.35,
						colorFront: '#ececf0',
						colorBack: '#ffffff',
						contrast: 0.1,
						roughness: 0.1,
						fiber: 0.15,
						fiberSize: 0.2,
						crumples: 0.1,
						crumpleSize: 0.4,
						folds: 0.1,
						foldCount: 2,
						drops: 0,
						seed: 5,
					}),
					// Notebook grid printed on the tissue, turning with the rays
					gridlines({
						gridSize: 46,
						lineWidth: 1.5,
						lineColor: `rgba(20, 20, 30, ${gridOpacity ?? 0.16})`,
						rotation,
						maskToSourceAlpha: true,
					}),
					roughenEdges({
						amount: 1,
						border: 6,
						scale: 0.06,
						seed: 77,
					}),
					dropShadow({
						radius: 18,
						offsetX: 8,
						offsetY: 14,
						opacity: 0.6,
						color: '#000000',
					}),
				]}
			/>
		</div>
	);
};

export const NeonRays = Interactive.create({
	Component: NeonRaysInner,
	componentName: '<NeonRays>',
	schema: neonRaysSchema,
});
