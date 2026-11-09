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

const OffsetComponent = () => {
	const frame = useCurrentFrame();
	return (
		<AbsoluteFill>
			<svg width={0} height={0} style={{position: 'absolute'}}>
				<defs>
					<filter
						id="svg-filter-offset"
						filterUnits="userSpaceOnUse"
						x={-30}
						y={-30}
						width={160}
						height={140}
						colorInterpolationFilters="sRGB"
					>
						<feOffset dx={frame === 0 ? -12 : 14} dy={frame === 0 ? 9 : -11} />
					</filter>
					<filter
						id="svg-filter-offset-blur"
						filterUnits="userSpaceOnUse"
						x={-30}
						y={-30}
						width={160}
						height={140}
						colorInterpolationFilters="sRGB"
					>
						<feOffset dx={frame === 0 ? 14 : -12} dy={frame === 0 ? -11 : 9} />
						<feGaussianBlur stdDeviation={2} />
					</filter>
				</defs>
			</svg>
			{[1, 2].flatMap((scale, row) =>
				['svg-filter-offset', 'svg-filter-offset-blur'].map((id, column) => (
					<div
						key={`${scale}-${id}`}
						style={{
							position: 'absolute',
							left: 50 + column * 290,
							top: 50 + row * 220,
							width: 100,
							height: 80,
							transform: `scale(${scale})`,
							transformOrigin: '0 0',
							filter: `url(#${id})`,
							background: 'red',
						}}
					>
						<div
							style={{
								position: 'absolute',
								left: 20,
								top: 10,
								width: 45,
								height: 40,
								backgroundColor: 'rgba(0, 0, 255, .5)',
							}}
						/>
					</div>
				)),
			)}
		</AbsoluteFill>
	);
};

export const svgFilterOffsetReference = {
	...svgFilterReference,
	component: OffsetComponent,
	id: 'svg-filter-offset',
	width: 620,
	height: 500,
};

// KINO-7772: preserve overflowing filter inputs and apply masks after filtering.
const ReviewComponent = () => {
	const frame = useCurrentFrame();
	return (
		<AbsoluteFill>
			<svg width={0} height={0} style={{position: 'absolute'}}>
				<defs>
					<filter
						id="svg-filter-review-identity"
						filterUnits="userSpaceOnUse"
						x={-20}
						y={-20}
						width={140}
						height={120}
						colorInterpolationFilters="sRGB"
					>
						<feColorMatrix
							type="matrix"
							values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 1 0"
						/>
					</filter>
					<filter
						id="svg-filter-review-offset"
						filterUnits="userSpaceOnUse"
						x={0}
						y={0}
						width={100}
						height={80}
						colorInterpolationFilters="sRGB"
					>
						<feOffset dx={30 + frame * 2} dy={0} />
					</filter>
				</defs>
			</svg>
			{[
				'url(#svg-filter-review-identity) brightness(1)',
				'url(#missing-review-filter)',
				'url(#svg-filter-review-offset)',
			].map((filter, index) => (
				<div
					key={filter}
					style={{
						position: 'absolute',
						left: 40 + index * 160,
						top: 30,
						width: 100,
						height: 80,
						backgroundColor: 'red',
						filter,
						maskImage:
							index === 2
								? 'linear-gradient(to right, black 50%, transparent 50%)'
								: undefined,
					}}
				>
					{index !== 2 ? (
						<div
							style={{
								position: 'absolute',
								left: -15 - frame * 2,
								top: 10,
								width: 30,
								height: 40,
								backgroundColor: 'blue',
							}}
						/>
					) : null}
				</div>
			))}
		</AbsoluteFill>
	);
};

export const svgFilterReviewReference = {
	...svgFilterReference,
	component: ReviewComponent,
	id: 'svg-filter-review',
	width: 520,
	height: 140,
};

// PR #13037: the filter itself establishes the containing block.
const ContainingBlockComponent = () => {
	const frame = useCurrentFrame();
	return (
		<AbsoluteFill style={{background: 'white'}}>
			<svg width={0} height={0} style={{position: 'absolute'}}>
				<defs>
					<filter
						id="svg-filter-containing-block"
						filterUnits="userSpaceOnUse"
						x={0}
						y={0}
						width={100}
						height={80}
					>
						<feColorMatrix type="saturate" values="1" />
					</filter>
				</defs>
			</svg>
			{(['absolute', 'fixed'] as const).map((position) => (
				<div
					key={position}
					style={{position: 'relative', width: 400, height: 200}}
				>
					<div
						style={{
							marginLeft: 100,
							width: 100,
							height: 80,
							filter: 'url(#svg-filter-containing-block)',
						}}
					>
						<div
							style={{
								position,
								left: 10 + frame * 4,
								top: 10,
								width: 20,
								height: 20,
								background: 'red',
							}}
						/>
					</div>
				</div>
			))}
		</AbsoluteFill>
	);
};

export const svgFilterContainingBlockReference = {
	component: ContainingBlockComponent,
	id: 'svg-filter-containing-block',
	width: 400,
	height: 400,
	fps: 30,
	durationInFrames: 2,
} as const;
