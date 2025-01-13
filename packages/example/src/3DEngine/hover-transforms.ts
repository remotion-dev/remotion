import React from 'react';

export const useHoverTransforms = (
	ref: React.RefObject<HTMLDivElement | null>,
) => {
	const [hoverProgress, setHoverProgress] = React.useState(0);

	React.useEffect(() => {
		const element = ref.current;
		if (!element) return;

		let animationFrame: number;
		let start: number | null = null;
		let isHovered = false;

		const animate = (timestamp: number) => {
			if (start === null) start = timestamp;
			const progress = Math.min((timestamp - start) / 150, 1);
			setHoverProgress(isHovered ? progress : 1 - progress);

			if (progress < 1) {
				animationFrame = requestAnimationFrame(animate);
			}
		};

		const handleMouseEnter = () => {
			isHovered = true;
			start = null;
			cancelAnimationFrame(animationFrame);
			animationFrame = requestAnimationFrame(animate);
		};

		const handleMouseLeave = () => {
			isHovered = false;
			start = null;
			cancelAnimationFrame(animationFrame);
			animationFrame = requestAnimationFrame(animate);
		};

		element.addEventListener('mouseenter', handleMouseEnter);
		element.addEventListener('mouseleave', handleMouseLeave);

		return () => {
			element.removeEventListener('mouseenter', handleMouseEnter);
			element.removeEventListener('mouseleave', handleMouseLeave);
			cancelAnimationFrame(animationFrame);
		};
	}, [ref]);

	return hoverProgress;
};
