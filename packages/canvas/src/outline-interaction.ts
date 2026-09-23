import type {CanvasSelectionInteraction} from './selection';

export type CanvasOutlinePointerDownDecision = {
	readonly interaction: CanvasSelectionInteraction;
	readonly temporaryTranslate: boolean;
	readonly shouldUpdateSelection: boolean;
	readonly deferSelection: boolean;
	readonly dragExistingSelection: boolean;
	readonly pointerInsideSelectedOutline: boolean;
};

export const getCanvasOutlineSelectionInteraction = ({
	shiftKey,
	metaKey,
	ctrlKey,
}: {
	readonly shiftKey: boolean;
	readonly metaKey: boolean;
	readonly ctrlKey: boolean;
}): CanvasSelectionInteraction => ({
	shiftKey,
	toggleKey: metaKey || ctrlKey,
});

/**
 * Consumes a primary pointer down and decides how it affects the selection.
 * Hosts with dragging defer the selection until pointer release when requested;
 * hosts without dragging can apply every requested selection immediately.
 */
export const handleCanvasOutlinePointerDown = ({
	event,
	polygon,
	hasTarget,
	selected,
	containsSelection,
	translateWithCommandKey,
	isMac,
}: {
	readonly event: Pick<
		PointerEvent,
		| 'button'
		| 'clientX'
		| 'clientY'
		| 'shiftKey'
		| 'metaKey'
		| 'ctrlKey'
		| 'preventDefault'
		| 'stopPropagation'
	>;
	readonly polygon: SVGPolygonElement | null;
	readonly hasTarget: boolean;
	readonly selected: boolean;
	readonly containsSelection: boolean;
	readonly translateWithCommandKey: boolean;
	readonly isMac: boolean;
}): CanvasOutlinePointerDownDecision | null => {
	if (event.button !== 0 || !hasTarget) {
		return null;
	}

	event.preventDefault();
	event.stopPropagation();

	const temporaryTranslate =
		translateWithCommandKey &&
		(selected || containsSelection) &&
		(isMac ? event.metaKey : event.ctrlKey);
	const interaction = temporaryTranslate
		? {shiftKey: false, toggleKey: false}
		: getCanvasOutlineSelectionInteraction(event);
	const shouldUpdateSelection =
		!selected || interaction.shiftKey || interaction.toggleKey;
	const ownerSvg = polygon?.ownerSVGElement;
	let pointerInsideSelectedOutline = false;
	if (ownerSvg) {
		pointerInsideSelectedOutline = Array.from(
			ownerSvg.querySelectorAll<SVGPolygonElement>(
				'polygon[data-remotion-directly-selected-outline="true"]',
			),
		).some((selectedPolygon) => {
			// Map the pointer into the polygon's local space without
			// `getScreenCTM()`: the overlay lives inside Studio's fit-scale
			// ancestor, whose CSS transform WebKit's getScreenCTM() ignores.
			// A uniformly-scaled rect (the only case here — the overlay svg is
			// unscaled and CSS transforms above it are fit scales/translations)
			// is inverted via the bounding rect.
			const rect = selectedPolygon.getBoundingClientRect();
			if (rect.width === 0 && rect.height === 0) {
				return false;
			}

			const bbox = selectedPolygon.getBBox();
			if (bbox.width === 0 && bbox.height === 0) {
				return false;
			}

			const scaleX = rect.width / bbox.width;
			const scaleY = rect.height / bbox.height;
			if (!Number.isFinite(scaleX) || !Number.isFinite(scaleY)) {
				return false;
			}

			// A collapsed or anisotropically distorted outline has no reliable
			// inverse; treat it as unhittable, like a collapsed CTM before.
			if (Math.abs(scaleX) < 1e-6 || Math.abs(scaleY) < 1e-6) {
				return false;
			}

			const localX = (event.clientX - rect.left) / scaleX + bbox.x;
			const localY = (event.clientY - rect.top) / scaleY + bbox.y;
			if (!Number.isFinite(localX) || !Number.isFinite(localY)) {
				return false;
			}

			const polygonPoint = ownerSvg.createSVGPoint();
			polygonPoint.x = localX;
			polygonPoint.y = localY;
			return (
				selectedPolygon.isPointInFill(polygonPoint) ||
				selectedPolygon.isPointInStroke(polygonPoint)
			);
		});
	}

	const deferSelection =
		!selected &&
		!interaction.shiftKey &&
		!interaction.toggleKey &&
		(containsSelection || pointerInsideSelectedOutline);

	return {
		interaction,
		temporaryTranslate,
		shouldUpdateSelection,
		deferSelection,
		dragExistingSelection: selected || deferSelection,
		pointerInsideSelectedOutline,
	};
};
