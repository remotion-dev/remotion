import React, {useEffect, useRef, useState} from 'react';
import {
	AbsoluteFill,
	cancelRender,
	continueRender,
	delayRender,
	interpolate,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

// Type augmentation for the WICG html-in-canvas proposal:
// https://github.com/WICG/html-in-canvas
//
// In Chrome, requires enabling chrome://flags/#canvas-draw-element.
// canvas.requestPaint() is currently only available in Chrome Canary; on
// regular Chrome we fall back to a double-requestAnimationFrame to give the
// browser a chance to lay out and paint after React commits.
//
// The current Chromium implementation requires the element passed to
// drawElementImage() to be an immediate child of the canvas, and the canvas
// must have its `layoutSubtree` property set to true so the children are
// actually laid out (instead of being treated as fallback content).
type Canvas2DWithDrawElement = CanvasRenderingContext2D & {
	drawElementImage: (
		element: Element,
		dx: number,
		dy: number,
		dwidth: number,
		dheight: number,
	) => DOMMatrix;
};

type HTMLCanvasWithLayoutSubtree = HTMLCanvasElement & {
	layoutSubtree?: boolean;
	requestPaint?: () => void;
};

const isHtmlInCanvasSupported = () => {
	if (typeof document === 'undefined') {
		return false;
	}

	const ctx = document
		.createElement('canvas')
		.getContext('2d') as Canvas2DWithDrawElement | null;
	return typeof ctx?.drawElementImage === 'function';
};

const Scene: React.FC = () => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();

	const progress = frame / durationInFrames;
	const hue = Math.round(progress * 360);

	return (
		<div
			style={{
				width: '100%',
				height: '100%',
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				gap: 40,
				background: `linear-gradient(135deg, hsl(${hue}, 80%, 60%), hsl(${
					(hue + 80) % 360
				}, 80%, 40%))`,
				color: 'white',
				fontFamily:
					'-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
				textAlign: 'center',
			}}
		>
			<div style={{fontSize: 120, fontWeight: 800, letterSpacing: -4}}>
				HTML in Canvas
			</div>
			<div
				style={{
					fontSize: 56,
					fontWeight: 600,
					padding: '20px 40px',
					borderRadius: 24,
					background: 'rgba(0, 0, 0, 0.35)',
				}}
			>
				Frame {frame} captured via{' '}
				<code
					style={{
						fontFamily: 'ui-monospace, SFMono-Regular, monospace',
						background: 'rgba(255, 255, 255, 0.2)',
						padding: '4px 12px',
						borderRadius: 8,
					}}
				>
					drawElementImage()
				</code>
			</div>
			<div style={{display: 'flex', gap: 24}}>
				{[0, 1, 2, 3, 4].map((i) => {
					const delay = i * 4;
					const t = Math.max(0, Math.min(1, (frame - delay) / 30));
					const scale = 0.6 + 0.4 * Math.sin(progress * Math.PI * 2 + i);
					return (
						<div
							key={i}
							style={{
								width: 90,
								height: 90,
								borderRadius: '50%',
								background: 'white',
								opacity: t,
								transform: `scale(${scale})`,
							}}
						/>
					);
				})}
			</div>
		</div>
	);
};

// Apply a vertical wave effect: shift columns of the captured image up and
// down with a sine wave that moves over time.
const applyWaveEffect = ({
	source,
	target,
	frame,
	width,
	height,
}: {
	source: HTMLCanvasElement;
	target: HTMLCanvasElement;
	frame: number;
	width: number;
	height: number;
}) => {
	const ctx = target.getContext('2d');
	if (!ctx) {
		return;
	}

	ctx.fillStyle = 'black';
	ctx.fillRect(0, 0, width, height);

	const sliceWidth = 4;
	const amplitude = 60;
	const wavelength = 240;

	for (let x = 0; x < width; x += sliceWidth) {
		const offset =
			Math.sin((x / wavelength) * Math.PI * 2 + frame / 6) * amplitude;
		ctx.drawImage(
			source,
			x,
			0,
			sliceWidth,
			height,
			x,
			offset,
			sliceWidth,
			height,
		);
	}
};

