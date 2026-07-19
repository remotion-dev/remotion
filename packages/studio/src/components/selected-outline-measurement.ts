import type {_InternalTypes, OverrideIdToNodePaths, TSequence} from 'remotion';
import {calculateTimeline} from '../helpers/calculate-timeline';
import {BLACK, WHITE} from '../helpers/colors';
import {getBoxQuadsPonyfill} from '../helpers/get-box-quads-ponyfill';
import type {OutlinePoint, SelectedOutline} from './selected-outline-geometry';
import {mixPoint} from './selected-outline-geometry';
import type {
	SelectedOutlineTarget,
	SequenceWithSelectedOutline,
} from './selected-outline-types';
import {transformOriginFieldKey} from './selected-outline-types';
import {getUvHandlePosition} from './selected-outline-uv';
import {parseKeyframeFieldFromNodePath} from './Timeline/parse-keyframe-field-from-node-path';
import {
	getTimelineSequenceSelectionKey,
	type TimelineSelection,
	type TimelineSelectionInteraction,
} from './Timeline/TimelineSelection';
import {
	parseTransformOrigin,
	parsedTransformOriginToUv,
} from './Timeline/transform-origin-utils';

export const pointToString = (point: OutlinePoint) => `${point.x},${point.y}`;

export const midpoint = (
	from: OutlinePoint,
	to: OutlinePoint,
): OutlinePoint => {
	return mixPoint(from, to, 0.5);
};

export const getOutlineCenter = (
	points: SelectedOutline['points'],
): OutlinePoint => {
	const [tl, tr, br, bl] = points;
	return {
		x: (tl.x + tr.x + br.x + bl.x) / 4,
		y: (tl.y + tr.y + br.y + bl.y) / 4,
	};
};

export const dot = (left: OutlinePoint, right: OutlinePoint): number => {
	return left.x * right.x + left.y * right.y;
};

export const vectorLength = (vector: OutlinePoint): number => {
	return Math.hypot(vector.x, vector.y);
};

export const vectorBetween = (
	from: OutlinePoint,
	to: OutlinePoint,
): OutlinePoint => {
	return {x: to.x - from.x, y: to.y - from.y};
};

export const getAngleDegrees = (
	from: OutlinePoint,
	to: OutlinePoint,
): number => {
	return Math.atan2(to.y - from.y, to.x - from.x) * (180 / Math.PI);
};

export const getSelectedOutlineRotationDeltaDegrees = ({
	from,
	to,
}: {
	readonly from: number;
	readonly to: number;
}) => {
	return ((((to - from) % 360) + 540) % 360) - 180;
};

export type SelectedOutlineRotationCorner =
	| 'top-left'
	| 'top-right'
	| 'bottom-right'
	| 'bottom-left';

const normalizeRotationCursorDegrees = (rotation: number): number => {
	const normalizedRotation = ((rotation % 360) + 360) % 360;
	return Number(normalizedRotation.toFixed(3));
};

