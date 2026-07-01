import React, {useEffect, useId, useRef, useState} from 'react';

export const CanvasSectionTitle: React.FC<{
	readonly children: string;
}> = ({children}) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const [slant, setSlant] = useState(0);
	const svgId = useId().replace(/:/g, '');
	const glowFilterId = `title-glow-${svgId}`;
	const glowClipId = `title-glow-clip-${svgId}`;

	useEffect(() => {
		let animationFrame = 0;
		const getSlant = () => {
			const container = containerRef.current;
			if (!container) {
				return 0;
			}

			const rect = container.getBoundingClientRect();
			const viewportHeight =
				window.innerHeight || document.documentElement.clientHeight;
			const center = rect.top + rect.height / 2;
			const straightZoneTop = viewportHeight * 0.25;
			const straightZoneBottom = viewportHeight * 0.75;

			if (center >= straightZoneTop && center <= straightZoneBottom) {
				return 0;
			}

			const distance =
				center < straightZoneTop
					? straightZoneTop - center
					: center - straightZoneBottom;
			const maxDistance =
				center < straightZoneTop
					? straightZoneTop
					: viewportHeight - straightZoneBottom;
			const progress = Math.min(1, distance / maxDistance);

			return progress * -45;
		};

		const scheduleDraw = () => {
			cancelAnimationFrame(animationFrame);
			animationFrame = requestAnimationFrame(() => {
				setSlant(getSlant());
			});
		};

		const resizeObserver = new ResizeObserver(scheduleDraw);
		if (containerRef.current) {
			resizeObserver.observe(containerRef.current);
		}

		document.fonts
			?.load('oblique 0deg 700 60px GTPlanarVF')
			.then(scheduleDraw)
			.catch(() => undefined);
		window.addEventListener('scroll', scheduleDraw, {passive: true});
		window.addEventListener('resize', scheduleDraw);
		scheduleDraw();

		return () => {
			resizeObserver.disconnect();
			window.removeEventListener('scroll', scheduleDraw);
			window.removeEventListener('resize', scheduleDraw);
			cancelAnimationFrame(animationFrame);
		};
	}, [children]);

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

			<div ref={containerRef} className="relative h-20 w-full overflow-visible">
				<div className="relative z-10 flex h-full items-end justify-center">
					<h2
						className="m-0 text-center text-4xl leading-none text-black"
						style={{
							fontFamily: 'GTPlanarVF, GTPlanar, sans-serif',
							fontVariationSettings: `'slnt' ${slant}, 'wght' 700`,
							fontStyle: `oblique ${slant}deg`,
							fontWeight: 700,
							paddingBottom: 10,
						}}
					>
						{children}
					</h2>
				</div>
			</div>
		</>
	);
};
