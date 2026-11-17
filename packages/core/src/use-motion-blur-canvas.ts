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

export const useMotionBlurCanvas = (
	sourceKey: string,
	forwardedRef: React.Ref<HTMLCanvasElement> | null,
) => {
	const motionBlur = useContext(MotionBlurContext);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const forwardedRefRef = useRef<ForwardedCanvasRef>({
		ref: forwardedRef,
		canvas: null,
		cleanup: null,
	});
	const [primary, setPrimary] = useState(false);
	const publishRef = useRef<
		((canvas: HTMLCanvasElement | null) => void) | null
	>(null);
	const redrawRef = useRef<(() => void) | null>(null);
	useLayoutEffect(() => {
		setForwardedRef(forwardedRefRef.current, forwardedRef, canvasRef.current);
	}, [forwardedRef]);

	useLayoutEffect(() => {
		if (motionBlur === null) {
			return;
		}

		const {sampleIndex, isPrimarySample, canvases} = motionBlur;
		const sources = canvases.get(sourceKey) ?? [];
		canvases.set(sourceKey, sources);
		let shared = sources.find(
			(candidate) => !candidate.registrations.has(sampleIndex),
		);
		if (!shared) {
			shared = {registrations: new Map(), primary: null, canvas: null};
			sources.push(shared);
		}

		const registration = {
			isPrimarySample,
			setPrimary,
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
			shared.canvas = null;
			for (const subscriber of shared.registrations.values()) {
				if (subscriber !== registration) subscriber.draw(null);
			}
		}

		setPrimary(shared.primary === registration);
		if (shared.primary !== registration) {
			registration.draw(shared.canvas);
		}

		const current = shared;
		redrawRef.current = () => {
			if (current.primary !== registration) registration.draw(current.canvas);
		};

		publishRef.current = (canvas) => {
			if (current.primary !== registration) {
				return;
			}

			current.canvas = canvas;
			for (const subscriber of current.registrations.values()) {
				if (subscriber !== registration) subscriber.draw(canvas);
			}
		};

		return () => {
			publishRef.current = null;
			redrawRef.current = null;
			current.registrations.delete(sampleIndex);
			if (current.registrations.size === 0) {
				sources.splice(sources.indexOf(current), 1);
				if (sources.length === 0) canvases.delete(sourceKey);
				return;
			}

			if (current.primary === registration) {
				current.canvas = null;
				current.primary = current.registrations.values().next().value!;
				for (const subscriber of current.registrations.values()) {
					subscriber.draw(null);
					subscriber.setPrimary(subscriber === current.primary);
				}
			}
		};
	}, [motionBlur, sourceKey]);

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

	return {
		primary: motionBlur === null || primary,
		canvasRef: setCanvasRef,
		onCanvasUpdated: motionBlur === null ? null : onCanvasUpdated,
	};
};