export const getRotationCursor = (rotation: number): string => {
	const normalizedRotation = normalizeRotationCursorDegrees(rotation);
	const transform =
		normalizedRotation === 0
			? ''
			: `<g transform="rotate(${normalizedRotation} 32 32)">`;
	const transformEnd = normalizedRotation === 0 ? '' : '</g>';
	const svg = `<svg width="24" height="24" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">${transform}<g transform="scale(0.876712329)" filter="url(#filter0_d_1_14)"><path d="M10.9111 17.7687C10.3413 18.3701 10.367 19.3195 10.9684 19.8893L20.7687 29.1738C21.3701 29.7436 22.3195 29.7179 22.8893 29.1165C23.459 28.5151 23.4334 27.5657 22.832 26.996L14.1206 18.7431L22.3735 10.0316C22.9432 9.43022 22.9176 8.48082 22.3162 7.91107C21.7148 7.34133 20.7654 7.36699 20.1956 7.96839L10.9111 17.7687ZM49.3923 58.3118C49.9509 58.9235 50.8996 58.9667 51.5114 58.4081L61.481 49.3055C62.0927 48.7469 62.1359 47.7981 61.5773 47.1863C61.0187 46.5745 60.0699 46.5314 59.4581 47.09L50.5963 55.1812L42.5051 46.3194C41.9465 45.7076 40.9977 45.6645 40.386 46.2231C39.7742 46.7817 39.7311 47.7304 40.2896 48.3422L49.3923 58.3118ZM12.6747 18.7431L13 19.8893C22.1283 19.6426 30.7584 21.4283 37.8564 26.6927C44.8518 31.8809 49.734 39.8538 49 56H50.5963H51.5114C52.2774 39.1461 47.6482 30.2198 39.6436 24.2831C31.7416 18.4224 22.3717 17.2467 13 17.5L12.6747 18.7431Z" fill="${BLACK}"/><path d="M19.1064 6.93652C20.2459 5.73379 22.1448 5.68278 23.3477 6.82227C24.5505 7.96181 24.6022 9.86076 23.4629 11.0635L18.7373 16.0508C26.3487 16.4239 33.9128 18.1651 40.5371 23.0781C44.7339 26.1907 48.0794 30.1189 50.2568 35.4834C51.9666 39.6958 52.9327 44.7395 53.0742 50.8867L58.4463 45.9824C59.6697 44.8654 61.5673 44.9514 62.6846 46.1748C63.8018 47.3985 63.7155 49.296 62.4922 50.4131L52.5225 59.5156C51.337 60.5979 49.5196 60.5507 48.3916 59.4346L48.2842 59.3232L39.1816 49.3535C38.0648 48.1301 38.1507 46.2324 39.374 45.1152C40.5975 43.9979 42.4961 44.0841 43.6133 45.3076L47.4756 49.5381C47.1908 44.7613 46.2876 40.9448 44.9482 37.8291C43.0666 33.4521 40.2851 30.3614 36.9629 27.8975C31.8259 24.0875 25.8071 22.1663 19.2891 21.5732L23.8633 25.9072C25.0662 27.0468 25.1178 28.9457 23.9785 30.1484C22.8746 31.3135 21.0576 31.3982 19.8516 30.3662L19.7373 30.2627L9.93652 20.9785C8.73384 19.839 8.6828 17.9401 9.82227 16.7373L19.1064 6.93652Z" stroke="${WHITE}" stroke-width="3"/></g>${transformEnd}<defs><filter id="filter0_d_1_14" x="0" y="0" width="72.4696" height="72.3004" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/><feOffset dy="3"/><feGaussianBlur stdDeviation="3.75"/><feComposite in2="hardAlpha" operator="out"/><feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/><feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1_14"/><feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1_14" result="shape"/></filter></defs></svg>`;
	return `url("data:image/svg+xml,${encodeURIComponent(svg)}") 12 12, alias`;
};

const rotationCursorBaseDegrees = {
	'top-left': 270,
	'top-right': 0,
	'bottom-right': 90,
	'bottom-left': 180,
} satisfies Record<SelectedOutlineRotationCorner, number>;

const getOutlineRotationDegrees = (
	points: SelectedOutline['points'],
): number => {
	const [tl, tr] = points;
	return getAngleDegrees(tl, tr);
};

const getRotationCursorDegrees = (
	points: SelectedOutline['points'],
	corner: SelectedOutlineRotationCorner,
) =>
	normalizeRotationCursorDegrees(
		getOutlineRotationDegrees(points) + rotationCursorBaseDegrees[corner],
	);

export const getSelectedOutlineRotationCornerInfo = (
	points: SelectedOutline['points'],
	corner: SelectedOutlineRotationCorner,
) => {
	const [tl, tr, br, bl] = points;
	const point = {
		'top-left': tl,
		'top-right': tr,
		'bottom-right': br,
		'bottom-left': bl,
	}[corner];
	const center = getOutlineCenter(points);
	const cursorDegrees = getRotationCursorDegrees(points, corner);

	return {
		center,
		cursor: getRotationCursor(cursorDegrees),
		cursorDegrees,
		point,
	};
};

