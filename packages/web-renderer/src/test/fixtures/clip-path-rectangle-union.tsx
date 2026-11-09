import {AbsoluteFill, useCurrentFrame} from 'remotion';

const references = [
	'disjoint',
	'overlap',
	'reflected',
	'bbox',
	'evenodd',
	'animated',
	'hidden-empty',
	'resource-transform',
	'reflected-evenodd',
	'bbox-percent',
	'overflow',
	'opacity',
] as const;
const Component = () => {
	const frame = useCurrentFrame();
	return (
		<AbsoluteFill>
			<svg width={0} height={0} style={{position: 'absolute'}}>
				<defs>
					<clipPath id="clip-union-disjoint">
						<rect x={10} y={10} width={20} height={50} />
						<rect x={60} y={10} width={20} height={50} />
					</clipPath>
					<clipPath id="clip-union-overlap">
						<rect x={10} y={10} width={50} height={40} />
						<rect x={40} y={30} width={40} height={40} />
					</clipPath>
					<clipPath id="clip-union-reflected">
						<rect x={10} y={10} width={50} height={40} />
						<rect
							x={0}
							y={10}
							width={50}
							height={40}
							transform="translate(80 0) scale(-1 1)"
						/>
					</clipPath>
					<clipPath id="clip-union-bbox" clipPathUnits="objectBoundingBox">
						<rect x={0} y={0} width={0.5} height={0.5} />
						<rect x={0.25} y={0.25} width={0.5} height={0.5} />
					</clipPath>
					<clipPath id="clip-union-evenodd" clipRule="evenodd">
						<rect x={10} y={10} width={50} height={40} />
						<rect x={40} y={30} width={40} height={40} />
					</clipPath>
					<clipPath id="clip-union-animated">
						<rect x={10} y={10} width={30} height={50} />
						<rect x={30 + frame * 8} y={20} width={40} height={40} />
					</clipPath>
					<clipPath id="clip-union-hidden-empty">
						<rect x={10} y={10} width={20} height={50} />
						<rect x={30} y={10} width={0} height={50} />
						<rect x={50} y={10} width={30} height={50} />
						<rect width={100} height={80} style={{display: 'none'}} />
					</clipPath>
					<clipPath
						id="clip-union-resource-transform"
						transform="translate(10 10) scale(.5)"
					>
						<rect width={80} height={100} />
						<rect x={60} width={80} height={60} />
					</clipPath>
					<clipPath id="clip-union-reflected-evenodd" clipRule="evenodd">
						<rect x={10} y={10} width={50} height={40} />
						<rect
							x={0}
							y={10}
							width={50}
							height={40}
							transform="translate(80 0) scale(-1 1)"
						/>
					</clipPath>
					<clipPath
						id="clip-union-bbox-percent"
						clipPathUnits="objectBoundingBox"
					>
						<rect width="50%" height="50%" />
						<rect x="25%" y="25%" width="50%" height="50%" />
					</clipPath>
					<clipPath id="clip-union-overflow">
						<rect x={-10} y={10} width={60} height={50} />
						<rect x={40} y={20} width={100} height={60} />
					</clipPath>
				</defs>
			</svg>
			{references.map((reference, index) => (
				<div
					key={reference}
					style={{
						position: 'absolute',
						left: 20 + (index % 6) * 120,
						top: 20 + Math.floor(index / 6) * 120,
						width: 100,
						height: 80,
						clipPath: `url(#clip-union-${reference === 'opacity' ? 'overlap' : reference})`,
						opacity: reference === 'opacity' ? 0.5 : 1,
						backgroundColor: 'rgba(200,40,90,.5)',
					}}
				>
					<AbsoluteFill
						style={{
							backgroundColor: 'rgba(0,40,255,.5)',
							transform: `translate(${20 + frame * 4}px,20px)`,
						}}
					/>
				</div>
			))}
		</AbsoluteFill>
	);
};

export const clipPathRectangleUnion = {
	component: Component,
	id: 'clip-path-rectangle-union',
	width: 760,
	height: 260,
	fps: 30,
	durationInFrames: 2,
} as const;
