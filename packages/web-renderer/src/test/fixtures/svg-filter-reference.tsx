import {AbsoluteFill, useCurrentFrame} from 'remotion';

const cases = [
	{id: 'matrix', filter: 'url(#svg-filter-swap)', opacity: 1},
	{id: 'blur', filter: 'url(#svg-filter-blur)', opacity: 1},
	{id: 'group-opacity', filter: 'url(#svg-filter-swap)', opacity: 0.5},
	{
		id: 'identity-filter-chain',
		filter: 'url(#svg-filter-swap) brightness(1)',
		opacity: 1,
	},
] as const;
const Component = () => {
	const frame = useCurrentFrame();
	return (
		<AbsoluteFill>
			<svg width={0} height={0} style={{position: 'absolute'}}>
				<defs>
					<filter
						id="svg-filter-swap"
						filterUnits="userSpaceOnUse"
						x={0}
						y={0}
						width={100}
						height={80}
						colorInterpolationFilters="sRGB"
					>
						<feColorMatrix
							type="matrix"
							values="0 0 1 0 0  0 1 0 0 0  1 0 0 0 0  0 0 0 1 0"
						/>
					</filter>
					<filter
						id="svg-filter-blur"
						filterUnits="userSpaceOnUse"
						x={0}
						y={0}
						width={100}
						height={80}
						colorInterpolationFilters="sRGB"
					>
						<feGaussianBlur stdDeviation={frame === 0 ? 2 : 3} />
					</filter>
				</defs>
			</svg>
			{cases.map((c, i) => (
				<div
					key={c.id}
					style={{
						position: 'absolute',
						left: 20 + i * 140,
						top: 20,
						width: 100,
						height: 80,
						backgroundColor: 'red',
						filter: c.filter,
						opacity: c.opacity,
					}}
				>
					<div
						style={{
							position: 'absolute',
							left: 20 + frame * 4,
							top: 20,
							width: 50,
							height: 40,
							backgroundColor: 'blue',
						}}
					/>
				</div>
			))}
		</AbsoluteFill>
	);
};

export const svgFilterReference = {
	component: Component,
	id: 'svg-filter-reference',
	width: 580,
	height: 120,
	fps: 30,
	durationInFrames: 2,
} as const;