export const getSelectedOutlineRotationPivot = ({
	dimensions,
	points,
	transformOriginValue,
}: {
	readonly dimensions: SelectedOutline['dimensions'];
	readonly points: SelectedOutline['points'];
	readonly transformOriginValue: string;
}): OutlinePoint => {
	if (dimensions === null) {
		return getOutlineCenter(points);
	}

	const parsed = parseTransformOrigin(transformOriginValue);
	if (parsed === null) {
		return getOutlineCenter(points);
	}

	const uv = parsedTransformOriginToUv({
		parsed,
		width: dimensions.width,
		height: dimensions.height,
	});
	if (uv === null) {
		return getOutlineCenter(points);
	}

	return getUvHandlePosition(points, uv);
};

const rectToPoints = (
	elementRect: DOMRect,
	containerRect: DOMRect,
): SelectedOutline['points'] => {
	const left = elementRect.left - containerRect.left;
	const top = elementRect.top - containerRect.top;
	const right = elementRect.right - containerRect.left;
	const bottom = elementRect.bottom - containerRect.top;

	return [
		{x: left, y: top},
		{x: right, y: top},
		{x: right, y: bottom},
		{x: left, y: bottom},
	];
};

type SvgViewport = {
	readonly x: number;
	readonly y: number;
	readonly width: number;
	readonly height: number;
};

type SvgScreenCtm = Pick<DOMMatrixReadOnly, 'a' | 'b' | 'c' | 'd' | 'e' | 'f'>;

export const getTransformedSvgViewportPoints = ({
	viewport,
	ctm,
	containerRect,
}: {
	readonly viewport: SvgViewport;
	readonly ctm: SvgScreenCtm;
	readonly containerRect: Pick<DOMRect, 'left' | 'top'>;
}): SelectedOutline['points'] => {
	const transformPoint = (x: number, y: number): OutlinePoint => ({
		x: ctm.a * x + ctm.c * y + ctm.e - containerRect.left,
		y: ctm.b * x + ctm.d * y + ctm.f - containerRect.top,
	});

	const left = viewport.x;
	const top = viewport.y;
	const right = viewport.x + viewport.width;
	const bottom = viewport.y + viewport.height;

	return [
		transformPoint(left, top),
		transformPoint(right, top),
		transformPoint(right, bottom),
		transformPoint(left, bottom),
	];
};

const quadToPoints = (
	quad: DOMQuad,
	containerRect: DOMRect,
): SelectedOutline['points'] => {
	// `getBoxQuads`/the ponyfill returns the quad in viewport coordinates.
	// The overlay <svg> is unscaled (the canvas `scale()`/pan live on a sibling
	// container, not the svg), so 1 user unit == 1 px and we only need to move
	// the quad into the svg's local space by subtracting its viewport origin.
	// We deliberately do not pass `relativeTo` to the ponyfill: when the target
	// is not an ancestor of the element, the polyfill cannot resolve the
	// coordinate space and leaves the quad in viewport coordinates.
	return [
		{x: quad.p1.x - containerRect.left, y: quad.p1.y - containerRect.top},
		{x: quad.p2.x - containerRect.left, y: quad.p2.y - containerRect.top},
		{x: quad.p3.x - containerRect.left, y: quad.p3.y - containerRect.top},
		{x: quad.p4.x - containerRect.left, y: quad.p4.y - containerRect.top},
	];
};

const isSvgSvgElement = (element: Element): element is SVGSVGElement => {
	const ownerSvgSvgElement = element.ownerDocument.defaultView?.SVGSVGElement;
	return (
		(typeof SVGSVGElement !== 'undefined' &&
			element instanceof SVGSVGElement) ||
		(ownerSvgSvgElement !== undefined && element instanceof ownerSvgSvgElement)
	);
};

const getSvgSvgElementViewport = (element: SVGSVGElement): SvgViewport => {
	const viewBox = element.viewBox.baseVal;
	if (viewBox.width > 0 && viewBox.height > 0) {
		return {
			x: viewBox.x,
			y: viewBox.y,
			width: viewBox.width,
			height: viewBox.height,
		};
	}

	return {
		x: 0,
		y: 0,
		width: element.width.baseVal.value,
		height: element.height.baseVal.value,
	};
};

