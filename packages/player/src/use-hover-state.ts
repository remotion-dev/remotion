import {useEffect, useState} from 'react';

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
