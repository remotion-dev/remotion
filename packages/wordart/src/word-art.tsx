import React, {useId} from 'react';
import {presets, type WordArtPreset} from './presets';

export type WordArtProps = {
	readonly children: string;
	readonly preset: WordArtPreset;
	readonly width?: number;
	readonly height?: number;
	readonly fontFamily?: string;
	readonly fontWeight?: React.CSSProperties['fontWeight'];
	readonly depth?: number;
	readonly distortion?: number;
	readonly style?: React.CSSProperties;
	readonly className?: string;
};

/**
 * Classic decorative text with SVG gradients, curved baselines, and extrusion.
 * @see [Documentation](https://www.remotion.dev/docs/wordart/word-art)
 */
export const WordArt: React.FC<WordArtProps> = ({
	children,
	preset,
	width = 800,
	height = 288,
	fontFamily = 'Arial Black, Arial, sans-serif',
	fontWeight = 900,
	depth,
	distortion = 1,
	style,
	className,
}) => {
	const id = useId().replace(/:/g, '');
	const appearance = presets[preset];
	if (!Object.hasOwn(presets, preset)) {
		throw new TypeError(`Unknown WordArt preset: ${preset}`);
	}

	const resolvedDepth = depth ?? appearance.depth;
	for (const [name, value, min, max] of [
		['width', width, Number.MIN_VALUE, Infinity],
		['height', height, Number.MIN_VALUE, Infinity],
		['depth', resolvedDepth, 0, 40],
		['distortion', distortion, 0, 1],
	] as const) {
		if (!Number.isFinite(value) || value < min || value > max) {
			throw new TypeError(
				`WordArt ${name} must be a finite number ${min === Number.MIN_VALUE ? 'greater than 0' : `between ${min} and ${max}`}, got ${value}`,
			);
		}
	}

	if (typeof children !== 'string') {
		throw new TypeError('WordArt children must be a string.');
	}

	// Keep the same design coordinates at every output size. Like the original
	// WordArt, text is stretched to fill the available width, including one letter.
	const baseline =
		children.length < 2
			? 'M 80 235 H 920'
			: preset === 'rainbow'
				? `M 80 240 Q 500 ${240 - 110 * distortion} 920 240`
				: preset === 'blue-wave'
					? `M 80 220 C 220 ${220 - 70 * distortion} 360 ${220 + 70 * distortion} 500 220 S 780 ${220 - 70 * distortion} 920 220`
					: 'M 80 235 H 920';
	const transform =
		preset === 'orange'
			? `translate(500 180) skewY(${-10 * distortion}) skewX(${-8 * distortion}) translate(-500 -180)`
			: preset === 'chrome'
				? `translate(500 180) skewX(${-12 * distortion}) translate(-500 -180)`
				: undefined;
	const layers = Math.ceil(resolvedDepth);
	const textId = `wordart-text-${id}`;
	const gradientId = `wordart-fill-${id}`;
	const baselineId = `wordart-baseline-${id}`;

	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={width}
			height={height}
			viewBox="0 0 1000 360"
			role="img"
			aria-label={children}
			className={className}
			style={{display: 'block', overflow: 'visible', ...style}}
		>
			<defs>
				<linearGradient
					id={gradientId}
					gradientUnits="userSpaceOnUse"
					x1={appearance.horizontalGradient ? 80 : 500}
					x2={appearance.horizontalGradient ? 920 : 500}
					y1={appearance.horizontalGradient ? 0 : 105}
					y2={appearance.horizontalGradient ? 0 : 240}
				>
					{appearance.stops.map(([offset, color]) => (
						<stop key={offset} offset={offset} stopColor={color} />
					))}
				</linearGradient>
				<path id={baselineId} d={baseline} />
				<text
					id={textId}
					fontFamily={fontFamily}
					fontWeight={fontWeight}
					fontSize={170}
					textAnchor="middle"
					strokeLinejoin="round"
					paintOrder="stroke"
				>
					<textPath
						href={`#${baselineId}`}
						startOffset="50%"
						textLength={820}
						lengthAdjust="spacingAndGlyphs"
					>
						{children}
					</textPath>
				</text>
			</defs>
			<g transform={transform} aria-hidden="true">
				{preset === 'rainbow' ? (
					<use
						href={`#${textId}`}
						transform="translate(9 12)"
						fill="#8b8b8b"
						fillOpacity={0.65}
					/>
				) : null}
				{Array.from({length: layers}, (_, index) => {
					// Subpixel steps keep shallow and animated extrusions continuous.
					const offset = (resolvedDepth * (layers - index)) / layers;
					return (
						<use
							key={index}
							href={`#${textId}`}
							transform={`translate(${-offset * 0.65} ${offset})`}
							fill={appearance.side}
							stroke={appearance.side}
							strokeWidth={2}
						/>
					);
				})}
				<use
					href={`#${textId}`}
					fill={`url(#${gradientId})`}
					stroke={appearance.stroke}
					strokeWidth={preset === 'rainbow' ? 0.7 : 2}
				/>
			</g>
		</svg>
	);
};