const getSvgSvgElementOutlinePoints = (
	element: SVGSVGElement,
	containerRect: DOMRect,
): SelectedOutline['points'] | null => {
	const ctm = element.getScreenCTM();
	const viewport = getSvgSvgElementViewport(element);
	if (ctm === null || (viewport.width === 0 && viewport.height === 0)) {
		return null;
	}

	return getTransformedSvgViewportPoints({
		viewport,
		ctm,
		containerRect,
	});
};

const getElementOutlinePoints = (
	element: Element,
	containerRect: DOMRect,
): SelectedOutline['points'] | null => {
	const elementRect = element.getBoundingClientRect();

	if (elementRect.width === 0 && elementRect.height === 0) {
		return null;
	}

	if (isSvgSvgElement(element)) {
		return getSvgSvgElementOutlinePoints(element, containerRect);
	}

	const quads = getBoxQuadsPonyfill(element, {
		box: 'border',
	});
	const quad = quads?.[0];
	if (!quad) {
		return rectToPoints(elementRect, containerRect);
	}

	return quadToPoints(quad, containerRect);
};

export const getSelectedSequenceKeys = (
	selectedItems: readonly TimelineSelection[],
): Set<string> => {
	return new Set(
		selectedItems
			.filter((item) => item.type === 'sequence')
			.map((item) => getTimelineSequenceSelectionKey(item.nodePathInfo)),
	);
};

export const getSequenceKeysContainingSelection = (
	selectedItems: readonly TimelineSelection[],
): Set<string> => {
	return new Set(
		selectedItems
			.filter((item) => item.type !== 'guide')
			.map((item) => getTimelineSequenceSelectionKey(item.nodePathInfo)),
	);
};

export const getOutlineSelectionInteraction = ({
	shiftKey,
	metaKey,
	ctrlKey,
}: {
	readonly shiftKey: boolean;
	readonly metaKey: boolean;
	readonly ctrlKey: boolean;
}): TimelineSelectionInteraction => ({
	shiftKey,
	toggleKey: metaKey || ctrlKey,
});

type SelectedEffectFields = {
	allFields: boolean;
	fieldKeys: Set<string>;
};

const getKeyframeOrEasingField = (item: TimelineSelection) => {
	if (item.type !== 'keyframe' && item.type !== 'easing') {
		return null;
	}

	return parseKeyframeFieldFromNodePath(item.nodePathInfo.auxiliaryKeys);
};

export const getSelectedEffectFieldsBySequenceKey = (
	selectedItems: readonly TimelineSelection[],
): Map<string, Map<number, SelectedEffectFields>> => {
	const selectedEffects = new Map<string, Map<number, SelectedEffectFields>>();

	for (const item of selectedItems) {
		if (item.type === 'guide') {
			continue;
		}

		const sequenceKey = getTimelineSequenceSelectionKey(item.nodePathInfo);
		const effectsForSequence =
			selectedEffects.get(sequenceKey) ??
			new Map<number, SelectedEffectFields>();

		const addSelectedFields = ({
			effectIndex,
			fieldKey,
			allFields,
		}: {
			readonly effectIndex: number;
			readonly fieldKey: string | null;
			readonly allFields: boolean;
		}) => {
			const selectedFields = effectsForSequence.get(effectIndex) ?? {
				allFields: false,
				fieldKeys: new Set<string>(),
			};

			if (allFields) {
				selectedFields.allFields = true;
			} else if (fieldKey !== null) {
				selectedFields.fieldKeys.add(fieldKey);
			}

			effectsForSequence.set(effectIndex, selectedFields);
			selectedEffects.set(sequenceKey, effectsForSequence);
		};

		if (item.type === 'sequence-effect') {
			addSelectedFields({
				effectIndex: item.i,
				fieldKey: null,
				allFields: true,
			});
			continue;
		}

		if (item.type === 'sequence-effect-prop') {
			addSelectedFields({
				effectIndex: item.i,
				fieldKey: item.key,
				allFields: false,
			});
			continue;
		}

		const keyframedField = getKeyframeOrEasingField(item);
		if (keyframedField?.type === 'effect') {
			addSelectedFields({
				effectIndex: keyframedField.effectIndex,
				fieldKey: keyframedField.fieldKey,
				allFields: false,
			});
		}
	}

	return selectedEffects;
};

