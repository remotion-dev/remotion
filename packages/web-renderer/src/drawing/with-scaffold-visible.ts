// Read authored inherited visibility without the renderer-owned hidden scaffold.
// The callback must finish synchronously, before scaffold visibility is restored.
export const withScaffoldVisible = <T>(element: Element, read: () => T): T => {
	const scaffold = element.closest<HTMLElement>('[data-remotion-scaffold]');
	if (!scaffold) return read();
	const {visibility} = scaffold.style;
	const priority = scaffold.style.getPropertyPriority('visibility');
	scaffold.style.setProperty('visibility', 'visible', 'important');
	try {
		return read();
	} finally {
		scaffold.style.setProperty('visibility', visibility, priority);
	}
};
