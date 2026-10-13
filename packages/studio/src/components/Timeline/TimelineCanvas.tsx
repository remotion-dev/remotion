import React, {
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
import {
	createPixiTimelineRenderer,
	type TimelineCanvasDraw,
	type TimelineReorderPreview,
	type TimelineSceneTransition,
} from './pixi-timeline-renderer';
import {jsx} from './scene-jsx/jsx-runtime';
import {TimelineSceneContext} from './timeline-scene-context';
import {
	attachTimelineSceneEvents,
	selectTimelineSceneNode,
	setTimelineSceneSelectionRange,
} from './timeline-scene-events';
import {createTimelineSceneLayout} from './timeline-scene-layout';
import {
	isTimelineSceneNode,
	TimelineSceneNode,
	type TimelineSceneStore,
} from './timeline-scene-node';
import {getTimelineScenePaintNodes} from './timeline-scene-paint';

const reorderPreviewRef = createRef<
	| ((
			rects: readonly {rect: DOMRect; offsetY: number}[],
	  ) => TimelineReorderPreview | null)
	| null
>();
export const createTimelineReorderPreview = (rect: DOMRect) =>
	reorderPreviewRef.current?.([{rect, offsetY: 0}]) ?? null;
export const createTimelineRowReorderPreview = (
	rects: readonly {rect: DOMRect; offsetY: number}[],
) => reorderPreviewRef.current?.(rects) ?? null;
type SceneTransitionOptions = {
	readonly panels: readonly {
		readonly element: HTMLElement;
		readonly clipY: {readonly top: number; readonly bottom: number};
	}[];
	readonly direction: 'forward' | 'backward';
	readonly update: () => void;
};
const sceneTransitionRef = createRef<
	((options: SceneTransitionOptions) => (() => void) | null) | null
>();
export const startTimelineSceneTransition = (options: SceneTransitionOptions) =>
	sceneTransitionRef.current?.(options) ?? null;

export const TimelineCanvasProvider: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	const hostRef = useRef<HTMLDivElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [ready, setReady] = useState(false);
	const [error, setError] = useState<Error | null>(null);
	const store = useMemo(() => {
		const listeners = new Set<() => void>();
		const next: TimelineSceneStore = {
			canvas: null,
			canvasRect: null,
			root: null as unknown as TimelineSceneNode,
			invalidate: () => undefined,
			repaint: () => undefined,
			subscribeLayout: (listener) => {
				listeners.add(listener);
				return () => {
					listeners.delete(listener);
				};
			},
			notifyLayout: () => {
				for (const listener of listeners) listener();
			},
			focus: () => undefined,
			blur: () => undefined,
			click: () => undefined,
			select: selectTimelineSceneNode,
			setSelectionRange: (node, start, end) =>
				setTimelineSceneSelectionRange(node, start, end, null),
		};
		next.root = new TimelineSceneNode('root', next);
		next.root.setProps({
			style: {
				display: 'flex',
				flexDirection: 'column',
				position: 'relative',
				backgroundColor: BACKGROUND,
			},
		});
		return next;
	}, []);
	useEffect(() => {
		const host = hostRef.current;
		const canvas = canvasRef.current;
		if (!host || !canvas) return;
		store.canvas = canvas;
		let disposed = false;
		let initializationFailed = false;
		let frame: number | null = null;
		let dirty = true;
		let revision = 0;
		let size = {width: 0, height: 0};
		let renderer: Awaited<
			ReturnType<typeof createPixiTimelineRenderer>
		> | null = null;
		let layout: Awaited<ReturnType<typeof createTimelineSceneLayout>> | null =
			null;
		let cancelTransition: (() => void) | null = null;
		const events = attachTimelineSceneEvents({
			canvas,
			root: store.root,
			invalidate: () => store.invalidate(),
		});
		store.focus = (node) => events.focus(node, null);
		store.blur = events.blur;
		store.click = events.click;
		const draw = () => {
			frame = null;
			if (disposed || !renderer || !layout) return;
			try {
				const width = host.clientWidth;
				const height = host.clientHeight;
				if (!width || !height) return;
				// Shared scene geometry reads never need to query browser layout.
				store.canvasRect = canvas.getBoundingClientRect();
				if (size.width !== width || size.height !== height) {
					size = {width, height};
					dirty = true;
				}

				if (dirty) {
					dirty = false;
					layout.layout(store.root, width, height);
					store.notifyLayout();
				} else layout.project(store.root, width, height);
				const computed = getComputedStyle(canvas);
				const resolveColor = (color: string) =>
					resolveStudioColor(color, computed);
				renderer.render(getTimelineScenePaintNodes(store.root, resolveColor), {
					width,
					height,
					left: 0,
					top: 0,
					resolution: getStudioPixelRatio(),
					scrollRevision: revision,
				});
				events.refresh();
			} catch (err) {
				setError(err instanceof Error ? err : new Error(String(err)));
			}
		};

		const schedule = () => {
			if (!disposed && frame === null) frame = requestAnimationFrame(draw);
		};

		store.repaint = () => {
			schedule();
		};

		store.invalidate = () => {
			dirty = true;
			revision++;
			schedule();
		};

		const flushDraw = () => {
			if (frame !== null) cancelAnimationFrame(frame);
			draw();
		};

		const preview = (rects: readonly {rect: DOMRect; offsetY: number}[]) => {
			if (!renderer || disposed) return null;
			flushDraw();
			const bounds = canvas.getBoundingClientRect();
			const result = renderer.createPreviewGroup(
				rects.map(({rect, offsetY}) => ({
					rect: {
						x: rect.left - bounds.left,
						y: rect.top - bounds.top,
						width: rect.width,
						height: rect.height,
					},
					offsetY,
				})),
			);
			if (!result) return null;
			schedule();
			return {
				move: (x: number, y: number | null) => {
					result.move(x, y);
					schedule();
				},
				destroy: () => {
					result.destroy();
					schedule();
				},
			};
		};

		reorderPreviewRef.current = preview;
		const startTransition = ({
			panels,
			direction,
			update,
		}: SceneTransitionOptions) => {
			if (
				!renderer ||
				disposed ||
				window.matchMedia('(prefers-reduced-motion: reduce)').matches
			)
				return null;
			cancelTransition?.();
			let animation: number | null = null;
			let snapshot: TimelineSceneTransition | null = null;
			let cancelled = false;
			const cancel = () => {
				if (cancelled) return;
				cancelled = true;
				if (animation !== null) cancelAnimationFrame(animation);
				snapshot?.destroy();
				if (cancelTransition === cancel) cancelTransition = null;
				schedule();
			};

			cancelTransition = cancel;
			animation = requestAnimationFrame(() => {
				animation = null;
				if (!renderer || disposed || cancelled) return;
				flushDraw();
				const bounds = canvas.getBoundingClientRect();
				const computed = getComputedStyle(canvas);
				const regions = panels.flatMap(({element, clipY}) => {
					const rect = element.getBoundingClientRect();
					const x = Math.max(0, rect.left - bounds.left);
					const y = Math.max(0, rect.top + clipY.top - bounds.top);
					const width = Math.min(bounds.width, rect.right - bounds.left) - x;
					const height =
						Math.min(bounds.height, rect.bottom - clipY.bottom - bounds.top) -
						y;
					return width > 0 && height > 0
						? [
								{
									x,
									y,
									width,
									height,
									slideDistance: rect.width * 0.15,
									background: resolveStudioColor(BACKGROUND, computed),
								},
							]
						: [];
				});
				if (regions.length === 0) {
					flushSync(update);
					cancel();
					return;
				}

				snapshot = renderer.createSceneTransition(regions, direction);
				flushSync(update);
				dirty = true;
				flushDraw();
				snapshot.captureNext();
				const start = performance.now();
				const tick = (now: number) => {
					if (disposed || cancelled) return;
					if (!snapshot?.advance(now - start)) cancel();
					flushDraw();
					if (!cancelled) animation = requestAnimationFrame(tick);
				};

				animation = requestAnimationFrame(tick);
			});
			return cancel;
		};

		sceneTransitionRef.current = startTransition;
		const resize = new ResizeObserver(store.invalidate);
		resize.observe(host);
		const theme = new MutationObserver(store.repaint);
		theme.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ['class', 'style', 'data-theme'],
		});
		Promise.all([
			createPixiTimelineRenderer(canvas).then((nextRenderer) => {
				if (disposed || initializationFailed) nextRenderer.destroy();
				else renderer = nextRenderer;
			}),
			createTimelineSceneLayout().then((nextLayout) => {
				if (disposed || initializationFailed) nextLayout.destroy();
				else layout = nextLayout;
			}),
		])
			.then(() => {
				if (disposed) return;
				setReady(true);
				schedule();
			})
			.catch((err) => {
				initializationFailed = true;
				renderer?.destroy();
				renderer = null;
				layout?.destroy();
				layout = null;
				if (!disposed) setError(err);
			});
		return () => {
			disposed = true;
			cancelTransition?.();
			if (frame !== null) cancelAnimationFrame(frame);
			resize.disconnect();
			theme.disconnect();
			events.dispose();
			renderer?.destroy();
			renderer = null;
			layout?.destroy();
			layout = null;
			store.canvas = null;
			store.canvasRect = null;
			store.invalidate = () => undefined;
			store.repaint = () => undefined;
			if (reorderPreviewRef.current === preview)
				reorderPreviewRef.current = null;
			if (sceneTransitionRef.current === startTransition)
				sceneTransitionRef.current = null;
		};
	}, [store]);
	if (error) throw error;
	return (
		<div
			ref={hostRef}
			data-timeline-scene="true"
			style={{
				position: 'relative',
				display: 'flex',
				flex: 1,
				height: '100%',
				minHeight: 0,
				minWidth: 0,
				overflow: 'hidden',
			}}
		>
			<canvas
				ref={canvasRef}
				data-timeline-pixi="true"
				tabIndex={0}
				aria-label="Timeline"
				style={{
					position: 'absolute',
					inset: 0,
					outline: 'none',
					touchAction: 'none',
				}}
			/>
			{ready ? (
				<TimelineSceneContext.Provider value={store.root}>
					{children}
				</TimelineSceneContext.Provider>
			) : null}
		</div>
	);
};

export const useTimelineCanvasInvalidation = () => {
	const node = useContext(TimelineSceneContext);
	return useMemo(() => () => node?.store.repaint(), [node]);
};

export const TimelinePaint: React.FC<{
	readonly style: React.CSSProperties;
	readonly children: React.ReactNode;
}> = ({style, children}) => jsx('div', {style, children});

export type {TimelineCanvasDraw} from './pixi-timeline-renderer';
export const useTimelineCanvasDrawing = (
	ref: React.RefObject<HTMLElement | null>,
	drawing: TimelineCanvasDraw | null,
) => {
	useLayoutEffect(() => {
		const node = ref.current;
		if (!isTimelineSceneNode(node)) return;
		node.drawing = drawing;
		node.store.repaint();
		return () => {
			node.drawing = null;
			node.store.repaint();
		};
	}, [drawing, ref]);
};
