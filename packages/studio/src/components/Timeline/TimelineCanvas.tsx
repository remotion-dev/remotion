import React, {
	createContext,
	createRef,
	useContext,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import {flushSync} from 'react-dom';
import {BACKGROUND} from '../../helpers/colors';
import {resolveStudioColor} from '../../helpers/resolve-studio-color';
import {getStudioPixelRatio} from '../../helpers/studio-pixel-ratio';
import {getTimelineDomPaintEntries} from './get-timeline-dom-paint-entries';
import type {TimelineDomVisual} from './get-timeline-dom-paint-entries';
import type {
	createPixiTimelineRenderer,
	TimelineCanvasDraw,
	TimelinePaintNode,
	TimelineReorderPreview,
	TimelineSceneTransition,
} from './pixi-timeline-renderer';
import {sortTimelinePaintEntries} from './sort-timeline-paint-entries';
import {scrollableRef, timelineVerticalScroll} from './timeline-refs';
import {useTimelineVirtualization} from './TimelineVirtualization';

type PaintEntry = {
	element: HTMLElement;
	background: string;
	drawing: TimelineCanvasDraw | null;
};
type PaintStore = {
	entries: Map<HTMLElement, PaintEntry>;
	invalidate: () => void;
	repaint: () => void;
};
type ScrollPosition = {
	x: number;
	y: number;
	scrollsX: boolean;
	stickyY: boolean;
};
type MeasuredNode = {
	node: TimelinePaintNode;
	position: ScrollPosition;
	scrollLeft: number;
	scrollTop: number;
	clips: (ScrollPosition & {
		width: number;
		height: number;
		clipsX: boolean;
		clipsY: boolean;
	})[];
	paths: (ScrollPosition & {path: string})[];
};
const TimelineCanvasContext = createContext<PaintStore | null>(null);
const reorderPreviewRef = createRef<
	((rect: DOMRect) => TimelineReorderPreview | null) | null
>();
export const createTimelineReorderPreview = (
	rect: DOMRect,
): TimelineReorderPreview | null => reorderPreviewRef.current?.(rect) ?? null;

type TimelineSceneTransitionOptions = {
	readonly panels: readonly {
		readonly element: HTMLElement;
		readonly clipY: {readonly top: number; readonly bottom: number};
	}[];
	readonly direction: 'forward' | 'backward';
	readonly update: () => void;
};
const sceneTransitionRef = createRef<
	((options: TimelineSceneTransitionOptions) => (() => void) | null) | null
>();
export const startTimelineSceneTransition = (
	options: TimelineSceneTransitionOptions,
): (() => void) | null => sceneTransitionRef.current?.(options) ?? null;

// The invisible DOM retains browser layout, focus, hit testing and accessibility.
// One retained WebGL scene paints every timeline surface above it.
export const TimelineCanvasProvider: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	const {totalSize} = useTimelineVirtualization();
	const hostRef = useRef<HTMLDivElement>(null);
	const layoutRef = useRef<HTMLDivElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [error, setError] = useState<Error | null>(null);
	const store = useMemo<PaintStore>(
		() => ({
			entries: new Map(),
			invalidate: () => undefined,
			repaint: () => undefined,
		}),
		[],
	);
	useEffect(() => {
		const host = hostRef.current;
		const layout = layoutRef.current;
		const canvas = canvasRef.current;
		const verticalScroll = timelineVerticalScroll.current;
		if (!host || !layout || !canvas || !verticalScroll) return;
		let disposed = false;
		let failed = false;
		let renderer: Awaited<
			ReturnType<typeof createPixiTimelineRenderer>
		> | null = null;
		let animationFrame: number | null = null;
		let layoutDirty = true;
		let scrollRevision = 0;
		let cancelSceneTransition: (() => void) | null = null;
		let ordered: HTMLElement[] = [];
		const measured = new Map<HTMLElement, MeasuredNode>();
		const dirty = new Set<HTMLElement>();
		const draw = () => {
			animationFrame = null;
			if (disposed || failed || renderer === null) return;
			try {
				const bounds = host.getBoundingClientRect();
				const verticalBounds = verticalScroll.getBoundingClientRect();
				const top = Math.max(0, verticalBounds.top - bounds.top);
				const height = Math.max(
					0,
					Math.min(bounds.bottom, verticalBounds.bottom) -
						Math.max(bounds.top, verticalBounds.top),
				);
				const width = host.clientWidth;
				if (width === 0 || height === 0) return;
				const scrollable = scrollableRef.current;
				const scrollLeft = scrollable?.scrollLeft ?? 0;
				const {scrollTop} = verticalScroll;
				if (layoutDirty || dirty.size > 0) {
					const styles = new Map<Element, CSSStyleDeclaration>();
					const rects = new Map<Element, DOMRect>();
					const getStyle = (element: Element) => {
						const cached = styles.get(element);
						if (cached) return cached;
						const style = getComputedStyle(element);
						styles.set(element, style);
						return style;
					};

					const position = (element: HTMLElement): ScrollPosition => {
						const cached = rects.get(element);
						const rect = cached ?? element.getBoundingClientRect();
						rects.set(element, rect);
						let stickyY = false;
						let scrollsX = Boolean(
							scrollable &&
							element !== scrollable &&
							scrollable.contains(element),
						);
						for (
							let parent: HTMLElement | null = element;
							parent && parent !== host;
							parent = parent.parentElement
						) {
							const parentPosition = getStyle(parent).position;
							if (!(parent instanceof HTMLElement)) continue;
							if (
								(parentPosition === 'absolute' || parentPosition === 'fixed') &&
								(!parent.offsetParent ||
									!scrollable?.contains(parent.offsetParent))
							)
								scrollsX = false;
							if (
								parentPosition === 'sticky' ||
								((parentPosition === 'absolute' ||
									parentPosition === 'fixed') &&
									(!parent.offsetParent || !host.contains(parent.offsetParent)))
							)
								stickyY = true;
						}

						return {
							x: rect.left - bounds.left,
							y: rect.top - bounds.top,
							scrollsX,
							stickyY,
						};
					};

					const roots = layoutDirty
						? [layout]
						: [...dirty].filter(
								(element) =>
									![...dirty].some(
										(other) => other !== element && other.contains(element),
									),
							);
					if (layoutDirty) measured.clear();
					for (const root of roots) {
						for (const element of measured.keys()) {
							if (
								!element.isConnected ||
								root === element ||
								root.contains(element)
							)
								measured.delete(element);
						}

						const entries = new Map<
							HTMLElement,
							PaintEntry & {dom: TimelineDomVisual | null}
						>();
						for (const entry of getTimelineDomPaintEntries(root, styles, rects))
							entries.set(entry.element, {...entry, drawing: null});
						for (const entry of store.entries.values()) {
							if (root === entry.element || root.contains(entry.element))
								entries.set(entry.element, {
									...entry,
									dom: entries.get(entry.element)?.dom ?? null,
								});
						}

						for (const {
							element,
							background,
							drawing,
							dom,
						} of entries.values()) {
							if (!element.isConnected) continue;
							const pos = position(element);
							const rect = rects.get(element)!;
							if (rect.width <= 0 || rect.height <= 0) continue;
							const style = getStyle(element);
							let opacity = 1;
							const clips: MeasuredNode['clips'] = [];
							const paths: MeasuredNode['paths'] = [];
							for (
								let ancestor: HTMLElement | null = element;
								ancestor && ancestor !== host;
								ancestor = ancestor.parentElement
							) {
								const computed = getStyle(ancestor);
								if (ancestor !== layout) opacity *= Number(computed.opacity);
								if (
									computed.display === 'none' ||
									computed.visibility === 'hidden'
								)
									opacity = 0;
								const clipsX = /hidden|clip|scroll|auto/.test(
									computed.overflowX,
								);
								const clipsY = /hidden|clip|scroll|auto/.test(
									computed.overflowY,
								);
								const inset = computed.clipPath.match(/^inset\(([^)]+)\)$/);
								const path = computed.clipPath.match(/^path\(["'](.+)["']\)$/);
								const polygon = computed.clipPath.match(/^polygon\((.+)\)$/);
								if (!clipsX && !clipsY && !inset && !path && !polygon) continue;
								const ancestorPos = position(ancestor);
								const ancestorRect = rects.get(ancestor)!;
								if (clipsX || clipsY)
									clips.push({
										...ancestorPos,
										width:
											ancestor === element
												? ancestorRect.width
												: ancestor.clientWidth,
										height:
											ancestor === element
												? ancestorRect.height
												: ancestor.clientHeight,
										clipsX,
										clipsY,
									});
								if (path || polygon) {
									paths.push({
										...ancestorPos,
										path: path
											? path[1]
											: polygon![1]
													.split(',')
													.map((point, index) => {
														const coordinates = point
															.trim()
															.split(/\s+/)
															.map(
																(value, axis) =>
																	parseFloat(value) *
																	(value.endsWith('%')
																		? (axis === 0
																				? ancestorRect.width
																				: ancestorRect.height) / 100
																		: 1),
															);
														return `${index === 0 ? 'M' : 'L'}${coordinates[0]},${coordinates[1]}`;
													})
													.join(' ') + ' Z',
									});
								}

								if (inset) {
									const parts = inset[1].split(/\s+/);
									const values = [
										parts[0],
										parts[1] ?? parts[0],
										parts[2] ?? parts[0],
										parts[3] ?? parts[1] ?? parts[0],
									].map(
										(part, index) =>
											parseFloat(part) *
											(part.endsWith('%')
												? (index % 2 === 0
														? ancestorRect.height
														: ancestorRect.width) / 100
												: 1),
									);
									clips.push({
										...ancestorPos,
										x: ancestorPos.x + values[3],
										y: ancestorPos.y + values[0],
										width: ancestorRect.width - values[3] - values[1],
										height: ancestorRect.height - values[0] - values[2],
										clipsX: true,
										clipsY: true,
									});
								}
							}

							const radii = [
								style.borderTopLeftRadius,
								style.borderTopRightRadius,
								style.borderBottomLeftRadius,
								style.borderBottomRightRadius,
							].map((radius) =>
								Math.min(
									rect.width / 2,
									rect.height / 2,
									parseFloat(radius) || 0,
								),
							);
							measured.set(element, {
								position: pos,
								scrollLeft,
								scrollTop,
								clips,
								paths,
								node: {
									id: element,
									x: pos.x,
									y: pos.y,
									width: rect.width,
									height: rect.height,
									opacity,
									background: resolveStudioColor(background, style),
									drawing,
									dom,
									resolveColor: (color) => resolveStudioColor(color, style),
									radii: {
										topLeft: radii[0],
										topRight: radii[1],
										bottomLeft: radii[2],
										bottomRight: radii[3],
									},
									clip: null,
									pathClips: [],
								},
							});
						}
					}

					if (
						layoutDirty ||
						ordered.length !== measured.size ||
						ordered.some((element) => !measured.has(element))
					) {
						ordered = sortTimelinePaintEntries(
							[...measured.keys()].map((element) => ({element})),
							host,
							styles,
						).map(({element}) => element);
					}

					layoutDirty = false;
					dirty.clear();
				}

				const nodes: TimelinePaintNode[] = ordered.map((element) => {
					const entry = measured.get(element)!;
					const project = (point: ScrollPosition) => ({
						x: point.x - (point.scrollsX ? scrollLeft - entry.scrollLeft : 0),
						y: point.y + (point.stickyY ? scrollTop - entry.scrollTop : 0),
					});
					const pos = project(entry.position);
					let left = -Infinity;
					let right = Infinity;
					let clipTop = -Infinity;
					let bottom = Infinity;
					for (const clip of entry.clips) {
						const projected = project(clip);
						if (clip.clipsX) {
							left = Math.max(left, projected.x);
							right = Math.min(right, projected.x + clip.width);
						}

						if (clip.clipsY) {
							clipTop = Math.max(clipTop, projected.y);
							bottom = Math.min(bottom, projected.y + clip.height);
						}
					}

					// Only ancestor overflow clips content: icons, outlines and shadows may
					// intentionally extend beyond their own layout boxes.
					const viewportClip =
						entry.clips.length === 0
							? null
							: {
									left: Math.max(0, left),
									top: Math.max(top, clipTop),
									right: Math.min(width, right),
									bottom: Math.min(top + height, bottom),
								};
					return {
						...entry.node,
						...pos,
						clip: viewportClip,
						pathClips: entry.paths.map((path) => ({
							...project(path),
							path: path.path,
						})),
					};
				});
				const canvasParent = canvas.offsetParent?.getBoundingClientRect();
				canvas.style.top = `${verticalBounds.top - (canvasParent?.top ?? 0)}px`;
				canvas.style.left = `${bounds.left - (canvasParent?.left ?? 0)}px`;
				renderer.render(nodes, {
					width,
					height,
					left: 0,
					top,
					resolution: getStudioPixelRatio(),
					scrollRevision,
				});
			} catch (err) {
				failed = true;
				setError(err instanceof Error ? err : new Error(String(err)));
				renderer?.destroy();
				renderer = null;
			}
		};

		const createPreview = (rect: DOMRect): TimelineReorderPreview | null => {
			if (!renderer || disposed || failed) return null;
			if (animationFrame !== null) cancelAnimationFrame(animationFrame);
			draw();
			if (!renderer) return null;
			const bounds = canvas.getBoundingClientRect();
			const left = Math.max(bounds.left, rect.left);
			const top = Math.max(bounds.top, rect.top);
			const width = Math.min(bounds.right, rect.right) - left;
			const height = Math.min(bounds.bottom, rect.bottom) - top;
			if (width <= 0 || height <= 0) return null;
			const preview = renderer.createPreview({
				x: left - bounds.left,
				y: top - bounds.top,
				width,
				height,
			});
			if (!preview) return null;
			schedule();
			return {
				move: (deltaX) => {
					preview.move(deltaX);
					schedule();
				},
				destroy: () => {
					preview.destroy();
					schedule();
				},
			};
		};

		reorderPreviewRef.current = createPreview;
		const startSceneTransition = ({
			panels,
			direction,
			update,
		}: TimelineSceneTransitionOptions) => {
			if (
				!renderer ||
				disposed ||
				failed ||
				window.matchMedia('(prefers-reduced-motion: reduce)').matches
			) {
				return null;
			}

			cancelSceneTransition?.();
			let frame: number | null = null;
			let transition: TimelineSceneTransition | null = null;
			let cancelled = false;
			const cancel = () => {
				if (cancelled) return;
				cancelled = true;
				if (frame !== null) cancelAnimationFrame(frame);
				transition?.destroy();
				if (cancelSceneTransition === cancel) cancelSceneTransition = null;
				schedule();
			};

			cancelSceneTransition = cancel;
			frame = requestAnimationFrame(() => {
				frame = null;
				if (cancelled || disposed || failed || !renderer) return;
				try {
					if (animationFrame !== null) cancelAnimationFrame(animationFrame);
					draw();
					if (!renderer) return;
					const bounds = canvas.getBoundingClientRect();
					const regions = panels.flatMap(({element, clipY}) => {
						const rect = element.getBoundingClientRect();
						const left = Math.max(bounds.left, rect.left);
						const top = Math.max(bounds.top, rect.top + clipY.top);
						const width = Math.min(bounds.right, rect.right) - left;
						const height =
							Math.min(bounds.bottom, rect.bottom - clipY.bottom) - top;
						if (width <= 0 || height <= 0) return [];
						return [
							{
								x: left - bounds.left,
								y: top - bounds.top,
								width,
								height,
								slideDistance: rect.width * 0.15,
								background: resolveStudioColor(
									BACKGROUND,
									getComputedStyle(element),
								),
							},
						];
					});
					if (regions.length === 0) {
						flushSync(update);
						layoutDirty = true;
						cancel();
						return;
					}

					transition = renderer.createSceneTransition(regions, direction);
					// Run outside React's commit so both snapshots bracket a complete update.
					flushSync(update);
					layoutDirty = true;
					if (animationFrame !== null) cancelAnimationFrame(animationFrame);
					draw();
					if (cancelled || disposed || failed) return;
					transition.captureNext();
					const startedAt = performance.now();
					const tick = (now: number) => {
						frame = null;
						if (cancelled || disposed || failed) return;
						if (
							window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
							!transition?.advance(now - startedAt)
						) {
							cancel();
						}

						if (animationFrame !== null) cancelAnimationFrame(animationFrame);
						draw();
						if (!cancelled) frame = requestAnimationFrame(tick);
					};

					frame = requestAnimationFrame(tick);
				} catch (err) {
					cancel();
					setError(err instanceof Error ? err : new Error(String(err)));
				}
			});
			return cancel;
		};

		sceneTransitionRef.current = startSceneTransition;
		const schedule = () => {
			if (!disposed && !failed && animationFrame === null)
				animationFrame = requestAnimationFrame(draw);
		};

		const invalidate = () => {
			layoutDirty = true;
			schedule();
		};

		const scroll = () => {
			scrollRevision++;
			schedule();
		};

		const input = (event: Event) => {
			if (
				event.target instanceof HTMLElement &&
				layout.contains(event.target)
			) {
				dirty.add(event.target);
				schedule();
			}
		};

		const selection = () => {
			if (
				document.activeElement instanceof HTMLElement &&
				layout.contains(document.activeElement)
			) {
				dirty.add(document.activeElement);
				schedule();
			}
		};

		store.invalidate = invalidate;
		store.repaint = schedule;
		const resizeObserver = new ResizeObserver(invalidate);
		resizeObserver.observe(host);
		resizeObserver.observe(verticalScroll);
		const mutations = new MutationObserver((records) => {
			for (const record of records) {
				const target =
					record.target instanceof Element
						? record.target
						: record.target.parentElement;
				if (!target) continue;
				if (
					record.type === 'childList' &&
					[...record.addedNodes, ...record.removedNodes].some(
						(node) => node.nodeType !== Node.TEXT_NODE,
					)
				) {
					layoutDirty = true;
					break;
				}

				// Transform updates move a retained subtree. Other style changes may
				// reflow siblings and therefore require a fresh layout snapshot.
				if (
					record.type === 'attributes' &&
					['class', 'size', 'width', 'height', 'data-name'].includes(
						record.attributeName ?? '',
					)
				) {
					layoutDirty = true;
					break;
				}

				if (record.type === 'attributes' && record.attributeName === 'style') {
					const withoutTransform = (value: string) =>
						value.replace(/transform:[^;]*;?/g, '');
					if (
						withoutTransform(record.oldValue ?? '') !==
						withoutTransform(target.getAttribute('style') ?? '')
					) {
						layoutDirty = true;
						break;
					}
				}

				dirty.add(
					(target.closest('svg') ??
						(record.type === 'characterData' || record.type === 'childList'
							? (target.parentElement ?? target)
							: target)) as HTMLElement,
				);
			}

			schedule();
		});
		mutations.observe(layout, {
			attributes: true,
			attributeOldValue: true,
			childList: true,
			characterData: true,
			subtree: true,
		});
		const themeObserver = new MutationObserver(invalidate);
		themeObserver.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ['style', 'class'],
		});
		themeObserver.observe(document.head, {
			childList: true,
			subtree: true,
			characterData: true,
		});
		// Capture scroll also catches a newly mounted horizontal viewport.
		layout.addEventListener('scroll', scroll, true);
		verticalScroll.addEventListener('scroll', scroll);
		for (const event of ['input', 'focusin', 'focusout', 'select', 'keyup'])
			layout.addEventListener(event, input);
		for (const event of ['pointerover', 'pointerout'])
			layout.addEventListener(event, invalidate);
		layout.addEventListener('load', input, true);
		layout.addEventListener('error', input, true);
		document.addEventListener('selectionchange', selection);
		window.addEventListener('resize', invalidate);
		import('./pixi-timeline-renderer')
			.then(async (module) => {
				const instance = await module.createPixiTimelineRenderer(canvas);
				if (disposed) {
					instance.destroy();
					return;
				}

				renderer = instance;
				invalidate();
			})
			.catch((err: unknown) => {
				if (!disposed)
					setError(err instanceof Error ? err : new Error(String(err)));
			});
		return () => {
			disposed = true;
			if (reorderPreviewRef.current === createPreview)
				reorderPreviewRef.current = null;
			if (sceneTransitionRef.current === startSceneTransition)
				sceneTransitionRef.current = null;
			cancelSceneTransition?.();
			store.invalidate = () => undefined;
			store.repaint = () => undefined;
			if (animationFrame !== null) cancelAnimationFrame(animationFrame);
			resizeObserver.disconnect();
			mutations.disconnect();
			themeObserver.disconnect();
			layout.removeEventListener('scroll', scroll, true);
			verticalScroll.removeEventListener('scroll', scroll);
			for (const event of ['input', 'focusin', 'focusout', 'select', 'keyup'])
				layout.removeEventListener(event, input);
			for (const event of ['pointerover', 'pointerout'])
				layout.removeEventListener(event, invalidate);
			layout.removeEventListener('load', input, true);
			layout.removeEventListener('error', input, true);
			document.removeEventListener('selectionchange', selection);
			window.removeEventListener('resize', invalidate);
			renderer?.destroy();
		};
	}, [store]);
	if (error) throw error;
	return (
		<TimelineCanvasContext.Provider value={store}>
			<div
				ref={hostRef}
				style={{
					height: totalSize,
					display: 'flex',
					flex: 1,
					minHeight: '100%',
					isolation: 'isolate',
				}}
			>
				<div
					ref={layoutRef}
					data-timeline-layout="true"
					style={{
						display: 'flex',
						flex: 1,
						minWidth: 0,
						minHeight: '100%',
						opacity: 0,
					}}
				>
					{children}
				</div>
				<canvas
					ref={canvasRef}
					aria-hidden="true"
					data-timeline-pixi="true"
					style={{
						position: 'absolute',
						pointerEvents: 'none',
						top: 0,
						left: 0,
						zIndex: 1,
					}}
				/>
			</div>
		</TimelineCanvasContext.Provider>
	);
};

