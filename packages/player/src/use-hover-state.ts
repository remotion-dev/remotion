import {useEffect, useState} from 'react';

export const useHoverState = (
	ref: React.RefObject<HTMLDivElement>,
	hideControlsWhenPointerDoesntMove?: boolean,
) => {
	const [hovered, stetHovered] = useState(false);

	useEffect(() => {
		const {current} = ref;
		if (!current) {
			return;
		}

		let hoverTimeout: NodeJS.Timeout;
		const addHoverTimeout = () => {
			if (hideControlsWhenPointerDoesntMove) {
				clearTimeout(hoverTimeout);
				hoverTimeout = setTimeout(() => {
					stetHovered(false);
				}, 3000);
			}
		};

		const onHover = () => {
			stetHovered(true);
			addHoverTimeout();
		};

		const onLeave = () => {
			stetHovered(false);
			clearTimeout(hoverTimeout);
		};

		const onMove = () => {
			stetHovered(true);
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
