import {
	useCallback,
	useContext,
	useLayoutEffect,
	useRef,
	useState,
} from 'react';
import {Internals} from 'remotion';

export const useMotionBlurVideo = (sourceKey: string) => {
	const motionBlur = useContext(Internals.MotionBlurContext);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [primary, setPrimary] = useState(false);
	const publishRef = useRef<((canvas: HTMLCanvasElement) => void) | null>(null);

	useLayoutEffect(() => {
		if (motionBlur === null) {
			return;
		}

		const {sampleIndex, isPrimarySample, videoCanvases} = motionBlur;
		const canvases = videoCanvases.get(sourceKey) ?? [];
		videoCanvases.set(sourceKey, canvases);
		let shared = canvases.find(
			(candidate) => !candidate.registrations.has(sampleIndex),
		);
		if (!shared) {
			shared = {registrations: new Map(), primary: null, canvas: null};
			canvases.push(shared);
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
			current.registrations.delete(sampleIndex);
			if (current.registrations.size === 0) {
				canvases.splice(canvases.indexOf(current), 1);
				if (canvases.length === 0) videoCanvases.delete(sourceKey);
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

	const onCanvasUpdated = useCallback((canvas: HTMLCanvasElement) => {
		publishRef.current?.(canvas);
	}, []);

	return {
		primary: motionBlur === null || primary,
		canvasRef,
		onCanvasUpdated: motionBlur === null ? null : onCanvasUpdated,
	};
};
