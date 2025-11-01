import React, {useEffect, useState} from 'react';

type State = {
	progress: number;
	isHovered: boolean;
};

export const useHoverTransforms = (
	ref: React.RefObject<HTMLDivElement | null>,
) => {
	const [state, setState] = React.useState<State>({
		progress: 0,
		isHovered: false,
	});

	React.useEffect(() => {
		const element = ref.current;
		if (!element) return;

		let animationFrame: number;
		let start: number | null = null;
		let isHovered = false;

		const animate = (timestamp: number) => {
			if (start === null) start = timestamp;
			const progress = Math.min((timestamp - start) / 150, 1);
			setState(() => ({
				isHovered,
				progress: isHovered ? progress : 1 - progress,
			}));

			if (progress < 1) {
				animationFrame = requestAnimationFrame(animate);
			}
		};

		const handleMouseEnter = () => {
			setState((prevState) => ({
				...prevState,
				isHovered: true,
			}));
			isHovered = true;
			start = null;
			cancelAnimationFrame(animationFrame);
			animationFrame = requestAnimationFrame(animate);
		};

		const handleMouseLeave = () => {
			setState((prevState) => ({
				...prevState,
				isHovered: false,
			}));
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

	return state;
};

export const useClickTransforms = (
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

		element.addEventListener('pointerdown', handleMouseEnter);
		element.addEventListener('pointerup', handleMouseLeave);

		return () => {
			element.removeEventListener('pointerdown', handleMouseEnter);
			element.removeEventListener('pointerup', handleMouseLeave);
			cancelAnimationFrame(animationFrame);
		};
	}, [ref]);

	return hoverProgress;
};

export const useMousePosition = (
	ref: React.RefObject<HTMLDivElement | null>,
) => {
	const [angle, setAngle] = useState(0);

	useEffect(() => {
		const element = ref.current;
		if (!element) {
			return;
		}

		const onMouseMove = (e: MouseEvent) => {
			const clientRect = element.getClientRects();
			if (!clientRect) {
				return;
			}

			const center = {
				x: clientRect[0].x + clientRect[0].width / 2,
				y: clientRect[0].y + clientRect[0].height / 2,
			};
			const angleX = Math.atan2(e.clientY - center.y, e.clientX - center.x);

			setAngle(angleX);
		};

		window.addEventListener('mousemove', onMouseMove);

		return () => {
			window.removeEventListener('mousemove', onMouseMove);
		};
	}, [ref]);

	return angle;
};
