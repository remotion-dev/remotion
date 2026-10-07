import type {MutableRefObject, RefObject} from 'react';
import {useCallback, useLayoutEffect, useRef, useState} from 'react';
import {Internals} from 'remotion';
import type {
	CanvasOutline,
	CanvasOutlineTarget,
	CanvasOutlineViewport,
} from './outline-geometry';
import {
	canvasOutlinesAreEqual,
	measureCanvasOutlineTargets,
	measureCanvasOutlineTargetsWithBounds,
} from './outline-measurement';
import {getCanvasOutlineNodes} from './outline-nodes';

type CanvasOutlineMeasurementGeometry = {
	readonly outlines: readonly CanvasOutline[];
	readonly renderingOutlines: readonly CanvasOutline[];
	readonly renderingTransform: {
		readonly scale: number;
		readonly translateX: number;
		readonly translateY: number;
	} | null;
};

export const useCanvasOutlineMeasurements = ({
	containerRef,
	targets,
	updateOutlinesRef,
	viewport,
}: {
	readonly containerRef: RefObject<SVGSVGElement | null>;
	readonly targets: readonly CanvasOutlineTarget[];
	readonly updateOutlinesRef: MutableRefObject<() => void> | null;
	readonly viewport: CanvasOutlineViewport | null;
}) => {
	const [geometry, setGeometry] = useState<CanvasOutlineMeasurementGeometry>({
		outlines: [],
		renderingOutlines: [],
		renderingTransform: null,
	});
	const geometryRef = useRef(geometry);
	const latestUpdateRef = useRef<() => void>(() => undefined);
	const resizeObserverRef = useRef<ResizeObserver | null>(null);
	const observedElementsRef = useRef<ReadonlySet<Element>>(new Set());
	const inputsRef = useRef({targets, viewport});
	const mutationObserverRef = useRef<MutationObserver | null>(null);
	const measurementsRef = useRef<
		| (ReturnType<typeof measureCanvasOutlineTargetsWithBounds> & {
				readonly scale: number;
				readonly originX: number;
				readonly originY: number;
				readonly nodesByRef: ReadonlyMap<
					CanvasOutlineTarget['ref'],
					Element | null | readonly (Element | Text)[]
				>;
		  })
		| null
	>(null);
	const viewportElement = viewport?.element ?? null;
	const viewportScale = viewport?.scale ?? null;
	useLayoutEffect(() => {
		inputsRef.current = {targets, viewport};
	}, [targets, viewport]);

	const updateOutlines = useCallback(() => {
		const {targets: currentTargets, viewport: viewportInput} =
			inputsRef.current;
		let currentViewport = viewportInput;
		// A layout effect can run before the MutationObserver delivers changes.
		// Drain its records before deciding whether the cached geometry is valid.
		if ((mutationObserverRef.current?.takeRecords().length ?? 0) > 0) {
			measurementsRef.current = null;
		}

		// Automatic groups are resolved after layout effects. Compare their raw
		// node snapshots without reading styles or walking the DOM during zoom.
		const cached = measurementsRef.current;
		if (
			cached !== null &&
			currentTargets.some(
				(target) =>
					cached.nodesByRef.get(target.ref) !==
					(Internals.SequenceOutlineInternals.getNodes(target.ref) ??
						target.ref.current),
			)
		) {
			measurementsRef.current = null;
		}

		const container = containerRef.current;
		if (container === null || currentTargets.length === 0) {
			measurementsRef.current = null;
			resizeObserverRef.current?.disconnect();
			observedElementsRef.current = new Set();
			if (geometryRef.current.outlines.length === 0) {
				return;
			}

			geometryRef.current = {
				outlines: [],
				renderingOutlines: [],
				renderingTransform: null,
			};
			setGeometry(geometryRef.current);
			return;
		}

		const resizeObserver = resizeObserverRef.current;
		if (currentViewport === null || measurementsRef.current === null) {
			const nextObservedElements = new Set<Element>();
			if (containerRef.current !== null) {
				nextObservedElements.add(containerRef.current);
			}

			for (const target of currentTargets) {
				for (const node of getCanvasOutlineNodes(target.ref)) {
					// A custom outlineRef can point outside the scaled composition.
					// Its geometry does not share the viewport's zoom transform.
					if (
						currentViewport !== null &&
						!currentViewport.element.contains(node)
					) {
						currentViewport = null;
					}

					const element =
						node.nodeType === 1 ? (node as Element) : node.parentElement;
					if (element !== null) {
						nextObservedElements.add(element);
					}
				}
			}

			for (const element of observedElementsRef.current) {
				if (!nextObservedElements.has(element)) {
					resizeObserver?.unobserve(element);
				}
			}

			for (const element of nextObservedElements) {
				if (!observedElementsRef.current.has(element)) {
					resizeObserver?.observe(element);
				}
			}

			observedElementsRef.current = nextObservedElements;
		}

		let nextOutlines: readonly CanvasOutline[];
		let renderingOutlines: readonly CanvasOutline[];
		let renderingTransform: CanvasOutlineMeasurementGeometry['renderingTransform'] =
			null;
		if (currentViewport === null) {
			nextOutlines = measureCanvasOutlineTargets(container, currentTargets);
			renderingOutlines = nextOutlines;
		} else {
			const containerRect = container.getBoundingClientRect();
			const contentRect = currentViewport.element.getBoundingClientRect();
			const originX = contentRect.left - containerRect.left;
			const originY = contentRect.top - containerRect.top;
			if (measurementsRef.current === null) {
				// Measure off-canvas targets too: they can enter the visible region
				// after zooming out without any change to the composition's DOM.
				measurementsRef.current = {
					...measureCanvasOutlineTargetsWithBounds(
						container,
						currentTargets.map((target) => ({
							...target,
							includeOutsideContainer: true,
						})),
					),
					scale: currentViewport.scale,
					originX,
					originY,
					nodesByRef: new Map(
						currentTargets.map((target) => [
							target.ref,
							Internals.SequenceOutlineInternals.getNodes(target.ref) ??
								target.ref.current,
						]),
					),
				};
			}

			const measurements = measurementsRef.current;
			const ratio = currentViewport.scale / measurements.scale;
			const translateX = originX - measurements.originX * ratio;
			const translateY = originY - measurements.originY * ratio;
			renderingOutlines = measurements.outlines;
			renderingTransform = {scale: ratio, translateX, translateY};
			const targetsByKey = new Map(
				currentTargets.map((target) => [target.key, target]),
			);
			const projectPoint = (point: CanvasOutline['points'][number]) => ({
				x: point.x * ratio + translateX,
				y: point.y * ratio + translateY,
			});
			nextOutlines = measurements.outlines.flatMap((outline) => {
				const bounds = measurements.boundsByKey.get(outline.key);
				if (
					bounds === undefined ||
					(!targetsByKey.get(outline.key)?.includeOutsideContainer &&
						(bounds.right * ratio + translateX <= 0 ||
							bounds.left * ratio + translateX >= containerRect.width ||
							bounds.bottom * ratio + translateY <= 0 ||
							bounds.top * ratio + translateY >= containerRect.height))
				) {
					return [];
				}

				const [tl, tr, br, bl] = outline.points;
				const uncropped = outline.uncroppedPoints;
				const {path} = outline;
				return [
					{
						...outline,
						points: [
							projectPoint(tl),
							projectPoint(tr),
							projectPoint(br),
							projectPoint(bl),
						] as CanvasOutline['points'],
						uncroppedPoints:
							uncropped === null
								? null
								: ([
										projectPoint(uncropped[0]),
										projectPoint(uncropped[1]),
										projectPoint(uncropped[2]),
										projectPoint(uncropped[3]),
									] as CanvasOutline['points']),
						path:
							path === null
								? null
								: {
										d: path.d,
										matrix: {
											a: path.matrix.a * ratio,
											b: path.matrix.b * ratio,
											c: path.matrix.c * ratio,
											d: path.matrix.d * ratio,
											e: path.matrix.e * ratio + translateX,
											f: path.matrix.f * ratio + translateY,
										},
									},
					},
				];
			});
		}

		const previous = geometryRef.current;
		if (
			canvasOutlinesAreEqual(previous.outlines, nextOutlines) &&
			(currentViewport === null
				? previous.renderingTransform === null
				: previous.renderingOutlines === renderingOutlines &&
					previous.renderingTransform?.scale === renderingTransform?.scale &&
					previous.renderingTransform?.translateX ===
						renderingTransform?.translateX &&
					previous.renderingTransform?.translateY ===
						renderingTransform?.translateY)
		) {
			return;
		}

		geometryRef.current = {
			outlines: nextOutlines,
			renderingOutlines,
			renderingTransform,
		};
		setGeometry(geometryRef.current);
	}, [containerRef]);

	useLayoutEffect(() => {
		measurementsRef.current = null;
		latestUpdateRef.current = updateOutlines;
		if (updateOutlinesRef !== null) {
			updateOutlinesRef.current = updateOutlines;
		}

		// The Fiber observer discovers nodes after React's layout effects. Batch
		// automatic measurements after that commit, including child-only updates
		// while paused, instead of measuring stale nodes and measuring again.
		let active = true;
		let scheduled = false;
		const scheduleUpdate = () => {
			if (scheduled) return;
			scheduled = true;
			queueMicrotask(() => {
				scheduled = false;
				if (active) updateOutlines();
			});
		};

		const ownerWindow = containerRef.current?.ownerDocument.defaultView;
		const hasAutomaticTargets = targets.some(
			(target) =>
				Internals.SequenceOutlineInternals.getNodes(target.ref) !== null,
		);
		if (hasAutomaticTargets) {
			latestUpdateRef.current = scheduleUpdate;
			ownerWindow?.addEventListener(
				Internals.CommitOrderInternals.eventName,
				scheduleUpdate,
			);
			scheduleUpdate();
		} else {
			updateOutlines();
		}

		return () => {
			active = false;
			ownerWindow?.removeEventListener(
				Internals.CommitOrderInternals.eventName,
				scheduleUpdate,
			);
			latestUpdateRef.current = () => undefined;
			if (updateOutlinesRef?.current === updateOutlines) {
				updateOutlinesRef.current = () => undefined;
			}
		};
	}, [
		containerRef,
		targets,
		updateOutlines,
		updateOutlinesRef,
		viewportElement,
	]);

	useLayoutEffect(() => {
		if (viewportElement === null) return;
		const ownerWindow = viewportElement.ownerDocument.defaultView;
		if (!ownerWindow) return;
		const invalidate = () => {
			measurementsRef.current = null;
			latestUpdateRef.current();
		};

		const observer = new ownerWindow.MutationObserver(invalidate);
		observer.observe(viewportElement, {
			attributes: true,
			characterData: true,
			childList: true,
			subtree: true,
		});
		// CSS hot reload and stylesheet loads can change transforms without
		// mutating a composition element or changing its layout dimensions.
		const {head} = viewportElement.ownerDocument;
		observer.observe(head, {
			attributes: true,
			characterData: true,
			childList: true,
			subtree: true,
		});
		mutationObserverRef.current = observer;
		viewportElement.addEventListener('scroll', invalidate, true);
		head.addEventListener('load', invalidate, true);
		ownerWindow.addEventListener('resize', invalidate);
		return () => {
			observer.disconnect();
			mutationObserverRef.current = null;
			viewportElement.removeEventListener('scroll', invalidate, true);
			head.removeEventListener('load', invalidate, true);
			ownerWindow.removeEventListener('resize', invalidate);
		};
	}, [viewportElement]);

	useLayoutEffect(() => {
		if (viewportScale === null) return;
		// Cached geometry already has its nodes. Project it synchronously so the
		// canvas, outlines, and hovered editing handles reach the same paint.
		// Only fresh measurements need to wait for the Fiber observer's nodes.
		if (measurementsRef.current !== null) {
			updateOutlines();
		} else {
			latestUpdateRef.current();
		}
	}, [updateOutlines, viewportScale]);

	useLayoutEffect(() => {
		const ownerWindow = containerRef.current?.ownerDocument.defaultView;
		if (!ownerWindow || typeof ownerWindow.ResizeObserver === 'undefined') {
			return;
		}

		let animationFrame: number | null = null;
		const resizeObserver = new ownerWindow.ResizeObserver((entries) => {
			// The overlay resizes with zoom; composition elements keep their
			// layout dimensions. Only content resizes invalidate the geometry.
			if (entries.some((entry) => entry.target !== containerRef.current)) {
				measurementsRef.current = null;
			}

			if (animationFrame !== null) {
				return;
			}

			animationFrame = ownerWindow.requestAnimationFrame(() => {
				animationFrame = null;
				latestUpdateRef.current();
			});
		});
		resizeObserverRef.current = resizeObserver;
		latestUpdateRef.current();

		return () => {
			if (animationFrame !== null) {
				ownerWindow.cancelAnimationFrame(animationFrame);
			}

			resizeObserver.disconnect();
			resizeObserverRef.current = null;
			observedElementsRef.current = new Set();
		};
	}, [containerRef]);

	return geometry;
};
