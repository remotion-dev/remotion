// Both surfaces must participate in hit testing: an opaque pointer-events:none
// ruler can cover the preview while allowing elementFromPoint to reach it.
export const isTrackDropPreviewAboveRuler = (
	element: HTMLElement | SVGElement,
) => {
	const ruler = element.ownerDocument.querySelector<HTMLElement>(
		'[data-timeline-ruler]',
	);
	if (!ruler) throw new Error('Expected the timeline ruler');
	const previewBounds = element.getBoundingClientRect();
	const rulerBounds = ruler.getBoundingClientRect();
	const x = previewBounds.x + previewBounds.width / 2;
	const y = rulerBounds.bottom - 2;
	if (
		x < rulerBounds.left ||
		x >= rulerBounds.right ||
		y < rulerBounds.top ||
		y >= rulerBounds.bottom
	) {
		throw new Error('Expected the paint-order sample inside the ruler');
	}

	const originals = [element, ruler].map((surface) => ({
		surface,
		value: surface.style.getPropertyValue('pointer-events'),
		priority: surface.style.getPropertyPriority('pointer-events'),
	}));
	try {
		for (const {surface} of originals) {
			surface.style.setProperty('pointer-events', 'auto', 'important');
		}

		return element.ownerDocument.elementFromPoint(x, y) === element;
	} finally {
		for (const {surface, value, priority} of originals) {
			surface.style.setProperty('pointer-events', value, priority);
		}
	}
};
