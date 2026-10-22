import {PlayerInternals} from '@remotion/player';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
	BACKGROUND,
	CURRENT_COLOR,
	LIGHT_TEXT,
	TRANSPARENT,
	WHITE,
} from '../helpers/colors';
import {applyCubeLut, parseCubeLut} from '../helpers/cube-lut';
import {
	FOCUS_VISIBLE_ONLY_CLASS_NAME,
	HOVERABLE_CLASS_NAME,
	hoverableStyle,
} from '../helpers/hoverable';
import {useZIndex} from '../state/z-index';

const sampleImage = 'https://remotion.media/transition-bg-blue.jpg';
const previewWidth = 640;
const previewHeight = 427;

const container: React.CSSProperties = {
	padding: 24,
	flex: 1,
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	fontFamily: 'sans-serif',
	fontSize: 13,
	minHeight: 0,
};

const comparison: React.CSSProperties = {
	position: 'relative',
	flexShrink: 0,
	userSelect: 'none',
	WebkitUserSelect: 'none',
};

const canvasStyle: React.CSSProperties = {
	display: 'block',
	width: '100%',
	height: 'auto',
	borderRadius: 4,
	userSelect: 'none',
	WebkitUserSelect: 'none',
};

const sliderStyle: React.CSSProperties = {
	...hoverableStyle({
		idleBackground: TRANSPARENT,
		hoverBackground: TRANSPARENT,
		idleColor: LIGHT_TEXT,
		hoverColor: WHITE,
	}),
	position: 'absolute',
	inset: 0,
	borderRadius: 4,
	cursor: 'default',
	touchAction: 'none',
	userSelect: 'none',
	WebkitUserSelect: 'none',
};

const dividerStyle: React.CSSProperties = {
	position: 'absolute',
	top: 0,
	bottom: 0,
	width: 2,
	backgroundColor: CURRENT_COLOR,
	transform: 'translateX(-50%)',
	pointerEvents: 'none',
};

const handleStyle: React.CSSProperties = {
	position: 'absolute',
	top: '50%',
	left: '50%',
	transform: 'translate(-50%, -50%)',
	width: 32,
	height: 32,
	borderRadius: '50%',
	border: `2px solid ${CURRENT_COLOR}`,
	backgroundColor: BACKGROUND,
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
};

const message: React.CSSProperties = {
	color: LIGHT_TEXT,
	textAlign: 'center',
	overflowWrap: 'anywhere',
};

type PreviewState =
	| {readonly type: 'loading'}
	| {readonly type: 'error'; readonly error: string}
	| {readonly type: 'loaded'};

