import React, {useEffect, useRef, useState} from 'react';
import {
	drawStudioHandoff,
	loadStudioHandoffAssets,
	STUDIO_HANDOFF_DURATION,
	STUDIO_HANDOFF_HEIGHT,
	STUDIO_HANDOFF_WIDTH,
} from './studio-handoff/renderer';

export const StudioHandoffCanvas: React.FC<{
	readonly onFrameRef: React.RefObject<((time: number) => void) | null>;
}> = ({onFrameRef}) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [ready, setReady] = useState(false);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) {
			return;
		}

		const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
		let disposed = false;
		let assets: Record<string, HTMLImageElement> = {};
		let loaded = false;
		let visible = typeof IntersectionObserver === 'undefined';
		let animationFrame: number | null = null;
		let previousTimestamp: number | null = null;
		let time = 0;

		const draw = () => {
			drawStudioHandoff(canvas, time, assets);
			onFrameRef.current?.(time);
		};

		const tick = (timestamp: number) => {
			animationFrame = null;
			if (disposed) {
				return;
			}

			if (previousTimestamp !== null) {
				time =
					(time + (timestamp - previousTimestamp) / 1000) %
					STUDIO_HANDOFF_DURATION;
			}

			previousTimestamp = timestamp;
			draw();
			animationFrame = requestAnimationFrame(tick);
		};

		const updatePlayback = () => {
			if (disposed) {
				return;
			}

			if (
				!loaded ||
				!visible ||
				document.hidden ||
				!document.hasFocus() ||
				reducedMotion.matches
			) {
				if (animationFrame !== null) {
					cancelAnimationFrame(animationFrame);
					animationFrame = null;
				}

				previousTimestamp = null;
				return;
			}

			if (animationFrame === null) {
				animationFrame = requestAnimationFrame(tick);
			}
		};

		const resize = () => {
			const bounds = canvas.getBoundingClientRect();
			const pixelRatio = window.devicePixelRatio || 1;
			const width = Math.max(1, Math.round(bounds.width * pixelRatio));
			const height = Math.max(1, Math.round(bounds.height * pixelRatio));
			if (canvas.width === width && canvas.height === height) {
				return;
			}

			canvas.width = width;
			canvas.height = height;
			if (loaded) {
				draw();
			}
		};

		const onMotionPreferenceChange = () => {
			if (reducedMotion.matches) {
				time = 0;
				if (loaded) {
					draw();
				}
			}

			updatePlayback();
		};

		const resizeObserver = new ResizeObserver(resize);
		resizeObserver.observe(canvas);
		const intersectionObserver =
			typeof IntersectionObserver === 'undefined'
				? null
				: new IntersectionObserver(([entry]) => {
						visible = entry.isIntersecting;
						updatePlayback();
					});
		intersectionObserver?.observe(canvas);
		document.addEventListener('visibilitychange', updatePlayback);
		window.addEventListener('focus', updatePlayback);
		window.addEventListener('blur', updatePlayback);
		window.addEventListener('resize', resize);
		reducedMotion.addEventListener('change', onMotionPreferenceChange);
		resize();

		const load = async () => {
			try {
				assets = await loadStudioHandoffAssets();
			} catch {
				// The interface still works when decorative images cannot load.
				assets = {};
			}

			if (disposed) {
				return;
			}

			loaded = true;
			draw();
			setReady(true);
			updatePlayback();
		};

		load();
		return () => {
			disposed = true;
			if (animationFrame !== null) {
				cancelAnimationFrame(animationFrame);
			}

			resizeObserver.disconnect();
			intersectionObserver?.disconnect();
			document.removeEventListener('visibilitychange', updatePlayback);
			window.removeEventListener('focus', updatePlayback);
			window.removeEventListener('blur', updatePlayback);
			window.removeEventListener('resize', resize);
			reducedMotion.removeEventListener('change', onMotionPreferenceChange);
		};
	}, [onFrameRef]);

	return (
		<>
			{ready ? null : (
				<div
					aria-hidden
					className="absolute inset-0 overflow-hidden pointer-events-none"
				>
					<div
						style={{
							width: '100%',
							aspectRatio: '1874 / 1075',
							backgroundColor: '#101114',
							borderRadius: '2.16% / 3.77%',
						}}
					/>
				</div>
			)}
			<canvas
				ref={canvasRef}
				width={STUDIO_HANDOFF_WIDTH}
				height={STUDIO_HANDOFF_HEIGHT}
				role="img"
				aria-label="Remotion Studio, Codex and VS Code working together"
				className="block aspect-[1874/1020] h-auto w-full"
				style={{opacity: ready ? 1 : 0}}
			/>
		</>
	);
};
