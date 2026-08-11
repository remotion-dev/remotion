import {useCallback, useContext, useEffect, useRef, type FC} from 'react';
import {Internals} from 'remotion';
import {useIsVideoComposition} from '../../helpers/is-current-selected-still';
import {EditorZoomGesturesContext} from '../../state/editor-zoom-gestures';
import {TIMELINE_MIN_ZOOM, TimelineZoomCtx} from '../../state/timeline-zoom';
import {scrollableRef, timelineVerticalScroll} from './timeline-refs';
import {viewportClientXToScrollContentX} from './timeline-scroll-logic';

/**
 * Maps wheel deltaY to zoom delta. Must be large enough that typical ctrl+wheel
 * pinch steps change `TimelineZoomCtx` zoom by at least one 0.1 step after
 * `Math.round(z * 10) / 10` in `timeline-zoom.tsx` (0.005 was too small).
 */
const ZOOM_WHEEL_DELTA = 0.06;

type WebKitGestureEvent = UIEvent & {
	scale: number;
	clientX: number;
	clientY: number;
};

export const TimelinePinchZoom: FC = () => {
	const isVideoComposition = useIsVideoComposition();
	const videoConfig = Internals.useUnsafeVideoConfig();
	const {canvasContent} = useContext(Internals.CompositionManager);
	const {zoom, setZoom} = useContext(TimelineZoomCtx);
	const {editorZoomGestures} = useContext(EditorZoomGesturesContext);

	const zoomRef = useRef(zoom);
	zoomRef.current = zoom;

	const pinchBaseZoomRef = useRef<number | null>(null);
	const suppressWheelFromWebKitPinchRef = useRef(false);
	const touchPinchRef = useRef<{
		initialDistance: number;
		initialZoom: number;
	} | null>(null);

	const onWheel = useCallback(
		(e: WheelEvent) => {
			if (!editorZoomGestures || !isVideoComposition) {
				return;
			}

			const {ctrlKey, metaKey, clientX, deltaY, deltaMode} = e;
			const wantsToZoom = ctrlKey || metaKey;
			if (!wantsToZoom) {
				return;
			}

			if (suppressWheelFromWebKitPinchRef.current && wantsToZoom) {
				e.preventDefault();
				return;
			}

			if (!videoConfig || videoConfig.durationInFrames < 2) {
				return;
			}

			if (!canvasContent || canvasContent.type !== 'composition') {
				return;
			}

			const scrollEl = scrollableRef.current;
			if (!scrollEl) {
				return;
			}

			e.preventDefault();

			const anchorContentX = viewportClientXToScrollContentX({
				clientX,
				scrollEl,
			});

			let scaledDeltaY = deltaY;
			if (deltaMode === WheelEvent.DOM_DELTA_LINE) {
				scaledDeltaY *= 16;
			} else if (deltaMode === WheelEvent.DOM_DELTA_PAGE) {
				scaledDeltaY *= scrollEl.clientHeight;
			}

			setZoom(
				canvasContent.compositionId,
				(z) => z - scaledDeltaY * ZOOM_WHEEL_DELTA,
				{anchorFrame: null, anchorContentX},
			);
		},
		[
			editorZoomGestures,
			isVideoComposition,
			videoConfig,
			canvasContent,
			setZoom,
		],
	);

	const supportsWebKitPinch =
		typeof window !== 'undefined' && 'GestureEvent' in window;

	useEffect(() => {
		const el = timelineVerticalScroll.current;
		if (!el) {
			return;
		}

		el.addEventListener('wheel', onWheel, {passive: false});
		return () => {
			el.removeEventListener('wheel', onWheel);
		};
	}, [onWheel]);

	useEffect(() => {
		const el = timelineVerticalScroll.current;
		if (!el || !editorZoomGestures || !supportsWebKitPinch) {
			return;
		}

		const endWebKitPinch = () => {
			pinchBaseZoomRef.current = null;
			suppressWheelFromWebKitPinchRef.current = false;
		};

		const onGestureStart = (event: Event) => {
			const e = event as WebKitGestureEvent;
			if (!isVideoComposition) {
				return;
			}

			if (!videoConfig || videoConfig.durationInFrames < 2) {
				return;
			}

			if (!canvasContent || canvasContent.type !== 'composition') {
				return;
			}

			const scrollEl = scrollableRef.current;
			if (!scrollEl) {
				return;
			}

			e.preventDefault();
			suppressWheelFromWebKitPinchRef.current = true;

			pinchBaseZoomRef.current =
				zoomRef.current[canvasContent.compositionId] ?? TIMELINE_MIN_ZOOM;
		};

		const onGestureChange = (event: Event) => {
			const e = event as WebKitGestureEvent;
			const base = pinchBaseZoomRef.current;
			if (
				base === null ||
				!isVideoComposition ||
				!videoConfig ||
				videoConfig.durationInFrames < 2
			) {
				return;
			}

			if (!canvasContent || canvasContent.type !== 'composition') {
				return;
			}

			const scrollEl = scrollableRef.current;
			if (!scrollEl) {
				return;
			}

			e.preventDefault();

			const anchorContentX = viewportClientXToScrollContentX({
				clientX: e.clientX,
				scrollEl,
			});

			setZoom(canvasContent.compositionId, () => base * e.scale, {
				anchorFrame: null,
				anchorContentX,
			});
		};

		const onGestureEnd = () => {
			endWebKitPinch();
		};

		el.addEventListener('gesturestart', onGestureStart, {passive: false});
		el.addEventListener('gesturechange', onGestureChange, {passive: false});
		el.addEventListener('gestureend', onGestureEnd);
		el.addEventListener('gesturecancel', onGestureEnd);

		return () => {
			el.removeEventListener('gesturestart', onGestureStart);
			el.removeEventListener('gesturechange', onGestureChange);
			el.removeEventListener('gestureend', onGestureEnd);
			el.removeEventListener('gesturecancel', onGestureEnd);
		};
	}, [
		editorZoomGestures,
		supportsWebKitPinch,
		isVideoComposition,
		videoConfig,
		canvasContent,
		setZoom,
	]);

	useEffect(() => {
		const el = timelineVerticalScroll.current;
		if (!el || !editorZoomGestures) {
			return;
		}

		const onTouchStart = (event: TouchEvent) => {
			if (event.touches.length !== 2) {
				touchPinchRef.current = null;
				return;
			}

			if (
				!isVideoComposition ||
				!videoConfig ||
				videoConfig.durationInFrames < 2
			) {
				return;
			}

			if (!canvasContent || canvasContent.type !== 'composition') {
				return;
			}

			const [t0, t1] = [event.touches[0], event.touches[1]];
			const initialDistance = Math.hypot(
				t1.clientX - t0.clientX,
				t1.clientY - t0.clientY,
			);
			if (initialDistance < 1e-6) {
				return;
			}

			touchPinchRef.current = {
				initialDistance,
				initialZoom:
					zoomRef.current[canvasContent.compositionId] ?? TIMELINE_MIN_ZOOM,
			};
		};

		const onTouchMove = (event: TouchEvent) => {
			const pinch = touchPinchRef.current;
			if (
				pinch === null ||
				event.touches.length !== 2 ||
				!videoConfig ||
				videoConfig.durationInFrames < 2
			) {
				return;
			}

			if (!canvasContent || canvasContent.type !== 'composition') {
				return;
			}

			const scrollEl = scrollableRef.current;
			if (!scrollEl) {
				return;
			}

			event.preventDefault();

			const [t0, t1] = [event.touches[0], event.touches[1]];
			const dist = Math.hypot(t1.clientX - t0.clientX, t1.clientY - t0.clientY);
			const ratio = dist / pinch.initialDistance;
			const clientX = (t0.clientX + t1.clientX) / 2;

			const anchorContentX = viewportClientXToScrollContentX({
				clientX,
				scrollEl,
			});

			setZoom(canvasContent.compositionId, () => pinch.initialZoom * ratio, {
				anchorFrame: null,
				anchorContentX,
			});
		};

		const onTouchEnd = (event: TouchEvent) => {
			if (event.touches.length < 2) {
				touchPinchRef.current = null;
			}
		};

		el.addEventListener('touchstart', onTouchStart, {passive: true});
		el.addEventListener('touchmove', onTouchMove, {passive: false});
		el.addEventListener('touchend', onTouchEnd);
		el.addEventListener('touchcancel', onTouchEnd);

		return () => {
			el.removeEventListener('touchstart', onTouchStart);
			el.removeEventListener('touchmove', onTouchMove);
			el.removeEventListener('touchend', onTouchEnd);
			el.removeEventListener('touchcancel', onTouchEnd);
		};
	}, [
		editorZoomGestures,
		isVideoComposition,
		videoConfig,
		canvasContent,
		setZoom,
	]);

	return null;
};