export const useTimelineCanvasInvalidation = (): (() => void) => {
	const store = useContext(TimelineCanvasContext);
	return useMemo(() => () => store?.repaint(), [store]);
};

// DOM boxes remain the source of layout and pointer/accessibility semantics.
// Layout boxes register their native GPU backgrounds.
export const TimelinePaint: React.FC<{
	readonly style: React.CSSProperties;
	readonly children: React.ReactNode;
}> = ({style, children}) => {
	const store = useContext(TimelineCanvasContext);
	const ref = useRef<HTMLDivElement>(null);
	const background = String(
		style.background ?? style.backgroundColor ?? 'transparent',
	);
	useLayoutEffect(() => {
		const element = ref.current;
		if (!element || !store) {
			return;
		}

		store.entries.set(element, {
			element,
			background,
			drawing: null,
		});
		store.invalidate();
		return () => {
			store.entries.delete(element);
			store.invalidate();
		};
	}, [background, store]);
	return (
		<div
			ref={ref}
			data-timeline-canvas-background="true"
			style={{
				...style,
				background: 'transparent',
				backgroundColor: 'transparent',
			}}
		>
			{children}
		</div>
	);
};

export type {TimelineCanvasDraw} from './pixi-timeline-renderer';

export const useTimelineCanvasDrawing = (
	ref: React.RefObject<HTMLElement | null>,
	drawing: TimelineCanvasDraw | null,
): void => {
	const store = useContext(TimelineCanvasContext);
	useLayoutEffect(() => {
		const element = ref.current;
		if (!element || !store || drawing === null) {
			return;
		}

		element.setAttribute('data-timeline-canvas-content', 'true');
		store.entries.set(element, {
			element,
			background: 'transparent',
			drawing,
		});
		store.invalidate();
		return () => {
			element.removeAttribute('data-timeline-canvas-content');
			store.entries.delete(element);
			store.invalidate();
		};
	}, [drawing, ref, store]);
};