export const HtmlInCanvasDemo: React.FC = () => {
	const frame = useCurrentFrame();
	const {width, height} = useVideoConfig();

	const sourceCanvasRef = useRef<HTMLCanvasElement | null>(null);
	const sceneRef = useRef<HTMLDivElement | null>(null);
	const outputCanvasRef = useRef<HTMLCanvasElement | null>(null);

	const [supported, setSupported] = useState<boolean | null>(null);

	useEffect(() => {
		setSupported(isHtmlInCanvasSupported());
	}, []);

	// Mark the source canvas as a layoutSubtree root once on mount so its
	// child <div ref={sceneRef}> participates in layout/paint and can be
	// captured via drawElementImage().
	useEffect(() => {
		if (!supported) {
			return;
		}

		const sourceCanvas =
			sourceCanvasRef.current as HTMLCanvasWithLayoutSubtree | null;
		if (!sourceCanvas) {
			return;
		}

		sourceCanvas.layoutSubtree = true;
	}, [supported]);

	useEffect(() => {
		if (!supported) {
			return;
		}

		const sourceCanvas =
			sourceCanvasRef.current as HTMLCanvasWithLayoutSubtree | null;
		const sceneEl = sceneRef.current;
		const outputCanvas = outputCanvasRef.current;
		if (!sourceCanvas || !sceneEl || !outputCanvas) {
			return;
		}

		const ctx = sourceCanvas.getContext('2d') as Canvas2DWithDrawElement | null;
		if (!ctx || typeof ctx.drawElementImage !== 'function') {
			return;
		}

		const handle = delayRender(`Painting HTML in canvas (frame ${frame})`);
		let resolved = false;
		let cancelled = false;

		const capture = () => {
			if (cancelled) {
				return;
			}

			try {
				ctx.reset();
				ctx.drawElementImage(sceneEl, 0, 0, width, height);

				applyWaveEffect({
					source: sourceCanvas,
					target: outputCanvas,
					frame,
					width,
					height,
				});

				resolved = true;
				continueRender(handle);
			} catch (err) {
				resolved = true;
				cancelRender(err as Error);
			}
		};

		if (typeof sourceCanvas.requestPaint === 'function') {
			const onPaint = () => {
				sourceCanvas.removeEventListener('paint', onPaint);
				capture();
			};

			sourceCanvas.addEventListener('paint', onPaint);
			sourceCanvas.requestPaint();

			return () => {
				cancelled = true;
				sourceCanvas.removeEventListener('paint', onPaint);
				if (!resolved) {
					continueRender(handle);
				}
			};
		}

		const rafIds: number[] = [];
		rafIds.push(
			requestAnimationFrame(() => {
				rafIds.push(requestAnimationFrame(capture));
			}),
		);

		return () => {
			cancelled = true;
			for (const id of rafIds) {
				cancelAnimationFrame(id);
			}

			if (!resolved) {
				continueRender(handle);
			}
		};
	}, [frame, width, height, supported]);

	if (supported === false) {
		return (
			<AbsoluteFill
				style={{
					backgroundColor: '#111',
					color: 'white',
					alignItems: 'center',
					justifyContent: 'center',
					padding: 80,
					fontFamily:
						'-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
					textAlign: 'center',
				}}
			>
				<div style={{fontSize: 64, fontWeight: 800, marginBottom: 24}}>
					HTML in Canvas not supported
				</div>
				<div
					style={{
						fontSize: 32,
						lineHeight: 1.4,
						maxWidth: 1200,
						opacity: 0.85,
					}}
				>
					This demo uses the experimental{' '}
					<code>CanvasRenderingContext2D.drawElementImage()</code> API
					(WICG/html-in-canvas). Enable{' '}
					<code>chrome://flags/#canvas-draw-element</code> in Chrome (or Chrome
					Canary for full support including <code>canvas.requestPaint()</code>)
					and reload to view it.
				</div>
			</AbsoluteFill>
		);
	}

	const outputOpacity = interpolate(frame, [10, 30], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	return (
		<AbsoluteFill style={{backgroundColor: 'black'}}>
			{/*
			 * The source canvas hosts the scene as an immediate child. Its
			 * `layoutSubtree` property (set imperatively after mount) tells
			 * Chromium to lay out and paint the children. We then capture them
			 * via drawElementImage() and draw the result as the canvas's bitmap.
			 *
			 * Note: drawElementImage() currently requires the element to be an
			 * immediate child of the canvas being drawn onto.
			 */}
			<canvas
				ref={sourceCanvasRef}
				width={width}
				height={height}
				style={{
					position: 'absolute',
					inset: 0,
					width,
					height,
				}}
			>
				<div
					ref={sceneRef}
					style={{
						width,
						height,
					}}
				>
					<Scene />
				</div>
			</canvas>
			<canvas
				ref={outputCanvasRef}
				width={width}
				height={height}
				style={{
					position: 'absolute',
					inset: 0,
					width,
					height,
					opacity: outputOpacity,
				}}
			/>
		</AbsoluteFill>
	);
};
