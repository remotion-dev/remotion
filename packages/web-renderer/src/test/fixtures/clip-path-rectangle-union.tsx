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
	'filter-drop-shadow',
	'filter-blur',
	'authored-hidden',
	'override-visible',
	'important-hidden',
	'important-visible',
	'bbox-hidden-zero',
	'bbox-hidden-unit',
	'bbox-hidden-visible',
	'css-geometry',
	'class-important',
	'inline-important',
	'filter-overflow-shadow',
	'filter-overflow-blur',
] as const;
const Component = ({
	maskOnly = false,
	filterOutsetsOnly = false,
}: {
	readonly maskOnly?: boolean;
	readonly filterOutsetsOnly?: boolean;
}) => {
	const frame = useCurrentFrame();
	return (
		<AbsoluteFill style={{backgroundColor: maskOnly ? 'black' : undefined}}>
			<style>
				{
					'.clip-union-priority{clip-path:url(#clip-union-disjoint)!important;opacity:.5!important}.clip-authored-hidden {visibility:hidden !important}.clip-geometry-first{x:10px;y:10px;width:20px;height:50px}.clip-geometry-second{x:60px;y:10px;width:20px;height:50px}'
				}
			</style>
			{['bbox-hidden-zero', 'bbox-hidden-unit', 'bbox-hidden-visible'].map(
				(name) => (
					<svg
						key={name}
						width={name === 'bbox-hidden-zero' ? 0 : 1}
						height={name === 'bbox-hidden-zero' ? 0 : 1}
						visibility="hidden"
						style={{position: 'absolute'}}
					>
						<defs>
							<clipPath
								id={`clip-union-${name}`}
								clipPathUnits="objectBoundingBox"
							>
								<rect width="50%" height="100%" />
								<rect
									x="50%"
									width="50%"
									height="100%"
									style={{
										visibility:
											name === 'bbox-hidden-visible' ? 'visible' : undefined,
									}}
								/>
							</clipPath>
						</defs>
					</svg>
				),
			)}
			{[
				'authored-hidden',
				'override-visible',
				'important-hidden',
				'important-visible',
			].map((name) => (
				<svg
					key={name}
					width={0}
					height={0}
					visibility={name.startsWith('important') ? undefined : 'hidden'}
					className={
						name.startsWith('important') ? 'clip-authored-hidden' : undefined
					}
					style={{position: 'absolute'}}
				>
					<defs>
						<clipPath id={`clip-union-${name}`}>
							<rect x={10} y={10} width={20} height={50} />
							<rect
								x={60}
								y={10}
								width={20}
								height={50}
								style={{
									visibility: name.endsWith('visible') ? 'visible' : undefined,
								}}
							/>
						</clipPath>
					</defs>
				</svg>
			))}
			<svg width={0} height={0} style={{position: 'absolute'}}>
				<defs>
					<clipPath id="clip-union-css-geometry">
						<rect className="clip-geometry-first" />
						<rect className="clip-geometry-second" />
					</clipPath>
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
			{(filterOutsetsOnly ? references.slice(-2) : references.slice(0, -2)).map(
				(reference, index) => (
					<div
						key={reference}
						ref={
							reference === 'inline-important'
								? (element) => {
										if (element) {
											element.style.setProperty(
												'clip-path',
												'url(#clip-union-disjoint)',
												'important',
											);
											element.style.setProperty('opacity', '.5', 'important');
										}
									}
								: undefined
						}
						className={
							reference === 'class-important'
								? 'clip-union-priority'
								: undefined
						}
						style={{
							position: 'absolute',
							left: 20 + (index % 6) * 120,
							top: 20 + Math.floor(index / 6) * 120,
							width: 100,
							height: 80,
							clipPath: `url(#clip-union-${reference === 'opacity' ? 'overlap' : reference.endsWith('important') ? 'disjoint' : reference.startsWith('filter-overflow-') ? 'overflow' : reference.startsWith('filter-') ? 'disjoint' : reference})`,
							opacity: !maskOnly && reference === 'opacity' ? 0.5 : 1,
							filter: maskOnly
								? undefined
								: reference === 'filter-drop-shadow' ||
									  reference === 'filter-overflow-shadow'
									? 'drop-shadow(10px 0 0 blue)'
									: reference === 'filter-blur' ||
										  reference === 'filter-overflow-blur'
										? 'blur(2px)'
										: undefined,
							backgroundColor: maskOnly
								? 'white'
								: reference.startsWith('filter-')
									? 'red'
									: 'rgba(200,40,90,.5)',
						}}
					>
						{reference.startsWith('filter-') ? null : (
							<AbsoluteFill
								style={{
									backgroundColor: maskOnly ? 'white' : 'rgba(0,40,255,.5)',
									transform: `translate(${20 + frame * 4}px,20px)`,
								}}
							/>
						)}
					</div>
				),
			)}
		</AbsoluteFill>
	);
};

