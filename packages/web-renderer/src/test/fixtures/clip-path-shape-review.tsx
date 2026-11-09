import {AbsoluteFill, useCurrentFrame} from 'remotion';

const variants = [
	'plain',
	'metadata',
	'hidden-child',
	'hidden-resource',
	'hidden-svg',
	'visible-override',
] as const;
const Component = ({opaque = false}: {readonly opaque?: boolean}) => {
	const frame = useCurrentFrame();
	return (
		<AbsoluteFill style={{backgroundColor: opaque ? 'black' : undefined}}>
			{(['path', 'polygon'] as const).flatMap((shape, row) =>
				variants.map((variant, index) => {
					const id = `shape-review-${shape}-${variant}`;
					const hiddenSvg =
						variant === 'hidden-svg' || variant === 'visible-override';
					const visibility =
						variant === 'hidden-child'
							? 'hidden'
							: variant === 'visible-override'
								? 'visible'
								: undefined;
					return (
						<div key={id}>
							<svg
								width={0}
								height={0}
								style={{position: 'absolute'}}
								visibility={hiddenSvg ? 'hidden' : undefined}
							>
								<defs>
									<clipPath
										id={id}
										visibility={
											variant === 'hidden-resource' ? 'hidden' : undefined
										}
									>
										{variant === 'metadata' ? (
											<>
												<title>Shape clip</title>
												<desc>Descriptive metadata</desc>
											</>
										) : null}
										{shape === 'path' ? (
											<path
												d={`M10 10H${60 + frame * 4}V60H10Z`}
												visibility={visibility}
											/>
										) : (
											<polygon
												points={`10,10 ${60 + frame * 4},10 ${60 + frame * 4},60 10,60`}
												visibility={visibility}
											/>
										)}
									</clipPath>
								</defs>
							</svg>
							<div
								style={{
									position: 'absolute',
									left: 12 + index * 120,
									top: 12 + row * 112,
									width: 100,
									height: 80,
									clipPath: `url(#${id})`,
									backgroundColor: opaque ? 'white' : 'rgba(200,40,90,.5)',
								}}
							>
								{opaque ? null : (
									<AbsoluteFill
										style={{
											backgroundColor: 'rgba(0,40,255,.5)',
											transform: `translate(${20 + frame * 4}px,20px)`,
										}}
									/>
								)}
							</div>
						</div>
					);
				}),
			)}
		</AbsoluteFill>
	);
};

export const clipPathShapeReview = {
	component: Component,
	id: 'clip-path-shape-review',
	width: 740,
	height: 236,
	fps: 30,
	durationInFrames: 2,
} as const;
export const clipPathShapeReviewOpaque = {
	...clipPathShapeReview,
	id: 'clip-path-shape-review-opaque',
	component: () => <Component opaque />,
};
