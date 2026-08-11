import {useEffect, type RefObject} from 'react';

export const QUICK_SWITCHER_RESULT_LABEL_FONT_SIZE = 15;

export const loopIndex = (index: number, length: number) => {
	if (index < 0) {
		index += length;
	}

	return index % length;
};

export const useScrollIntoViewOnSelected = <T extends HTMLElement>(
	ref: RefObject<T | null>,
	selected: boolean,
) => {
	useEffect(() => {
		if (selected) {
			ref.current?.scrollIntoView({
				block: 'nearest',
				inline: 'center',
			});
		}
	}, [ref, selected]);
};
