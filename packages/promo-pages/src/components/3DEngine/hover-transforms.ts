import React, {useEffect, useMemo, useState} from 'react';

type State = {
	progress: number;
	isActive: boolean;
};

export const useHoverTransforms = (
	ref: React.RefObject<HTMLDivElement | null>,
	disabled: boolean,
) => {
	const [state, setState] = React.useState<State>({
		progress: 0,
		isActive: false,
	});

	const eventTarget = useMemo(() => new EventTarget(), []);

	useEffect(() => {
		if (disabled) {
			eventTarget.dispatchEvent(new Event('disabled'));
		} else {
			eventTarget.dispatchEvent(new Event('enabled'));
		}
	}, [disabled, eventTarget]);

	React.useEffect(() => {
		const element = ref.current;
		if (!element) return;

		let animationFrame: number;
		let start: number | null = null;
		let isHovered = false;
		let internalDisabled = disabled;

		const animate = (timestamp: number) => {
			if (start === null) start = timestamp;
			const progress = Math.min((timestamp - start) / 150, 1);
			setState(() => ({
				isActive: isHovered && !internalDisabled,
				progress: isHovered && !internalDisabled ? progress : 1 - progress,
			}));

			if (progress < 1) {
				animationFrame = requestAnimationFrame(animate);
			}
		};

		const animateIn = () => {
			start = null;
			cancelAnimationFrame(animationFrame);
			animationFrame = requestAnimationFrame(animate);
		};

		const handleMouseEnter = () => {
			isHovered = true;
			if (internalDisabled) {
				return;
			}

			animateIn();
		};

		const handleMouseLeave = () => {
			isHovered = false;
			animateIn();
		};

		const handleDisabled = () => {
			internalDisabled = true;

			if (!isHovered) {
				return;
			}

			animateIn();
		};

		const handleEnabled = () => {
			internalDisabled = false;

			if (!isHovered) {
				return;
			}

			animateIn();
		};

		element.addEventListener('mouseenter', handleMouseEnter);
		element.addEventListener('mouseleave', handleMouseLeave);
		eventTarget.addEventListener('disabled', handleDisabled);
		eventTarget.addEventListener('enabled', handleEnabled);

		return () => {
			element.removeEventListener('mouseenter', handleMouseEnter);
			element.removeEventListener('mouseleave', handleMouseLeave);
			eventTarget.removeEventListener('disabled', handleDisabled);
			eventTarget.removeEventListener('enabled', handleEnabled);
			cancelAnimationFrame(animationFrame);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ref, eventTarget]);

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
