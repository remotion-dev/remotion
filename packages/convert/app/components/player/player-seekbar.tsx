import type React from 'react';
import {useEffect, useState} from 'react';

const clamp = (value: number, min: number, max: number) => {
	return Math.min(Math.max(value, min), max);
};

export const getTimeFromX = (
	clientX: number,
	durationInSeconds: number,
	width: number,
) => {
	if (
		width <= 0 ||
		durationInSeconds <= 0 ||
		!Number.isFinite(clientX) ||
		!Number.isFinite(durationInSeconds) ||
		!Number.isFinite(width)
	) {
		return 0;
	}

	const progress = clamp(clientX / width, 0, 1);

	return durationInSeconds * progress;
};

export const getSeekBarProgress = (
	currentTime: number,
	durationInSeconds: number,
) => {
	if (
		currentTime <= 0 ||
		durationInSeconds <= 0 ||
		!Number.isFinite(currentTime) ||
		!Number.isFinite(durationInSeconds)
	) {
		return 0;
	}

	return clamp(currentTime / durationInSeconds, 0, 1);
};

export const useHoverState = (
	ref: React.RefObject<HTMLDivElement | null>,
	hideControlsWhenPointerDoesntMove: boolean | number,
) => {
	const [hovered, setHovered] = useState(false);

	useEffect(() => {
		const {current} = ref;
		if (!current) {
			return;
		}

		let hoverTimeout: Timer;
		const addHoverTimeout = () => {
			if (hideControlsWhenPointerDoesntMove) {
				clearTimeout(hoverTimeout);
				hoverTimeout = setTimeout(
					() => {
						setHovered(false);
					},
					hideControlsWhenPointerDoesntMove === true
						? 3000
						: hideControlsWhenPointerDoesntMove,
				);
			}
		};

		const onHover = () => {
			setHovered(true);
			addHoverTimeout();
		};

		const onLeave = () => {
			setHovered(false);
			clearTimeout(hoverTimeout);
		};

		const onMove = () => {
			setHovered(true);
			addHoverTimeout();
		};

		current.addEventListener('mouseenter', onHover);
		current.addEventListener('mouseleave', onLeave);
		current.addEventListener('mousemove', onMove);

		return () => {
			current.removeEventListener('mouseenter', onHover);
			current.removeEventListener('mouseleave', onLeave);
			current.removeEventListener('mousemove', onMove);
			clearTimeout(hoverTimeout);
		};
	}, [hideControlsWhenPointerDoesntMove, ref]);
	return hovered;
};
