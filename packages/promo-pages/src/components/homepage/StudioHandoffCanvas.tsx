import React, {useEffect, useRef, useState} from 'react';
import {
	createStudioHandoffTransition,
	getStudioHandoffFrame,
	getStudioHandoffTransitionFrame,
	type StudioHandoffMode,
	type StudioHandoffTitleState,
} from './studio-handoff/animation';
import {
	drawStudioHandoff,
	loadStudioHandoffAssets,
	STUDIO_HANDOFF_DURATION,
	STUDIO_HANDOFF_HEIGHT,
	STUDIO_HANDOFF_WIDTH,
} from './studio-handoff/renderer';

export const StudioHandoffCanvas: React.FC<{
	readonly onFrameRef: React.RefObject<
		((state: StudioHandoffTitleState) => void) | null
	>;
	readonly selectModeRef: React.RefObject<
		((mode: StudioHandoffMode) => void) | null
	>;
}> = ({onFrameRef, selectModeRef}) => {
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
		let visible = typeof IntersectionObserver === 'undefined';
		let animationFrame: number | null = null;
		let previousTimestamp: number | null = null;
		let time = 0;
		let currentFrame = getStudioHandoffFrame(0);
		let transition: ReturnType<typeof createStudioHandoffTransition> | null =
			null;
		let transitionElapsed = 0;
		let holdRemaining = 0;

		const draw = () => {
			drawStudioHandoff(canvas, time, assets, currentFrame.layout);
			onFrameRef.current?.(currentFrame.title);
		};

		const tick = (timestamp: number) => {
			animationFrame = null;
			if (disposed) {
				return;
			}

			const delta =
				previousTimestamp === null ? 0 : (timestamp - previousTimestamp) / 1000;
			if (transition) {
				transitionElapsed += delta;
				currentFrame = getStudioHandoffTransitionFrame(
					transition,
					transitionElapsed,
				);
				if (transitionElapsed >= transition.duration) {
					const overflow = transitionElapsed - transition.duration;
					holdRemaining = Math.max(0, 3 - overflow);
					time =
						(transition.targetTime + Math.max(0, overflow - 3)) %
						STUDIO_HANDOFF_DURATION;
					transition = null;
					currentFrame = getStudioHandoffFrame(time);
				}
			} else {
				const held = Math.min(delta, holdRemaining);
				holdRemaining -= held;
				time = (time + delta - held) % STUDIO_HANDOFF_DURATION;
				currentFrame = getStudioHandoffFrame(time);
			}

			previousTimestamp = timestamp;
			draw();
			if (visible || transition) {
				animationFrame = requestAnimationFrame(tick);
			} else {
				previousTimestamp = null;
			}
		};

		const updatePlayback = () => {
			if (disposed) {
				return;
			}

			if (
				(!visible && !transition) ||
				document.hidden ||
				(reducedMotion.matches && !transition)
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

		selectModeRef.current = (mode) => {
			// Redirect from the actual visible pose, even during another selection.
			transition = createStudioHandoffTransition(currentFrame, mode);
			transitionElapsed = 0;
			holdRemaining = 0;
			previousTimestamp = performance.now();
			if (reducedMotion.matches || transition.duration === 0) {
				time = transition.targetTime;
				holdRemaining = 3;
				currentFrame = transition.to;
				transition = null;
				draw();
			}

			updatePlayback();
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
			draw();
		};

		const onMotionPreferenceChange = () => {
			if (reducedMotion.matches) {
				time = 0;
				holdRemaining = 0;
				transition = null;
				currentFrame = getStudioHandoffFrame(time);
				draw();
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
		window.addEventListener('resize', resize);
		reducedMotion.addEventListener('change', onMotionPreferenceChange);
		resize();
		draw();
		setReady(true);
		updatePlayback();

		loadStudioHandoffAssets((key, image) => {
			if (disposed) {
				return;
			}

			assets = {...assets, [key]: image};
			draw();
		}).catch(() => {
			// Keep animating with the images that loaded successfully.
		});

		return () => {
			disposed = true;
			selectModeRef.current = null;
			if (animationFrame !== null) {
				cancelAnimationFrame(animationFrame);
			}

			resizeObserver.disconnect();
			intersectionObserver?.disconnect();
			document.removeEventListener('visibilitychange', updatePlayback);
			window.removeEventListener('resize', resize);
			reducedMotion.removeEventListener('change', onMotionPreferenceChange);
		};
	}, [onFrameRef, selectModeRef]);

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
