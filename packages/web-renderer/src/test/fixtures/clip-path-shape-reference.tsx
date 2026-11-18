import {AbsoluteFill, useCurrentFrame} from 'remotion';

const references = [
	'polygon',
	'polygon-bbox',
	'path',
	'path-evenodd',
	'shape-transform',
	'clip-transform',
] as const;
const Component = () => {
	const frame = useCurrentFrame();
	return (
		<AbsoluteFill>
			<svg width={0} height={0} style={{position: 'absolute'}}>
				<defs>
					<clipPath id="clip-shape-polygon">
						<polygon
							points={`10,10 ${70 + frame * 4},10 ${70 + frame * 4},30 40,30 40,60 10,60`}
						/>
					</clipPath>
					<clipPath
						id="clip-shape-polygon-bbox"
						clipPathUnits="objectBoundingBox"
					>
						<polygon points=".1,.1 .8,.1 .8,.4 .4,.4 .4,.8 .1,.8" />
					</clipPath>
					<clipPath id="clip-shape-path">
						<path d={`M10 10H${70 + frame * 4}V60H10Z M25 25V45H50V25Z`} />
					</clipPath>
					<clipPath id="clip-shape-path-evenodd" clipRule="evenodd">
						<path d="M10 10H80V70H10Z M25 25H55V50H25Z" />
					</clipPath>
					<clipPath id="clip-shape-shape-transform">
						<polygon
							points="0,0 60,0 60,20 30,20 30,50 0,50"
							transform="translate(10 10)"
						/>
					</clipPath>
					<clipPath
						id="clip-shape-clip-transform"
						transform="translate(10 10) scale(.5)"
					>
						<path d="M0 0H120V40H60V100H0Z" />
					</clipPath>
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
						clipPath: `url(#clip-shape-${ref})`,
						backgroundColor: 'rgba(200,40,90,.5)',
					}}
				>
					<AbsoluteFill
						style={{
							backgroundColor: 'rgba(0,40,255,.5)',
							transform: `translate(${20 + frame * 4}px, 20px)`,
						}}
					/>
				</div>
			))}
		</AbsoluteFill>
	);
};

export const clipPathShapeReference = {
	component: Component,
	id: 'clip-path-shape-reference',
	width: 760,
	height: 120,
	fps: 30,
	durationInFrames: 2,
} as const;
