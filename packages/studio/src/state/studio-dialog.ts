import {createContext} from 'react';

export const StudioDialogContext = createContext<HTMLDialogElement | null>(
	null,
);

const openDialogs: HTMLDialogElement[] = [];
export const getActiveStudioDialog = () =>
	openDialogs[openDialogs.length - 1] ?? null;

const listeners = new Set<() => void>();
export const subscribeToStudioDialogs = (listener: () => void) => {
	listeners.add(listener);
	return () => {
		listeners.delete(listener);
	};
};

const notifyDialogChange = () => {
	for (const listener of listeners) {
		listener();
	}
};

export const openStudioDialog = (dialog: HTMLDialogElement) => {
	dialog.showModal();
	openDialogs.push(dialog);
	notifyDialogChange();
	return () => {
		openDialogs.splice(openDialogs.indexOf(dialog), 1);
		dialog.close();
		notifyDialogChange();
	};
};

export const getDialogTabStops = (dialog: HTMLDialogElement) =>
	[
		...dialog.querySelectorAll<HTMLElement>(
			'button, input, select, textarea, a[href], iframe, summary, [contenteditable="true"], [tabindex]',
		),
	].filter(
		(element) =>
			element.tabIndex >= 0 &&
			!element.matches(':disabled') &&
			!element.closest('[inert]') &&
			element.getClientRects().length > 0 &&
			getComputedStyle(element).visibility === 'visible',
	);
