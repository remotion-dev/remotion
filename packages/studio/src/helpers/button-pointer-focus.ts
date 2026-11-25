import type {MouseEvent} from 'react';
import {getActiveStudioDialog} from '../state/studio-dialog';

export const handleButtonPointerFocus = (
	event: MouseEvent<HTMLButtonElement>,
) => {
	if (event.button !== 0) {
		return;
	}

	const {activeElement} = event.currentTarget.ownerDocument;
	if (getActiveStudioDialog()?.contains(event.currentTarget)) {
		event.currentTarget.focus({preventScroll: true});
	} else if (activeElement instanceof HTMLElement) {
		activeElement.blur();
	}

	event.preventDefault();
};