export const clipPathRectangleUnion = {
	component: Component,
	id: 'clip-path-rectangle-union',
	width: 760,
	height: 500,
	fps: 30,
	durationInFrames: 2,
} as const;

export const clipPathRectangleUnionOpaque = {
	...clipPathRectangleUnion,
	id: 'clip-path-rectangle-union-opaque',
	component: () => <Component maskOnly />,
};

export const clipPathRectangleUnionFilterOutsets = {
	...clipPathRectangleUnion,
	id: 'clip-path-rectangle-union-filter-outsets',
	component: () => <Component filterOutsetsOnly />,
	width: 280,
	height: 140,
};

const SvgTargetComponent = () => (
	<AbsoluteFill style={{backgroundColor: 'black'}}>
		{['hidden', 'reflected'].map((kind, index) => (
			<svg
				key={kind}
				width={100}
				height={80}
				style={{
					position: 'absolute',
					left: 20 + index * 140,
					top: 20,
					clipPath: `url(#clip-svg-target-${kind})`,
				}}
			>
				<defs>
					<clipPath id={`clip-svg-target-${kind}`}>
						<rect
							x={10}
							y={10}
							width={50}
							height={40}
							visibility={kind === 'hidden' ? 'hidden' : undefined}
						/>
						<rect
							x={0}
							y={10}
							width={50}
							height={40}
							transform="translate(80 0) scale(-1 1)"
							visibility={kind === 'hidden' ? 'hidden' : undefined}
						/>
					</clipPath>
				</defs>
				<rect width={100} height={80} fill="red" />
			</svg>
		))}
	</AbsoluteFill>
);
export const clipPathRectangleUnionSvgTarget = {
	...clipPathRectangleUnion,
	component: SvgTargetComponent,
	id: 'clip-path-rectangle-union-svg-target',
	width: 280,
	height: 140,
};

const FilterReview = ({
	scaled = false,
	native = false,
	childScale = 1,
	nested = false,
	blur = false,
}: {
	readonly scaled?: boolean;
	readonly native?: boolean;
	readonly childScale?: number;
	readonly nested?: boolean;
	readonly blur?: boolean;
}) => {
	const frame = useCurrentFrame();
	return (
		<div
			style={{
				position: 'absolute',
				width: scaled ? 200 : 300,
				height: scaled ? 140 : 160,
				backgroundColor: 'black',
				transform: native ? 'scale(2)' : undefined,
				transformOrigin: '0 0',
			}}
		>
			<svg width={0} height={0}>
				<defs>
					<clipPath id="clip-filter-review">
						<rect width={scaled ? 80 : 70} height={80} />
						<rect x={80} width={scaled ? 80 : 100} height={80} />
					</clipPath>
				</defs>
			</svg>
			<div
				style={{
					position: 'absolute',
					left: 20,
					top: 20,
					width: scaled ? 160 : 100,
					height: 80,
					clipPath: 'url(#clip-filter-review)',
					transform: scaled ? 'scale(.5,1)' : undefined,
					transformOrigin: '0 0',
					filter: scaled ? 'drop-shadow(10px 0 0 blue)' : undefined,
				}}
			>
				<div
					style={{
						position: 'absolute',
						left: (scaled ? 40 : 80) + frame,
						top: 20,
						width: 20,
						height: 20,
						backgroundColor: nested ? undefined : 'red',
						filter: scaled
							? undefined
							: blur
								? 'blur(2px)'
								: 'drop-shadow(20px 0 0 blue)',
						transform: `scale(${childScale})`,
						transformOrigin: '0 0',
					}}
				>
					{nested ? (
						<div
							style={{
								position: 'absolute',
								left: 20,
								width: 20,
								height: 20,
								backgroundColor: 'red',
							}}
						/>
					) : null}
				</div>
			</div>
		</div>
	);
};

export const clipDescendantFilter = {
	component: () => <FilterReview />,
	id: 'clip-descendant-filter',
	width: 300,
	height: 160,
	fps: 30,
	durationInFrames: 2,
} as const;
export const clipScaledFilter = {
	component: () => <FilterReview scaled />,
	id: 'clip-scaled-filter',
	width: 200,
	height: 140,
	fps: 30,
	durationInFrames: 2,
} as const;
export const clipScaledFilterNative = {
	...clipScaledFilter,
	component: () => <FilterReview scaled native />,
	id: 'clip-scaled-filter-native',
	width: 400,
	height: 280,
} as const;

export const clipTransformedDescendantFilter = {
	...clipDescendantFilter,
	component: () => <FilterReview childScale={2} />,
	id: 'clip-transformed-descendant-filter',
} as const;
export const clipDescendantBlur = {
	...clipDescendantFilter,
	component: () => <FilterReview blur />,
	id: 'clip-descendant-blur',
} as const;

export const clipNestedDescendantFilter = {
	...clipDescendantFilter,
	component: () => <FilterReview nested />,
	id: 'clip-nested-descendant-filter',
} as const;
