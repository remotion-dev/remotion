import React, {useContext, useEffect, useMemo, useRef, useState} from 'react';
import type {
	CanUpdateSequencePropStatusTrue,
	OverrideIdToNodePaths,
	SequencePropsSubscriptionKey,
	SequenceSchema,
	TSequence,
} from 'remotion';
import {Internals} from 'remotion';
import {calculateTimeline} from '../helpers/calculate-timeline';
import {StudioServerConnectionCtx} from '../helpers/client-id';
import {BLUE} from '../helpers/colors';
import {getBoxQuadsPonyfill} from '../helpers/get-box-quads-ponyfill';
import type {SequenceNodePathInfo} from '../helpers/get-timeline-sequence-sort-key';
import {
	forceSpecificCursor,
	stopForcingSpecificCursor,
} from './ForceSpecificCursor';
import {saveSequenceProp} from './Timeline/save-sequence-prop';
import {
	parseTranslate,
	serializeTranslate,
} from './Timeline/timeline-translate-utils';
import {
	ENABLE_OUTLINES,
	getTimelineSequenceSelectionKey,
	type TimelineSelection,
	useTimelineSelection,
} from './Timeline/TimelineSelection';

type OutlinePoint = {
	readonly x: number;
	readonly y: number;
};

type SelectedOutline = {
	readonly key: string;
	readonly points: readonly [
		OutlinePoint,
		OutlinePoint,
		OutlinePoint,
		OutlinePoint,
	];
};

type SelectedOutlineTarget = {
	readonly key: string;
	readonly ref: React.RefObject<HTMLElement | null>;
	readonly drag: SelectedOutlineDragTarget | null;
};

type SelectedOutlineDragTarget = {
	readonly codeValue: CanUpdateSequencePropStatusTrue;
	readonly clientId: string;
	readonly fieldDefault: string | undefined;
	readonly nodePath: SequencePropsSubscriptionKey;
	readonly schema: SequenceSchema;
};

type SequenceWithSelectedOutline = {
	readonly key: string;
	readonly nodePathInfo: SequenceNodePathInfo;
	readonly sequence: TSequence;
};

const translateFieldKey = 'style.translate';

const outlineContainer: React.CSSProperties = {
	position: 'absolute',
	inset: 0,
	pointerEvents: 'none',
	overflow: 'visible',
};

const pointToString = (point: OutlinePoint) => `${point.x},${point.y}`;

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

