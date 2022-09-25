import {useEffect, useState} from 'react';

export const useHoverState = (ref: React.RefObject<HTMLDivElement>) => {
	const [hovered, stetHovered] = useState(() => {
		if (ref.current) {
			return ref.current.matches(':hover');
		}

		return false;
	});

	useEffect(() => {
		const {current} = ref;
		if (!current) {
			return;
		}

		const onHover = () => {
			stetHovered(true);
		};

		const onLeave = () => {
			stetHovered(false);
		};

		current.addEventListener('mouseenter', onHover);
		current.addEventListener('mouseleave', onLeave);
		return () => {
			current.removeEventListener('mouseenter', onHover);
			current.removeEventListener('mouseenter', onLeave);
		};
	}, [ref]);

	return hovered;
};
