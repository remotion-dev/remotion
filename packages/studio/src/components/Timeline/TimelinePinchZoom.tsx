import {useCallback, useContext, useEffect, useRef, type FC} from 'react';
import {Internals} from 'remotion';
import {getTimelineZoom} from '../../helpers/get-timeline-max-zoom';
import {useIsVideoComposition} from '../../helpers/is-current-selected-still';
import {TIMELINE_PADDING} from '../../helpers/timeline-layout';
import {EditorZoomGesturesContext} from '../../state/editor-zoom-gestures';
import {
	TimelineZoomImperativeContext,
	type TimelineSetZoomOptions,
} from '../../state/timeline-zoom';
import {getCurrentDuration, getCurrentFrame} from './imperative-state';
import {scrollableRef, timelineVerticalScroll} from './timeline-refs';
import {
	getFrameIncrementFromWidth,
	getTimelineContentWidth,
	viewportClientXToScrollContentX,
} from './timeline-scroll-logic';

/**
 * Maps wheel deltaY to a multiplicative zoom change. Must be large enough that
 * typical ctrl+wheel pinch steps change `TimelineZoomCtx` zoom by at least one
 * 0.1 step after rounding in `clampTimelineZoom` (0.005 was too small at 1x).
 */
const ZOOM_WHEEL_SENSITIVITY = 0.06;

// A zoom gesture that starts this close to the playhead zooms around the playhead.
const PLAYHEAD_SNAP_DISTANCE = 8;

// Moving the mouse further than this ends a Cmd/Ctrl + wheel zoom gesture.
const WHEEL_GESTURE_MOVE_TOLERANCE = 3;

type WebKitGestureEvent = UIEvent & {
	scale: number;
	clientX: number;
	clientY: number;
};

/**
 * The frame that stays under the pointer for a whole zoom gesture. Deriving it
 * again on every step would follow the scroll position, which the browser
 * clamps when zooming out, so zooming back in would land somewhere else.
 */
type ZoomAnchor = {
	frame: number;
	offsetFromPointer: number;
};

const getZoomAnchor = (
	clientX: number,
	scrollEl: HTMLDivElement,
): ZoomAnchor => {
	const contentX = viewportClientXToScrollContentX({clientX, scrollEl});
	const frameIncrement = getFrameIncrementFromWidth(
		getCurrentDuration(),
		getTimelineContentWidth(),
	);
	const playheadFrame = getCurrentFrame();
	const playheadX = TIMELINE_PADDING + playheadFrame * frameIncrement;

	if (Math.abs(playheadX - contentX) <= PLAYHEAD_SNAP_DISTANCE) {
		return {frame: playheadFrame, offsetFromPointer: playheadX - contentX};
	}

	return {
		frame: (contentX - TIMELINE_PADDING) / frameIncrement,
		offsetFromPointer: 0,
	};
};

const getAnchoredZoomOptions = (
	anchor: ZoomAnchor,
	clientX: number,
	scrollEl: HTMLDivElement,
): TimelineSetZoomOptions => {
	return {
		anchorFrame: anchor.frame,
		anchorContentX: null,
		anchorViewportX:
			viewportClientXToScrollContentX({clientX, scrollEl}) -
			scrollEl.scrollLeft +
			anchor.offsetFromPointer,
	};
};

