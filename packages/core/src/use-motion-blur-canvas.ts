import type React from 'react';
import {
	useCallback,
	useContext,
	useLayoutEffect,
	useRef,
	useState,
} from 'react';
import {MotionBlurContext} from './motion-blur-context.js';

type ForwardedCanvasRef = {
	ref: React.Ref<HTMLCanvasElement> | null;
	canvas: HTMLCanvasElement | null;
	cleanup: (() => void) | null;
};

const setForwardedRef = (
	state: ForwardedCanvasRef,
	ref: React.Ref<HTMLCanvasElement> | null,
	canvas: HTMLCanvasElement | null,
) => {
	if (state.ref === ref && state.canvas === canvas) return;
	if (state.canvas !== null) {
		if (state.cleanup) state.cleanup();
		else if (typeof state.ref === 'function') state.ref(null);
		else if (state.ref) state.ref.current = null;
	}

	state.ref = ref;
	state.canvas = canvas;
	state.cleanup = null;
	if (canvas !== null) {
		if (typeof ref === 'function') {
			const cleanup = ref(canvas);
			state.cleanup = typeof cleanup === 'function' ? cleanup : null;
		} else if (ref) {
			ref.current = canvas;
		}
	}
};

export const useMotionBlurCanvas = ({
	sourceKey,
	contentKey,
	forwardedRef,
	onVideoFrame,
}: {
	sourceKey: string;
	contentKey: string;
	forwardedRef: React.Ref<HTMLCanvasElement> | null;
	onVideoFrame: ((frame: CanvasImageSource) => void) | null;
}) => {
	const motionBlur = useContext(MotionBlurContext);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const forwardedRefRef = useRef<ForwardedCanvasRef>({
		ref: forwardedRef,
		canvas: null,
		cleanup: null,
	});
	const [primary, setPrimary] = useState(false);
	const hasFrameCallback = onVideoFrame !== null;
	const [hasFrameCallbacks, setHasFrameCallbacks] = useState(hasFrameCallback);
	const frameCallbackRef = useRef(onVideoFrame);
	frameCallbackRef.current = onVideoFrame;
	const latestCanvasRef = useRef<{
		contentKey: string;
		canvas: HTMLCanvasElement;
	} | null>(null);
	const latestFrameRef = useRef<{
		contentKey: string;
		canvas: HTMLCanvasElement;
	} | null>(null);
	const publishRef = useRef<
		((canvas: HTMLCanvasElement | null) => void) | null
	>(null);
	const redrawRef = useRef<(() => void) | null>(null);
	const publishFrameRef = useRef<((frame: CanvasImageSource) => void) | null>(
		null,
	);
	useLayoutEffect(() => {
		setForwardedRef(forwardedRefRef.current, forwardedRef, canvasRef.current);
	}, [forwardedRef]);

	useLayoutEffect(() => {
		if (motionBlur === null) {
			return;
		}

		const {sampleIndex, isPrimarySample, registry} = motionBlur;
		const {canvases} = registry;
		const sources = canvases.get(sourceKey) ?? [];
		canvases.set(sourceKey, sources);
		let shared = sources.find(
			(candidate) => !candidate.registrations.has(sampleIndex),
		);
		if (!shared) {
			shared = {
				registrations: new Map(),
				primary: null,
				canvas: null,
				frame: null,
			};
			sources.push(shared);
		}

		const registration = {
			isPrimarySample,
			setPrimary,
			setHasFrameCallbacks,
			onVideoFrame: hasFrameCallback
				? (frame: CanvasImageSource) => frameCallbackRef.current?.(frame)
				: null,
			draw: (source: HTMLCanvasElement | null) => {
				const canvas = canvasRef.current;
				const context = canvas?.getContext('2d');
				if (!canvas || !context) {
					return;
				}

				if (source) {
					if (canvas.width !== source.width) canvas.width = source.width;
					if (canvas.height !== source.height) canvas.height = source.height;
					canvas.style.aspectRatio = `${source.width} / ${source.height}`;
				}

				context.clearRect(0, 0, canvas.width, canvas.height);
				if (source && source.width > 0 && source.height > 0) {
					context.drawImage(source, 0, 0);
				}
			},
		};
		shared.registrations.set(sampleIndex, registration);

		if (
			shared.primary === null ||
			(isPrimarySample && !shared.primary.isPrimarySample)
		) {
			shared.primary?.setPrimary(false);
			shared.primary = registration;
			shared.canvas =
				latestCanvasRef.current?.contentKey === contentKey
					? latestCanvasRef.current.canvas
					: null;
			shared.frame =
				latestFrameRef.current?.contentKey === contentKey
					? latestFrameRef.current.canvas
					: null;
			for (const subscriber of shared.registrations.values()) {
				if (subscriber !== registration) {
					subscriber.draw(shared.canvas);
					if (shared.frame) subscriber.onVideoFrame?.(shared.frame);
				}
			}
		}

		const callbacks = [...shared.registrations.values()].some(
			(subscriber) => subscriber.onVideoFrame !== null,
		);
		if (!callbacks && shared.primary === registration) {
			latestFrameRef.current = null;
			shared.frame = null;
		}

		for (const subscriber of shared.registrations.values()) {
			subscriber.setHasFrameCallbacks(callbacks);
		}

		setPrimary(shared.primary === registration);
		if (shared.primary !== registration) {
			registration.draw(shared.canvas);
		}

		const current = shared;
		if (current.frame && registration.onVideoFrame) {
			queueMicrotask(() => {
				if (current.registrations.get(sampleIndex) !== registration) return;
				if (current.frame) registration.onVideoFrame?.(current.frame);
			});
		}

		redrawRef.current = () => {
			if (current.primary !== registration) registration.draw(current.canvas);
		};

		publishRef.current = (canvas) => {
			if (current.primary !== registration) {
				return;
			}

			current.canvas = canvas;
			latestCanvasRef.current = canvas === null ? null : {contentKey, canvas};
			for (const subscriber of current.registrations.values()) {
				if (subscriber !== registration) subscriber.draw(canvas);
			}
		};

		publishFrameRef.current = (frame) => {
			if (current.primary !== registration) return;
			const width =
				'displayWidth' in frame
					? frame.displayWidth
					: 'videoWidth' in frame
						? frame.videoWidth
						: 'naturalWidth' in frame
							? frame.naturalWidth
							: frame.width;
			const height =
				'displayHeight' in frame
					? frame.displayHeight
					: 'videoHeight' in frame
						? frame.videoHeight
						: 'naturalHeight' in frame
							? frame.naturalHeight
							: frame.height;
			if (
				typeof width === 'number' &&
				typeof height === 'number' &&
				width > 0 &&
				height > 0
			) {
				const canvas =
					latestFrameRef.current?.canvas ?? document.createElement('canvas');
				if (canvas.width !== width) canvas.width = width;
				if (canvas.height !== height) canvas.height = height;
				const context = canvas.getContext('2d');
				if (context) {
					context.clearRect(0, 0, width, height);
					context.drawImage(frame, 0, 0);
					latestFrameRef.current = {contentKey, canvas};
					current.frame = canvas;
				}
			}

			for (const subscriber of current.registrations.values()) {
				subscriber.onVideoFrame?.(frame);
			}
		};

		return () => {
			publishRef.current = null;
			publishFrameRef.current = null;
			redrawRef.current = null;
			current.registrations.delete(sampleIndex);
			if (current.registrations.size === 0) {
				sources.splice(sources.indexOf(current), 1);
				if (sources.length === 0) canvases.delete(sourceKey);
				return;
			}

			if (current.primary === registration) {
				current.canvas = null;
				current.frame = null;
				current.primary = current.registrations.values().next().value!;
				for (const subscriber of current.registrations.values()) {
					subscriber.draw(null);
					subscriber.setPrimary(subscriber === current.primary);
				}
			}

			const remainingCallbacks = [...current.registrations.values()].some(
				(subscriber) => subscriber.onVideoFrame !== null,
			);
			for (const subscriber of current.registrations.values()) {
				subscriber.setHasFrameCallbacks(remainingCallbacks);
			}
		};
	}, [contentKey, hasFrameCallback, motionBlur, sourceKey]);

	const setCanvasRef = useCallback((canvas: HTMLCanvasElement | null) => {
		canvasRef.current = canvas;
		setForwardedRef(
			forwardedRefRef.current,
			forwardedRefRef.current.ref,
			canvas,
		);
		if (canvas === null) {
			publishRef.current?.(null);
		} else {
			redrawRef.current?.();
		}
	}, []);

	const onCanvasUpdated = useCallback((canvas: HTMLCanvasElement | null) => {
		publishRef.current?.(canvas);
	}, []);
	const onSharedVideoFrame = useCallback((frame: CanvasImageSource) => {
		publishFrameRef.current?.(frame);
	}, []);

	return {
		primary: motionBlur === null || primary,
		canvasRef: setCanvasRef,
		onCanvasUpdated: motionBlur === null ? null : onCanvasUpdated,
		onVideoFrame:
			motionBlur === null
				? onVideoFrame
				: hasFrameCallbacks
					? onSharedVideoFrame
					: null,
	};
};
