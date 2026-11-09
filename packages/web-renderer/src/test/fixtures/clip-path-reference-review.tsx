import {AbsoluteFill, useCurrentFrame} from 'remotion';

const cases = [
	'css-only',
	'css-override',
	'metadata',
	'metadata-only',
	'hidden-child',
	'hidden-resource',
	'hidden-svg',
	'visible-override',
	'percent-zero',
	'percent-unit',
	'percent-large',
	'percent-hidden-zero',
	'percent-hidden-unit',
	'css-percent',
	'css-calc',
	'class-important',
	'inline-important',
] as const;
const Component = ({opaque = false}: {readonly opaque?: boolean}) => {
	const frame = useCurrentFrame();
	return (
		<AbsoluteFill style={{backgroundColor: opaque ? 'black' : undefined}}>
			<style>{`.clip-review-important {
				clip-path: url(#clip-review-class-important) !important;
				opacity: .5 !important;
			}`}</style>
			{cases.map((kind, index) => {
				const percent = kind.startsWith('percent-');
				const viewport = kind.endsWith('unit')
					? 1
					: ['percent-large', 'css-percent', 'css-calc'].includes(kind)
						? 200
						: 0;
				const svgHidden = kind === 'hidden-svg' || kind === 'visible-override';
				const metadata = kind === 'metadata' || kind === 'metadata-only';
				const shape = percent ? (
					<rect
						x="10%"
						y="10%"
						width="50%"
						height="50%"
						visibility={kind.includes('hidden') ? 'hidden' : undefined}
					/>
				) : kind === 'css-only' ? (
					<rect style={{x: 10 + frame * 4, y: 10, width: 50, height: 40}} />
				) : kind === 'css-override' ? (
					<rect
						x={10}
						y={10}
						width={50}
						height={40}
						style={{x: 20 + frame * 4, y: 20, width: 30, height: 20}}
					/>
				) : kind === 'css-percent' || kind === 'css-calc' ? (
					<rect
						x={10}
						y={10}
						width={50}
						height={40}
						style={{
							x: `calc(10% + ${frame * 4}px)`,
							y: '10%',
							width: kind === 'css-calc' ? 'calc(50% - 4px)' : '50%',
							height: '50%',
						}}
					/>
				) : kind === 'hidden-child' ? (
					<rect x={10} y={10} width={50} height={40} visibility="hidden" />
				) : kind === 'visible-override' ? (
					<rect x={10} y={10} width={50} height={40} visibility="visible" />
				) : (
					<rect x={10 + frame * 4} y={10} width={50} height={40} />
				);
				return (
					<div key={kind}>
						<svg
							width={viewport}
							height={viewport}
							style={{position: 'absolute'}}
							visibility={svgHidden ? 'hidden' : undefined}
						>
							<defs>
								<clipPath
									id={`clip-review-${kind}`}
									clipPathUnits={
										percent ? 'objectBoundingBox' : 'userSpaceOnUse'
									}
									visibility={kind === 'hidden-resource' ? 'hidden' : undefined}
								>
									{metadata ? (
										<>
											<title>Clipping geometry metadata</title>
											<desc>Descriptive nodes do not contribute geometry</desc>
										</>
									) : null}
									{kind === 'metadata-only' ? null : shape}
								</clipPath>
							</defs>
						</svg>
						<div
							ref={
								kind === 'inline-important'
									? (element) => {
											if (element) {
												element.style.setProperty(
													'clip-path',
													`url(#clip-review-${kind})`,
													'important',
												);
												element.style.setProperty('opacity', '.5', 'important');
											}
										}
									: undefined
							}
							className={
								kind === 'class-important' ? 'clip-review-important' : undefined
							}
							style={{
								position: 'absolute',
								left: 12 + (index % 4) * 140,
								top: 12 + Math.floor(index / 4) * 112,
								width: 100,
								height: 80,
								clipPath: `url(#clip-review-${kind})`,
								backgroundColor: opaque ? 'white' : 'rgba(200,40,90,.5)',
							}}
						>
							{opaque ? null : (
								<AbsoluteFill
									style={{
										backgroundColor: 'rgba(0,40,255,.5)',
										transform: 'translate(30px,20px)',
									}}
								/>
							)}
						</div>
					</div>
				);
			})}
		</AbsoluteFill>
	);
};

export const clipPathReferenceReview = {
	component: Component,
	id: 'clip-path-reference-review',
	width: 580,
	height: 572,
	fps: 30,
	durationInFrames: 2,
} as const;

export const clipPathReferenceReviewOpaque = {
	...clipPathReferenceReview,
	id: 'clip-path-reference-review-opaque',
	component: () => <Component opaque />,
};

const FilterOutsets = () => {
	const frame = useCurrentFrame();
	return (
		<AbsoluteFill>
			<svg width="0" height="0">
				<defs>
					<clipPath id="rectangle-filter-outsets">
						<rect x={-10} y={-10} width={150} height={120} />
					</clipPath>
				</defs>
			</svg>
			{['drop-shadow(10px 0 0 blue)', 'blur(2px)'].map((filter, index) => (
				<div
					key={filter}
					style={{
						position: 'absolute',
						left: 20 + index * 150 + frame * 4,
						top: 20,
						width: 100,
						height: 80,
						backgroundColor: 'red',
						clipPath: 'url(#rectangle-filter-outsets)',
						filter,
					}}
				>
					<div
						style={{
							position: 'absolute',
							left: 30,
							top: 20,
							width: 100,
							height: 80,
							backgroundColor: 'blue',
						}}
					/>
				</div>
			))}
		</AbsoluteFill>
	);
};

export const clipPathReferenceFilterOutsets = {
	...clipPathReferenceReview,
	component: FilterOutsets,
	id: 'clip-path-reference-filter-outsets',
	width: 320,
	height: 160,
};