export const TimelinePinchZoom: FC = () => {
	const isVideoComposition = useIsVideoComposition();
	const videoConfig = Internals.useUnsafeVideoConfig();
	const {getZoom, setZoom, beginZoom, endZoom} = useContext(
		TimelineZoomImperativeContext,
	);
	const {editorZoomGestures} = useContext(EditorZoomGesturesContext);

	const getCurrentTimelineZoom = useCallback(
		(compositionId: string) => {
			return getTimelineZoom({
				durationInFrames: videoConfig?.durationInFrames ?? 1,
				timelineViewportWidth: scrollableRef.current?.clientWidth ?? 0,
				zoom: getZoom(compositionId),
			});
		},
		[getZoom, videoConfig?.durationInFrames],
	);

	const pinchBaseZoomRef = useRef<number | null>(null);
	const pinchAnchorRef = useRef<ZoomAnchor | null>(null);
	const suppressWheelFromWebKitPinchRef = useRef(false);
	const touchPinchRef = useRef<{
		initialDistance: number;
		initialZoom: number;
		anchor: ZoomAnchor;
	} | null>(null);

	useEffect(() => {
		const el = timelineVerticalScroll.current;
		if (
			!el ||
			!editorZoomGestures ||
			!isVideoComposition ||
			!videoConfig ||
			videoConfig.durationInFrames < 2
		) {
			return;
		}

		let wheelAnchor:
			| (ZoomAnchor & {clientX: number; scrollLeft: number})
			| null = null;

		const endWheelGesture = () => {
			wheelAnchor = null;
			window.removeEventListener('keyup', onKeyUp);
			window.removeEventListener('pointermove', onPointerMove);
			window.removeEventListener('blur', endWheelGesture);
		};

		const onKeyUp = (e: KeyboardEvent) => {
			if (e.key === 'Meta' || e.key === 'Control') {
				endWheelGesture();
			}
		};

		const onPointerMove = (e: PointerEvent) => {
			if (
				wheelAnchor !== null &&
				Math.abs(e.clientX - wheelAnchor.clientX) > WHEEL_GESTURE_MOVE_TOLERANCE
			) {
				endWheelGesture();
			}
		};

		const onWheel = (e: WheelEvent) => {
			const {ctrlKey, metaKey, clientX, deltaY, deltaMode} = e;
			const wantsToZoom = ctrlKey || metaKey;
			if (!wantsToZoom) {
				// Scrolling in between zoom steps ends the gesture.
				endWheelGesture();
				return;
			}

			if (suppressWheelFromWebKitPinchRef.current && wantsToZoom) {
				e.preventDefault();
				return;
			}

			const scrollEl = scrollableRef.current;
			if (!scrollEl) {
				return;
			}

			e.preventDefault();

			// If something else scrolled the timeline since the last step (playback
			// paging, the scrollbar), the anchor no longer matches what is on screen.
			if (
				wheelAnchor !== null &&
				wheelAnchor.scrollLeft !== scrollEl.scrollLeft
			) {
				endWheelGesture();
			}

			if (wheelAnchor === null) {
				wheelAnchor = {
					...getZoomAnchor(clientX, scrollEl),
					clientX,
					scrollLeft: scrollEl.scrollLeft,
				};
				window.addEventListener('keyup', onKeyUp);
				window.addEventListener('pointermove', onPointerMove);
				window.addEventListener('blur', endWheelGesture);
			}

			const anchor = wheelAnchor;

			let scaledDeltaY = deltaY;
			if (deltaMode === WheelEvent.DOM_DELTA_LINE) {
				scaledDeltaY *= 16;
			} else if (deltaMode === WheelEvent.DOM_DELTA_PAGE) {
				scaledDeltaY *= scrollEl.clientHeight;
			}

			setZoom(
				videoConfig.id,
				(z) => z * Math.exp(-scaledDeltaY * ZOOM_WHEEL_SENSITIVITY),
				getAnchoredZoomOptions(anchor, clientX, scrollEl),
			);
			anchor.scrollLeft = scrollEl.scrollLeft;
		};

		el.addEventListener('wheel', onWheel, {passive: false});
		return () => {
			endWheelGesture();
			el.removeEventListener('wheel', onWheel);
		};
	}, [editorZoomGestures, isVideoComposition, videoConfig, setZoom]);

	const supportsWebKitPinch =
		typeof window !== 'undefined' && 'GestureEvent' in window;

	useEffect(() => {
		const el = timelineVerticalScroll.current;
		if (!el || !editorZoomGestures || !supportsWebKitPinch) {
			return;
		}

		const endWebKitPinch = () => {
			if (pinchBaseZoomRef.current !== null) {
				endZoom();
			}

			pinchBaseZoomRef.current = null;
			pinchAnchorRef.current = null;
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

			const scrollEl = scrollableRef.current;
			if (!scrollEl) {
				return;
			}

			e.preventDefault();
			suppressWheelFromWebKitPinchRef.current = true;

			pinchBaseZoomRef.current = getCurrentTimelineZoom(videoConfig.id);
			pinchAnchorRef.current = getZoomAnchor(e.clientX, scrollEl);
			beginZoom();
		};

		const onGestureChange = (event: Event) => {
			const e = event as WebKitGestureEvent;
			const base = pinchBaseZoomRef.current;
			const anchor = pinchAnchorRef.current;
			if (
				base === null ||
				anchor === null ||
				!isVideoComposition ||
				!videoConfig ||
				videoConfig.durationInFrames < 2
			) {
				return;
			}

			const scrollEl = scrollableRef.current;
			if (!scrollEl) {
				return;
			}

			e.preventDefault();

			setZoom(
				videoConfig.id,
				() => base * e.scale,
				getAnchoredZoomOptions(anchor, e.clientX, scrollEl),
			);
		};

		const onGestureEnd = () => {
			endWebKitPinch();
		};

		el.addEventListener('gesturestart', onGestureStart, {passive: false});
		el.addEventListener('gesturechange', onGestureChange, {passive: false});
		el.addEventListener('gestureend', onGestureEnd);
		el.addEventListener('gesturecancel', onGestureEnd);

		return () => {
			endWebKitPinch();
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
		getCurrentTimelineZoom,
		setZoom,
		beginZoom,
		endZoom,
	]);

	useEffect(() => {
		const el = timelineVerticalScroll.current;
		if (!el || !editorZoomGestures) {
			return;
		}

		const onTouchStart = (event: TouchEvent) => {
			if (event.touches.length !== 2) {
				if (touchPinchRef.current !== null) {
					endZoom();
				}

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

			const [t0, t1] = [event.touches[0], event.touches[1]];
			const initialDistance = Math.hypot(
				t1.clientX - t0.clientX,
				t1.clientY - t0.clientY,
			);
			if (initialDistance < 1e-6) {
				return;
			}

			const scrollEl = scrollableRef.current;
			if (!scrollEl) {
				return;
			}

			touchPinchRef.current = {
				initialDistance,
				initialZoom: getCurrentTimelineZoom(videoConfig.id),
				anchor: getZoomAnchor((t0.clientX + t1.clientX) / 2, scrollEl),
			};
			beginZoom();
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

			const scrollEl = scrollableRef.current;
			if (!scrollEl) {
				return;
			}

			event.preventDefault();

			const [t0, t1] = [event.touches[0], event.touches[1]];
			const dist = Math.hypot(t1.clientX - t0.clientX, t1.clientY - t0.clientY);
			const ratio = dist / pinch.initialDistance;
			const clientX = (t0.clientX + t1.clientX) / 2;

			setZoom(
				videoConfig.id,
				() => pinch.initialZoom * ratio,
				getAnchoredZoomOptions(pinch.anchor, clientX, scrollEl),
			);
		};

		const onTouchEnd = (event: TouchEvent) => {
			if (event.touches.length < 2) {
				if (touchPinchRef.current !== null) {
					endZoom();
				}

				touchPinchRef.current = null;
			}
		};

		el.addEventListener('touchstart', onTouchStart, {passive: true});
		el.addEventListener('touchmove', onTouchMove, {passive: false});
		el.addEventListener('touchend', onTouchEnd);
		el.addEventListener('touchcancel', onTouchEnd);

		return () => {
			if (touchPinchRef.current !== null) {
				touchPinchRef.current = null;
				endZoom();
			}

			el.removeEventListener('touchstart', onTouchStart);
			el.removeEventListener('touchmove', onTouchMove);
			el.removeEventListener('touchend', onTouchEnd);
			el.removeEventListener('touchcancel', onTouchEnd);
		};
	}, [
		editorZoomGestures,
		isVideoComposition,
		videoConfig,
		getCurrentTimelineZoom,
		setZoom,
		beginZoom,
		endZoom,
	]);

	return null;
};