type SelectedTransformOriginInfo = {
	readonly sequenceKey: string;
	readonly displayFrame: number | null;
};

export const getSelectedTransformOriginInfo = (
	selectedItems: readonly TimelineSelection[],
): SelectedTransformOriginInfo | null => {
	if (selectedItems.length !== 1) {
		return null;
	}

	const [selectedItem] = selectedItems;
	if (
		selectedItem.type === 'sequence-prop' &&
		selectedItem.key === transformOriginFieldKey
	) {
		return {
			sequenceKey: getTimelineSequenceSelectionKey(selectedItem.nodePathInfo),
			displayFrame: null,
		};
	}

	if (selectedItem.type !== 'keyframe' && selectedItem.type !== 'easing') {
		return null;
	}

	const field = getKeyframeOrEasingField(selectedItem);
	if (
		field?.type !== 'sequence' ||
		field.fieldKey !== transformOriginFieldKey
	) {
		return null;
	}

	return {
		sequenceKey: getTimelineSequenceSelectionKey(selectedItem.nodePathInfo),
		displayFrame:
			selectedItem.type === 'keyframe'
				? selectedItem.frame
				: selectedItem.fromFrame,
	};
};

export const getSequencesWithSelectableOutlines = ({
	sequences,
	overrideIdsToNodePaths,
	compositions = [],
}: {
	readonly sequences: readonly TSequence[];
	readonly overrideIdsToNodePaths: OverrideIdToNodePaths;
	readonly compositions?: readonly _InternalTypes['AnyComposition'][];
}): SequenceWithSelectedOutline[] => {
	return calculateTimeline({
		sequences: [...sequences],
		overrideIdsToNodePaths,
		compositions,
	})
		.filter((track) => {
			if (track.nodePathInfo === null) {
				return false;
			}

			return (
				track.sequence.showInTimeline &&
				track.nodePathInfo.auxiliaryKeys.length === 0
			);
		})
		.filter((track) => track.sequence.refForOutline !== null)
		.sort((a, b) => a.depth - b.depth)
		.map((track) => {
			if (track.nodePathInfo === null) {
				throw new Error('Expected selected outline to have a node path');
			}

			return {
				depth: track.depth,
				keyframeDisplayOffset: track.keyframeDisplayOffset,
				key: getTimelineSequenceSelectionKey(track.nodePathInfo),
				nodePathInfo: track.nodePathInfo,
				sequence: track.sequence,
			};
		});
};

export const measureOutlines = (
	container: SVGSVGElement,
	targets: readonly SelectedOutlineTarget[],
): SelectedOutline[] => {
	const containerRect = container.getBoundingClientRect();
	const outlines: SelectedOutline[] = [];

	for (const target of targets) {
		const element = target.ref.current;
		if (element === null) {
			continue;
		}

		const points = getElementOutlinePoints(element, containerRect);
		if (points === null) {
			continue;
		}

		outlines.push({
			key: target.key,
			dimensions:
				element instanceof HTMLElement
					? {
							width: element.offsetWidth,
							height: element.offsetHeight,
						}
					: element instanceof SVGSVGElement
						? {
								width: element.width.baseVal.value,
								height: element.height.baseVal.value,
							}
						: null,
			points,
		});
	}

	return outlines;
};

export const outlinesAreEqual = (
	a: readonly SelectedOutline[],
	b: readonly SelectedOutline[],
): boolean => {
	if (a.length !== b.length) {
		return false;
	}

	for (let i = 0; i < a.length; i++) {
		if (a[i].key !== b[i].key) {
			return false;
		}

		if (
			a[i].dimensions?.width !== b[i].dimensions?.width ||
			a[i].dimensions?.height !== b[i].dimensions?.height
		) {
			return false;
		}

		for (let j = 0; j < a[i].points.length; j++) {
			if (
				Math.abs(a[i].points[j].x - b[i].points[j].x) > 0.01 ||
				Math.abs(a[i].points[j].y - b[i].points[j].y) > 0.01
			) {
				return false;
			}
		}
	}

	return true;
};