const getElementOutlinePoints = (
	element: HTMLElement,
	containerRect: DOMRect,
): SelectedOutline['points'] | null => {
	const elementRect = element.getBoundingClientRect();

	if (elementRect.width === 0 && elementRect.height === 0) {
		return null;
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

const getSelectedSequenceKeys = (
	selectedItems: readonly TimelineSelection[],
): Set<string> => {
	return new Set(
		selectedItems.map((item) =>
			getTimelineSequenceSelectionKey(item.nodePathInfo),
		),
	);
};

const getSequencesWithSelectedOutlines = ({
	selectedItems,
	sequences,
	overrideIdsToNodePaths,
}: {
	readonly selectedItems: readonly TimelineSelection[];
	readonly sequences: readonly TSequence[];
	readonly overrideIdsToNodePaths: OverrideIdToNodePaths;
}): SequenceWithSelectedOutline[] => {
	const selectedSequenceKeys = getSelectedSequenceKeys(selectedItems);

	if (selectedSequenceKeys.size === 0) {
		return [];
	}

	return calculateTimeline({
		sequences: [...sequences],
		overrideIdsToNodePaths,
	})
		.filter((track) => {
			if (track.nodePathInfo === null) {
				return false;
			}

			return selectedSequenceKeys.has(
				getTimelineSequenceSelectionKey(track.nodePathInfo),
			);
		})
		.filter((track) => track.sequence.refForOutline !== null)
		.map((track) => {
			if (track.nodePathInfo === null) {
				throw new Error('Expected selected outline to have a node path');
			}

			return {
				key: getTimelineSequenceSelectionKey(track.nodePathInfo),
				nodePathInfo: track.nodePathInfo,
				sequence: track.sequence,
			};
		});
};

const measureOutlines = (
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

		outlines.push({key: target.key, points});
	}

	return outlines;
};

const outlinesAreEqual = (
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

export const SelectedOutlineOverlay: React.FC<{
	readonly scale: number;
}> = ({scale}) => {
	const {selectedItems} = useTimelineSelection();
	const {sequences} = useContext(Internals.SequenceManager);
	const {codeValues} = useContext(Internals.VisualModeCodeValuesContext);
	const {getDragOverrides} = useContext(
		Internals.VisualModeDragOverridesContext,
	);
	const {setCodeValues, setDragOverrides, clearDragOverrides} = useContext(
		Internals.VisualModeSettersContext,
	);
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const {overrideIdToNodePathMappings} = useContext(
		Internals.OverrideIdsToNodePathsGettersContext,
	);
	const [outlines, setOutlines] = useState<readonly SelectedOutline[]>([]);
	const overlayRef = useRef<SVGSVGElement>(null);

	const selectedOutlineTargets = useMemo((): SelectedOutlineTarget[] => {
		if (!ENABLE_OUTLINES) {
			return [];
		}

		return getSequencesWithSelectedOutlines({
			selectedItems,
			sequences,
			overrideIdsToNodePaths: overrideIdToNodePathMappings,
		}).map(({key, nodePathInfo, sequence}) => {
			if (sequence.refForOutline === null) {
				throw new Error('Expected sequence to have a ref for outline');
			}

			const nodePath = nodePathInfo.sequenceSubscriptionKey;
			const {controls} = sequence;
			const fieldSchema = controls?.schema[translateFieldKey];
			const codeValue = Internals.getCodeValuesCtx(codeValues, nodePath)?.[
				translateFieldKey
			];
			const canDrag =
				previewServerState.type === 'connected' &&
				controls !== null &&
				fieldSchema?.type === 'translate' &&
				codeValue?.canUpdate === true;

			return {
				key,
				ref: sequence.refForOutline,
				drag: canDrag
					? {
							codeValue,
							clientId: previewServerState.clientId,
							fieldDefault: fieldSchema.default,
							nodePath,
							schema: controls.schema,
						}
					: null,
			};
		});
	}, [
		codeValues,
		overrideIdToNodePathMappings,
		previewServerState,
		selectedItems,
		sequences,
	]);

	const targetsByKey = useMemo(() => {
		return new Map(
			selectedOutlineTargets.map((target) => [target.key, target]),
		);
	}, [selectedOutlineTargets]);

	const onPointerDown = React.useCallback(
		(
			event: React.PointerEvent<SVGPolygonElement>,
			target: SelectedOutlineTarget,
		) => {
			const {drag} = target;
			if (event.button !== 0 || drag === null) {
				return;
			}

			event.preventDefault();
			event.stopPropagation();

			const startPointerX = event.clientX;
			const startPointerY = event.clientY;
			const dragOverrideValue = (getDragOverrides(drag.nodePath) ?? {})[
				translateFieldKey
			];
			const effectiveValue = Internals.getEffectiveVisualModeValue({
				codeValue: drag.codeValue,
				dragOverrideValue,
				defaultValue: drag.fieldDefault,
				shouldResortToDefaultValueIfUndefined: true,
			});
			const [startX, startY] = parseTranslate(
				String(effectiveValue ?? '0px 0px'),
			);
			const defaultValue =
				drag.fieldDefault !== undefined
					? JSON.stringify(drag.fieldDefault)
					: null;
			let lastValue: string | null = null;

			forceSpecificCursor('move');

			const onPointerMove = (moveEvent: PointerEvent) => {
				moveEvent.preventDefault();

				const nextX = startX + (moveEvent.clientX - startPointerX) / scale;
				const nextY = startY + (moveEvent.clientY - startPointerY) / scale;
				lastValue = serializeTranslate(nextX, nextY);
				setDragOverrides(drag.nodePath, translateFieldKey, lastValue);
			};

			const onPointerUp = () => {
				window.removeEventListener('pointermove', onPointerMove);
				window.removeEventListener('pointerup', onPointerUp);
				window.removeEventListener('pointercancel', onPointerUp);
				stopForcingSpecificCursor();

				const stringifiedValue =
					lastValue === null ? null : JSON.stringify(lastValue);
				const shouldSave =
					lastValue !== null &&
					lastValue !== drag.codeValue.codeValue &&
					!(
						defaultValue === stringifiedValue &&
						drag.codeValue.codeValue === undefined
					);

				if (!shouldSave) {
					clearDragOverrides(drag.nodePath);
					return;
				}

				saveSequenceProp({
					fileName: drag.nodePath.absolutePath,
					nodePath: drag.nodePath,
					fieldKey: translateFieldKey,
					value: lastValue,
					defaultValue,
					schema: drag.schema,
					setCodeValues,
					clientId: drag.clientId,
				}).finally(() => {
					clearDragOverrides(drag.nodePath);
				});
			};

			window.addEventListener('pointermove', onPointerMove);
			window.addEventListener('pointerup', onPointerUp);
			window.addEventListener('pointercancel', onPointerUp);
		},
		[
			clearDragOverrides,
			getDragOverrides,
			scale,
			setCodeValues,
			setDragOverrides,
		],
	);

	useEffect(() => {
		if (selectedOutlineTargets.length === 0) {
			setOutlines((prevOutlines) =>
				prevOutlines.length === 0 ? prevOutlines : [],
			);
			return;
		}

		let animationFrame: number | null = null;

		const updateOutlines = () => {
			if (overlayRef.current) {
				const nextOutlines = measureOutlines(
					overlayRef.current,
					selectedOutlineTargets,
				);
				setOutlines((prevOutlines) =>
					outlinesAreEqual(prevOutlines, nextOutlines)
						? prevOutlines
						: nextOutlines,
				);
			}

			animationFrame = requestAnimationFrame(updateOutlines);
		};

		updateOutlines();

		return () => {
			if (animationFrame !== null) {
				cancelAnimationFrame(animationFrame);
			}
		};
	}, [selectedOutlineTargets]);

	if (selectedOutlineTargets.length === 0) {
		return null;
	}

	return (
		<svg
			ref={overlayRef}
			style={outlineContainer}
			width="100%"
			height="100%"
			aria-hidden="true"
		>
			{outlines.map((outline) => {
				const target = targetsByKey.get(outline.key);
				return (
					<React.Fragment key={outline.key}>
						<polygon
							points={outline.points.map(pointToString).join(' ')}
							fill="none"
							stroke={BLUE}
							strokeWidth={2}
							vectorEffect="non-scaling-stroke"
						/>
						{target?.drag ? (
							<polygon
								points={outline.points.map(pointToString).join(' ')}
								fill="transparent"
								pointerEvents="all"
								cursor="move"
								onPointerDown={(event) => onPointerDown(event, target)}
							/>
						) : null}
					</React.Fragment>
				);
			})}
		</svg>
	);
};
