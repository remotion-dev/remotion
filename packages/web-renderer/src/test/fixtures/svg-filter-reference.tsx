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
const Component = ({
	expanded = false,
	objectBoundingBox = false,
	scale = 2,
}: {
	readonly expanded?: boolean;
	readonly objectBoundingBox?: boolean;
	readonly scale?: number;
}) => {
	const frame = useCurrentFrame();
	return (
		<AbsoluteFill>
			<svg width={0} height={0} style={{position: 'absolute'}}>
				<defs>
					<filter
						id="svg-filter-swap"
						filterUnits={
							objectBoundingBox ? 'objectBoundingBox' : 'userSpaceOnUse'
						}
						x={expanded ? (objectBoundingBox ? '-20%' : -20) : 0}
						y={expanded ? (objectBoundingBox ? '-25%' : -20) : 0}
						width={objectBoundingBox ? '140%' : expanded ? 140 : 100}
						height={objectBoundingBox ? '150%' : expanded ? 120 : 80}
						colorInterpolationFilters={scale === 1.5 ? undefined : 'sRGB'}
					>
						<feColorMatrix
							type="matrix"
							values="0 0 1 0 0  0 1 0 0 0  1 0 0 0 0  0 0 0 1 0"
						/>
					</filter>
					<filter
						id="svg-filter-blur"
						filterUnits={
							objectBoundingBox ? 'objectBoundingBox' : 'userSpaceOnUse'
						}
						x={expanded ? (objectBoundingBox ? '-20%' : -20) : 0}
						y={expanded ? (objectBoundingBox ? '-25%' : -20) : 0}
						width={objectBoundingBox ? '140%' : expanded ? 140 : 100}
						height={objectBoundingBox ? '150%' : expanded ? 120 : 80}
						colorInterpolationFilters={scale === 1.5 ? undefined : 'sRGB'}
					>
						{expanded ? (
							<feColorMatrix
								type="matrix"
								values="0 0 1 0 0  0 1 0 0 0  1 0 0 0 0  0 0 0 1 0"
							/>
						) : null}
						<feGaussianBlur
							stdDeviation={frame === 0 ? 2 : 3}
							x={objectBoundingBox ? -12 : undefined}
							y={objectBoundingBox ? -12 : undefined}
							width={objectBoundingBox ? 124 : undefined}
							height={objectBoundingBox ? 104 : undefined}
						/>
					</filter>
				</defs>
			</svg>
			{cases.map((c, i) => (
				<div
					key={c.id}
					style={{
						position: 'absolute',
						left: expanded ? 40 + i * 260 : 20 + i * 140,
						top: expanded ? 40 : 20,
						transform: expanded && i % 2 ? `scale(${scale})` : 'none',
						transformOrigin: '0 0',
						width: 100,
						height: 80,
						backgroundColor: 'red',
						filter:
							expanded && i === 0
								? 'url(#svg-filter-blur)'
								: expanded && i === 3
									? 'url(#svg-filter-swap)'
									: c.filter,
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

export const svgFilterExpandedReference = {
	...svgFilterReference,
	component: () => <Component expanded />,
	id: 'svg-filter-expanded',
	width: 1100,
	height: 260,
};
export const svgFilterBoundingBoxReference = {
	...svgFilterExpandedReference,
	component: () => <Component expanded objectBoundingBox />,
	id: 'svg-filter-bounding-box',
};
export const svgFilterFractionalReference = {
	...svgFilterExpandedReference,
	component: () => <Component expanded scale={1.5} />,
	id: 'svg-filter-fractional',
};
