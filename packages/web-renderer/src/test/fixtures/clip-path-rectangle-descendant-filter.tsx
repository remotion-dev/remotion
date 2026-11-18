import {AbsoluteFill, useCurrentFrame} from 'remotion';

const Component = ({
	objectBoundingBox = false,
}: {
	readonly objectBoundingBox?: boolean;
}) => {
	const frame = useCurrentFrame();
	return (
		<AbsoluteFill style={{backgroundColor: 'black'}}>
			<svg width="0" height="0">
				<defs>
					<clipPath
						id="descendant-filter-clip"
						clipPathUnits={
							objectBoundingBox ? 'objectBoundingBox' : 'userSpaceOnUse'
						}
					>
						<rect
							width={objectBoundingBox ? 0.4 : 80}
							height={objectBoundingBox ? 1 : 80}
						/>
						<rect
							x={objectBoundingBox ? 0.4 : 80}
							width={objectBoundingBox ? 0.4 : 80}
							height={objectBoundingBox ? 1 : 80}
						/>
					</clipPath>
				</defs>
			</svg>
			<div
				style={{
					position: 'absolute',
					left: 20,
					top: 20,
					width: 100,
					height: 80,
					clipPath: 'url(#descendant-filter-clip)',
				}}
			>
				<div
					style={{
						width: 100,
						height: 80,
						backgroundColor: 'white',
						filter: `drop-shadow(${30 + frame * 4}px 0 0 red)`,
					}}
				/>
			</div>
		</AbsoluteFill>
	);
};

export const clipPathRectangleDescendantFilter = {
	component: Component,
	id: 'clip-path-rectangle-descendant-filter',
	width: 320,
	height: 160,
	fps: 30,
	durationInFrames: 2,
} as const;

export const clipPathRectangleDescendantFilterObjectBox = {
	...clipPathRectangleDescendantFilter,
	id: 'clip-path-rectangle-descendant-filter-object-box',
	component: () => <Component objectBoundingBox />,
};
