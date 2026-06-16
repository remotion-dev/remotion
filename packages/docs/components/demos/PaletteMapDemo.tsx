import React from 'react';
import {
	AbsoluteFill,
	CanvasImage,
	createEffect,
	type InteractivitySchema,
} from 'remotion';
import {EFFECTS_PREVIEW_IMAGE_SRC} from '../effects/effects-preview-image';

type Rgb = readonly [number, number, number];

type PalettePreset = 'solar' | 'poster' | 'ink';

type PaletteMapParams = {
	readonly palette?: readonly string[];
	readonly amount?: number;
};

type PaletteMapDemoProps = {
	readonly amount: number;
	readonly palette: PalettePreset;
};

const DEFAULT_PALETTE = ['#111827', '#06b6d4', '#facc15'] as const;

const paletteMapSchema = {
	palette: {
		type: 'array',
		item: {
			type: 'color',
		},
		default: DEFAULT_PALETTE,
		newItemDefault: '#ffffff',
		minLength: 1,
		description: 'Palette',
	},
	amount: {
		type: 'number',
		min: 0,
		max: 1,
		step: 0.01,
		default: 1,
		description: 'Amount',
		hiddenFromList: false,
	},
} as const satisfies InteractivitySchema;

const palettes: Record<PalettePreset, readonly string[]> = {
	solar: ['#111827', '#06b6d4', '#facc15'],
	poster: ['#1d3557', '#f1faee', '#e63946'],
	ink: ['#0f172a', '#64748b', '#f8fafc'],
};

const parseCssColor = (color: string, target: HTMLCanvasElement): Rgb => {
	const canvas = target.ownerDocument.createElement('canvas');
	canvas.width = 1;
	canvas.height = 1;

	const ctx = canvas.getContext('2d');
	if (!ctx) {
		throw new Error('Could not get a 2D context for paletteMap()');
	}

	ctx.fillStyle = color;
	ctx.fillRect(0, 0, 1, 1);

	const {data} = ctx.getImageData(0, 0, 1, 1);
	const [red, green, blue] = data;
	return [red, green, blue];
};

const distanceSquared = (a: Rgb, b: Rgb): number => {
	return (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2;
};

const findClosestColor = (color: Rgb, palette: Rgb[]): Rgb => {
	let closest = palette[0] ?? color;
	let closestDistance = distanceSquared(color, closest);

	for (const candidate of palette) {
		const distance = distanceSquared(color, candidate);
		if (distance < closestDistance) {
			closest = candidate;
			closestDistance = distance;
		}
	}

	return closest;
};

const paletteMap = createEffect<PaletteMapParams, null>({
	type: 'docs/palette-map',
	label: 'paletteMap()',
	documentationLink: null,
	backend: '2d',
	calculateKey: ({palette = DEFAULT_PALETTE, amount = 1}) => {
		return `palette-map-${palette.join('-')}-${amount}`;
	},
	setup: () => null,
	apply: ({source, target, width, height, params}) => {
		const ctx = target.getContext('2d');
		if (!ctx) {
			throw new Error('Could not get a 2D context for paletteMap()');
		}

		const palette = (params.palette ?? DEFAULT_PALETTE).map((color) =>
			parseCssColor(color, target),
		);
		const amount = params.amount ?? 1;

		ctx.clearRect(0, 0, width, height);
		ctx.drawImage(source, 0, 0, width, height);

		const imageData = ctx.getImageData(0, 0, width, height);
		const {data} = imageData;

		for (let i = 0; i < data.length; i += 4) {
			const closest = findClosestColor(
				[data[i], data[i + 1], data[i + 2]],
				palette,
			);

			data[i] += (closest[0] - data[i]) * amount;
			data[i + 1] += (closest[1] - data[i + 1]) * amount;
			data[i + 2] += (closest[2] - data[i + 2]) * amount;
		}

		ctx.putImageData(imageData, 0, 0);
	},
	cleanup: () => undefined,
	schema: paletteMapSchema,
	validateParams: ({palette = DEFAULT_PALETTE, amount = 1}) => {
		if (
			!Array.isArray(palette) ||
			palette.length === 0 ||
			!palette.every((color) => typeof color === 'string')
		) {
			throw new TypeError('palette must be a non-empty array of CSS colors');
		}

		if (
			typeof amount !== 'number' ||
			!Number.isFinite(amount) ||
			amount < 0 ||
			amount > 1
		) {
			throw new TypeError('amount must be a number between 0 and 1');
		}
	},
});

const tileStyle: React.CSSProperties = {
	border: '1px solid rgba(248, 250, 252, 0.18)',
	borderRadius: 8,
	overflow: 'hidden',
	position: 'relative',
};

const labelStyle: React.CSSProperties = {
	backgroundColor: 'rgba(2, 6, 23, 0.82)',
	border: '1px solid rgba(248, 250, 252, 0.14)',
	borderRadius: 8,
	bottom: 16,
	color: '#f8fafc',
	fontFamily: 'sans-serif',
	fontSize: 16,
	fontWeight: 700,
	left: 16,
	lineHeight: 1,
	padding: '10px 12px',
	position: 'absolute',
};

const swatchStyle: React.CSSProperties = {
	border: '1px solid rgba(248, 250, 252, 0.55)',
	borderRadius: 999,
	height: 18,
	width: 18,
};

export const PaletteMapDemoComp: React.FC<PaletteMapDemoProps> = ({
	amount,
	palette,
}) => {
	const colors = palettes[palette];

	return (
		<AbsoluteFill
			style={{
				backgroundColor: '#050816',
				display: 'grid',
				gap: 20,
				gridTemplateColumns: '1fr 1fr',
				padding: 32,
			}}
		>
			<div style={tileStyle}>
				<CanvasImage
					src={EFFECTS_PREVIEW_IMAGE_SRC}
					width={1280}
					height={720}
					fit="cover"
					style={{
						height: '100%',
						width: '100%',
					}}
				/>
				<div style={labelStyle}>source</div>
			</div>
			<div style={tileStyle}>
				<CanvasImage
					src={EFFECTS_PREVIEW_IMAGE_SRC}
					width={1280}
					height={720}
					fit="cover"
					style={{
						height: '100%',
						width: '100%',
					}}
					effects={[
						paletteMap({
							amount,
							palette: colors,
						}),
					]}
				/>
				<div
					style={{
						...labelStyle,
						alignItems: 'center',
						display: 'flex',
						gap: 8,
					}}
				>
					{colors.map((color) => {
						return (
							<span
								key={color}
								style={{
									...swatchStyle,
									backgroundColor: color,
								}}
							/>
						);
					})}
					<span>{palette}</span>
				</div>
			</div>
		</AbsoluteFill>
	);
};
