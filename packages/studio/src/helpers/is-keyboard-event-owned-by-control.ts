export const isKeyboardEventOwnedByControl = (
	event: KeyboardEvent,
): boolean => {
	const ownsKeyboard = (element: EventTarget | null) =>
		element instanceof Element &&
		Boolean(
			element.closest(
				'video, audio, input, textarea, select, button, a[href], [contenteditable]:not([contenteditable="false"]), [role="textbox"], [role="slider"], [role="combobox"], [role="button"], [role="checkbox"], [role="switch"], [role="tab"], [role="radio"], [role="menuitem"], [role="menuitemcheckbox"], [role="menuitemradio"], [role="option"], [role="treeitem"]',
			),
		);
	return (
		ownsKeyboard(document.activeElement) ||
		event.composedPath().some(ownsKeyboard)
	);
};
