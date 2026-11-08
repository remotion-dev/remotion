import {useLayoutEffect, type RefObject} from 'react';
import {VERTICAL_SCROLLBAR_CLASSNAME} from '../Menu/is-menu-item';

export const useInspectorRightOffset = (
	ref: RefObject<HTMLDivElement | null>,
) => {
	useLayoutEffect(() => {
		const element = ref.current;
		if (element === null) {
			return;
		}

		const scrollContainer = element.closest(`.${VERTICAL_SCROLLBAR_CLASSNAME}`);
		const update = () => {
			const offset = scrollContainer
				? scrollContainer.getBoundingClientRect().right -
					element.getBoundingClientRect().right
				: 0;
			element.style.setProperty(
				'--remotion-inspector-right-offset',
				`${offset}px`,
			);
		};

		const observer = new ResizeObserver(update);
		observer.observe(element);

		if (scrollContainer) {
			observer.observe(scrollContainer);
		}

		update();

		return () => observer.disconnect();
	}, [ref]);
};
