import {AbsoluteFill, useCurrentFrame} from 'remotion';

const references = [
	'user',
	'bbox',
	'shape-transform',
	'clip-transform',
	'hidden',
	'empty',
	'missing',
	'malformed%zz',
] as const;
const Component = () => {
	const frame = useCurrentFrame();
	return (
		<AbsoluteFill style={{backgroundColor: 'transparent'}}>
			<svg width={0} height={0} style={{position: 'absolute'}}>
				<defs>
					<clipPath id="clip-reference-user">
						<rect x={10 + frame * 4} y={10} width={60} height={40} />
					</clipPath>
					<clipPath id="clip-reference-bbox" clipPathUnits="objectBoundingBox">
						<rect x={0.1} y={0.2} width={0.7} height={0.6} />
					</clipPath>
					<clipPath id="clip-reference-shape-transform">
						<rect
							x={10}
							y={10}
							width={50}
							height={30}
							transform="translate(10 10)"
						/>
					</clipPath>
					<clipPath
						id="clip-reference-clip-transform"
						transform="translate(10 10) scale(.5)"
					>
						<rect width={100} height={60} />
					</clipPath>
					<clipPath id="clip-reference-hidden">
						<rect x={10} y={10} width={20} height={40} />
						<rect
							x={60}
							y={10}
							width={20}
							height={40}
							style={{display: 'none'}}
						/>
					</clipPath>
					<clipPath id="clip-reference-empty" />
				</defs>
			</svg>
			{references.map((ref, i) => (
				<div
					key={ref}
					style={{
						position: 'absolute',
						left: 20 + i * 120,
						top: 20,
						width: 100,
						height: 80,
						clipPath: `url(#clip-reference-${ref})`,
						backgroundColor: 'rgba(200,40,90,.5)',
					}}
				>
					<AbsoluteFill
						style={{
							backgroundColor: 'rgba(0,40,255,.5)',
							transform: 'translate(30px, 20px)',
						}}
					/>
				</div>
			))}
		</AbsoluteFill>
	);
};

export const clipPathReference = {
	component: Component,
	id: 'clip-path-reference',
	width: 1100,
	height: 120,
	fps: 30,
	durationInFrames: 2,
} as const;
