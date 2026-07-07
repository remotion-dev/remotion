import React, {useId} from 'react';

export const CanvasSectionTitle: React.FC<{
	readonly children: string;
}> = ({children}) => {
	const svgId = useId().replace(/:/g, '');
	const glowFilterId = `title-glow-${svgId}`;
	const glowClipId = `title-glow-clip-${svgId}`;

	return (
		<>
			<svg
				aria-hidden="true"
				className="pointer-events-none absolute w-full overflow-visible h-20"
				focusable="false"
				preserveAspectRatio="none"
				viewBox="0 0 1200 320"
			>
				<g clipPath={`url(#${glowClipId})`} filter={`url(#${glowFilterId})`}>
					<ellipse
						cx="600"
						cy="320"
						fill="rgba(0, 0, 0, 0.1)"
						rx="400"
						ry={'100'}
					/>
				</g>
				<defs>
					<filter
						id={glowFilterId}
						colorInterpolationFilters="sRGB"
						filterUnits="userSpaceOnUse"
						height="1120"
						width="2000"
						x="-400"
						y="-480"
					>
						<feGaussianBlur stdDeviation="140" />
					</filter>
					<clipPath id={glowClipId} clipPathUnits="userSpaceOnUse">
						<rect height="320" width="2000" x="-400" y="0" />
					</clipPath>
				</defs>
			</svg>

			<div className="relative h-24 w-full overflow-visible">
				<div className="relative z-10 flex h-full items-end justify-center">
					<h2
						className="m-0 text-center text-4xl leading-none text-black"
						style={{
							fontFamily: 'GTPlanarVF, GTPlanar, sans-serif',
							fontVariationSettings: "'slnt' 0, 'wght' 700",
							fontStyle: 'normal',
							fontWeight: 700,
							paddingBottom: 16,
						}}
					>
						{children}
					</h2>
				</div>
			</div>
		</>
	);
};