export const LutPreview: React.FC<{readonly src: string}> = ({src}) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const beforeRef = useRef<HTMLCanvasElement>(null);
	const afterRef = useRef<HTMLCanvasElement>(null);
	const [state, setState] = useState<PreviewState>({type: 'loading'});
	const [position, setPosition] = useState(50);
	const {tabIndex} = useZIndex();
	const size = PlayerInternals.useElementSize(containerRef, {
		triggerOnWindowResize: true,
		shouldApplyCssTransforms: true,
	});

	const updatePosition = useCallback(
		(event: React.PointerEvent<HTMLDivElement>) => {
			const rect = event.currentTarget.getBoundingClientRect();
			setPosition(
				Math.max(
					0,
					Math.min(100, ((event.clientX - rect.left) / rect.width) * 100),
				),
			);
		},
		[],
	);

	const onPointerDown = useCallback(
		(event: React.PointerEvent<HTMLDivElement>) => {
			if (event.button !== 0 || !event.isPrimary) {
				return;
			}

			event.currentTarget.setPointerCapture(event.pointerId);
			updatePosition(event);
		},
		[updatePosition],
	);

	const onPointerMove = useCallback(
		(event: React.PointerEvent<HTMLDivElement>) => {
			if (event.currentTarget.hasPointerCapture(event.pointerId)) {
				updatePosition(event);
			}
		},
		[updatePosition],
	);

	const onKeyDown = useCallback(
		(event: React.KeyboardEvent<HTMLDivElement>) => {
			const step = event.shiftKey ? 10 : 1;
			if (event.key === 'Home') {
				setPosition(0);
			} else if (event.key === 'End') {
				setPosition(100);
			} else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
				setPosition((value) => Math.max(0, value - step));
			} else if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
				setPosition((value) => Math.min(100, value + step));
			} else {
				return;
			}

			event.preventDefault();
			event.stopPropagation();
		},
		[],
	);

	useEffect(() => {
		const controller = new AbortController();
		const image = new Image();
		image.crossOrigin = 'anonymous';
		setState({type: 'loading'});

		const load = async () => {
			const response = await fetch(src, {signal: controller.signal});
			if (!response.ok) {
				throw new Error(`Could not load LUT (HTTP ${response.status}).`);
			}

			const lut = parseCubeLut(await response.text());
			if (controller.signal.aborted) {
				return;
			}

			image.src = sampleImage;
			try {
				await image.decode();
			} catch {
				throw new Error(
					'Could not load the LUT sample image. Check your internet connection.',
				);
			}

			if (controller.signal.aborted) {
				return;
			}

			const before = beforeRef.current?.getContext('2d');
			const after = afterRef.current?.getContext('2d');
			if (!before || !after) {
				throw new Error('Could not create the LUT preview canvas.');
			}

			before.drawImage(image, 0, 0, previewWidth, previewHeight);
			const pixels = before.getImageData(0, 0, previewWidth, previewHeight);
			applyCubeLut(pixels.data, lut);
			after.putImageData(pixels, 0, 0);
			setState({type: 'loaded'});
		};

		load().catch((error: unknown) => {
			if (!controller.signal.aborted) {
				setState({
					type: 'error',
					error: error instanceof Error ? error.message : String(error),
				});
			}
		});

		return () => {
			controller.abort();
			image.removeAttribute('src');
		};
	}, [src]);

	return (
		<div ref={containerRef} style={container}>
			{state.type === 'error' ? (
				<div style={message} role="alert">
					Could not preview LUT: {state.error}
				</div>
			) : state.type === 'loading' ? (
				<div style={message} role="status">
					Loading LUT preview...
				</div>
			) : null}
			<div
				style={{
					...comparison,
					width: size
						? Math.max(
								0,
								Math.min(
									960,
									size.width - 48,
									((size.height - 48) * previewWidth) / previewHeight,
								),
							)
						: 0,
					display: state.type === 'loaded' ? 'block' : 'none',
				}}
			>
				<canvas
					ref={afterRef}
					width={previewWidth}
					height={previewHeight}
					style={canvasStyle}
					role="img"
					aria-label="Sample image after LUT"
				/>
				<div
					style={{
						position: 'absolute',
						inset: 0,
						clipPath: `inset(0 ${100 - position}% 0 0)`,
					}}
				>
					<canvas
						ref={beforeRef}
						width={previewWidth}
						height={previewHeight}
						style={canvasStyle}
						role="img"
						aria-label="Sample image before LUT"
					/>
				</div>
				<div
					role="slider"
					aria-label="Before and after comparison"
					aria-valuemin={0}
					aria-valuemax={100}
					aria-valuenow={Math.round(position)}
					aria-valuetext={`${Math.round(position)}% before, ${100 - Math.round(position)}% after`}
					tabIndex={tabIndex}
					className={`${HOVERABLE_CLASS_NAME} ${FOCUS_VISIBLE_ONLY_CLASS_NAME}`}
					style={sliderStyle}
					onPointerDown={onPointerDown}
					onPointerMove={onPointerMove}
					onKeyDown={onKeyDown}
				>
					<div aria-hidden style={{...dividerStyle, left: `${position}%`}}>
						<div style={handleStyle}>
							<svg width={20} height={20} viewBox="0 0 24 24" fill="none">
								<path
									d="M8 8 4 12l4 4M16 8l4 4-4 4"
									stroke={CURRENT_COLOR}
									strokeWidth={2}
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
							</svg>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
