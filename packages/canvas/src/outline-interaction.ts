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
		const screenPoint = ownerSvg.createSVGPoint();
		screenPoint.x = event.clientX;
		screenPoint.y = event.clientY;
		pointerInsideSelectedOutline = Array.from(
			ownerSvg.querySelectorAll<SVGPolygonElement>(
				'polygon[data-remotion-directly-selected-outline="true"]',
			),
		).some((selectedPolygon) => {
			const screenTransform = selectedPolygon.getScreenCTM();
			if (screenTransform === null) {
				return false;
			}

			// A collapsed transform has no hittable area and cannot be inverted.
			if (
				screenTransform.a * screenTransform.d -
					screenTransform.b * screenTransform.c ===
				0
			) {
				return false;
			}

			const polygonPoint = screenPoint.matrixTransform(
				screenTransform.inverse(),
			);
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
