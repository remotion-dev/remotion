import {Button} from '@remotion/design';
import {renderFrameStripToCanvas} from '@remotion/timeline-utils';
import {Minus, Plus} from 'lucide-react';
import {useCallback, useEffect, useRef, useState} from 'react';
import {useIsNarrow} from '~/lib/is-narrow';
import {useElementSize} from './use-element-size';

const FILMSTRIP_HEIGHT = 48;
const DESKTOP_HANDLE_WIDTH = 14;
const MOBILE_HANDLE_WIDTH = 20;
const INITIAL_REPEAT_DELAY = 350;
const REPEAT_INTERVAL = 80;

const clamp = (value: number, min: number, max: number) => {
	return Math.min(Math.max(value, min), max);
};

const formatTimestamp = (seconds: number) => {
	const clamped = Math.max(0, seconds);
	const hours = Math.floor(clamped / 3600);
	const minutes = Math.floor((clamped % 3600) / 60);
	const secondsLeft = clamped % 60;
	const formattedSeconds = secondsLeft.toFixed(3).padStart(6, '0');

	if (hours > 0) {
		return `${hours}:${String(minutes).padStart(2, '0')}:${formattedSeconds}`;
	}

	return `${minutes}:${formattedSeconds}`;
};

const getFrameFromPointer = ({
	clientX,
	durationInFrames,
	element,
	handleWidth,
}: {
	clientX: number;
	durationInFrames: number;
	element: HTMLDivElement;
	handleWidth: number;
}) => {
	const rect = element.getBoundingClientRect();
	const originRailWidth = Math.max(1, rect.width - handleWidth * 2);
	const progress = clamp(
		(clientX - rect.left - handleWidth) / originRailWidth,
		0,
		1,
	);

	return Math.round(progress * (durationInFrames - 1));
};

const getOriginX = ({
	durationInFrames,
	frame,
	handleWidth,
	width,
}: {
	durationInFrames: number;
	frame: number;
	handleWidth: number;
	width: number;
}) => {
	const progress = frame / (durationInFrames - 1);
	const originRailWidth = Math.max(1, width - handleWidth * 2);

	return handleWidth + progress * originRailWidth;
};

const FrameStepButton: React.FC<{
	readonly 'aria-label': string;
	readonly disabled: boolean;
	readonly icon: 'minus' | 'plus';
	readonly onStep: () => void;
}> = ({'aria-label': ariaLabel, disabled, icon, onStep}) => {
	const Icon = icon === 'minus' ? Minus : Plus;
	const repeatTimeoutRef = useRef<number | null>(null);
	const repeatIntervalRef = useRef<number | null>(null);
	const suppressClickRef = useRef(false);
	const disabledRef = useRef(disabled);
	const onStepRef = useRef(onStep);

	disabledRef.current = disabled;
	onStepRef.current = onStep;

	const stopRepeating = useCallback(() => {
		if (repeatTimeoutRef.current !== null) {
			window.clearTimeout(repeatTimeoutRef.current);
			repeatTimeoutRef.current = null;
		}

		if (repeatIntervalRef.current !== null) {
			window.clearInterval(repeatIntervalRef.current);
			repeatIntervalRef.current = null;
		}
	}, []);

	useEffect(() => {
		return stopRepeating;
	}, [stopRepeating]);

	const step = useCallback(() => {
		if (disabledRef.current) {
			stopRepeating();
			return;
		}

		onStepRef.current();
	}, [stopRepeating]);

	useEffect(() => {
		if (disabled) {
			stopRepeating();
		}
	}, [disabled, stopRepeating]);

	const endPress = useCallback(() => {
		stopRepeating();
		window.setTimeout(() => {
			suppressClickRef.current = false;
		}, 0);
	}, [stopRepeating]);

	return (
		<Button
			aria-label={ariaLabel}
			className="h-8 w-8 select-none rounded-full px-0 text-xs touch-manipulation lg:h-6 lg:w-6"
			depth={0.5}
			disabled={disabled}
			onContextMenu={(event) => {
				event.preventDefault();
			}}
			onClick={(event) => {
				event.stopPropagation();

				if (suppressClickRef.current) {
					suppressClickRef.current = false;
					event.preventDefault();
					return;
				}

				step();
			}}
			onPointerDown={(event) => {
				if (event.button !== 0 || disabled) {
					return;
				}

				event.preventDefault();
				event.stopPropagation();
				event.currentTarget.setPointerCapture(event.pointerId);
				suppressClickRef.current = true;
				step();

				repeatTimeoutRef.current = window.setTimeout(() => {
					step();
					repeatIntervalRef.current = window.setInterval(step, REPEAT_INTERVAL);
				}, INITIAL_REPEAT_DELAY);
			}}
			onPointerUp={(event) => {
				if (event.currentTarget.hasPointerCapture(event.pointerId)) {
					event.currentTarget.releasePointerCapture(event.pointerId);
				}

				endPress();
			}}
			onPointerCancel={(event) => {
				if (event.currentTarget.hasPointerCapture(event.pointerId)) {
					event.currentTarget.releasePointerCapture(event.pointerId);
				}

				endPress();
			}}
		>
			<Icon aria-hidden className="h-4 w-4 lg:h-3 lg:w-3" strokeWidth={3} />
		</Button>
	);
};

export const Filmstrip: React.FC<{
	readonly src: string;
	readonly durationInSeconds: number;
	readonly durationInFrames: number;
	readonly inFrame: number | null;
	readonly outFrame: number | null;
	readonly onTrim: (
		trim: {
			inFrame: number | null;
			outFrame: number | null;
		},
		seekToFrame: number,
	) => void;
}> = ({
	src,
	durationInSeconds,
	durationInFrames,
	inFrame,
	outFrame,
	onTrim,
}) => {
	const wrapperRef = useRef<HTMLDivElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const dragPointerOffsetRef = useRef(0);
	const size = useElementSize(wrapperRef);
	const isNarrow = useIsNarrow();
	const [dragging, setDragging] = useState<'in' | 'out' | null>(null);
	const currentInFrame = inFrame ?? 0;
	const currentOutFrame = outFrame ?? durationInFrames - 1;
	const minimumFrameDistance = 0;
	const handleWidth = isNarrow ? MOBILE_HANDLE_WIDTH : DESKTOP_HANDLE_WIDTH;

	const setInFrameFromPointer = (clientX: number) => {
		const {current} = wrapperRef;
		if (!current) {
			return;
		}

		const frame = getFrameFromPointer({
			clientX,
			durationInFrames,
			element: current,
			handleWidth,
		});
		const maxInFrame = currentOutFrame - minimumFrameDistance;
		const nextInFrame = clamp(frame, 0, maxInFrame);

		onTrim(
			{inFrame: nextInFrame === 0 ? null : nextInFrame, outFrame},
			nextInFrame,
		);
	};

	const setOutFrameFromPointer = (clientX: number) => {
		const {current} = wrapperRef;
		if (!current) {
			return;
		}

		const frame = getFrameFromPointer({
			clientX,
			durationInFrames,
			element: current,
			handleWidth,
		});
		const minOutFrame = currentInFrame + minimumFrameDistance;
		const nextOutFrame = clamp(frame, minOutFrame, durationInFrames - 1);

		onTrim(
			{
				inFrame,
				outFrame: nextOutFrame === durationInFrames - 1 ? null : nextOutFrame,
			},
			nextOutFrame,
		);
	};

	const setInFrame = (frame: number) => {
		onTrim(
			{
				inFrame: frame === 0 ? null : frame,
				outFrame,
			},
			frame,
		);
	};

	const setOutFrame = (frame: number) => {
		onTrim(
			{
				inFrame,
				outFrame: frame === durationInFrames - 1 ? null : frame,
			},
			frame,
		);
	};

	const moveInFrame = (delta: number) => {
		setInFrame(
			clamp(currentInFrame + delta, 0, currentOutFrame - minimumFrameDistance),
		);
	};

	const moveOutFrame = (delta: number) => {
		setOutFrame(
			clamp(
				currentOutFrame + delta,
				currentInFrame + minimumFrameDistance,
				durationInFrames - 1,
			),
		);
	};

	const clampDragOriginClientX = (
		clientX: number,
		handle: 'in' | 'out',
		element: HTMLDivElement,
	) => {
		const rect = element.getBoundingClientRect();
		const minFrame = handle === 'in' ? 0 : currentInFrame;
		const maxFrame = handle === 'in' ? currentOutFrame : durationInFrames - 1;
		const minClientX =
			rect.left +
			getOriginX({
				durationInFrames,
				frame: minFrame,
				handleWidth,
				width: rect.width,
			});
		const maxClientX =
			rect.left +
			getOriginX({
				durationInFrames,
				frame: maxFrame,
				handleWidth,
				width: rect.width,
			});

		return clamp(clientX, minClientX, maxClientX);
	};

	const setDragPointerOffset = (
		clientX: number,
		handle: 'in' | 'out',
		element: HTMLDivElement,
	) => {
		const rect = element.getBoundingClientRect();
		const frame = handle === 'in' ? currentInFrame : currentOutFrame;
		const trimMarkX =
			rect.left +
			getOriginX({
				durationInFrames,
				frame,
				handleWidth,
				width: rect.width,
			});

		dragPointerOffsetRef.current = clientX - trimMarkX;
	};

	useEffect(() => {
		if (dragging === null) {
			return;
		}

		const onPointerMove = (event: PointerEvent) => {
			const {current} = wrapperRef;
			if (!current) {
				return;
			}

			const clientX = clampDragOriginClientX(
				event.clientX - dragPointerOffsetRef.current,
				dragging,
				current,
			);

			if (dragging === 'in') {
				setInFrameFromPointer(clientX);
			} else {
				setOutFrameFromPointer(clientX);
			}
		};

		const onPointerUp = () => {
			dragPointerOffsetRef.current = 0;
			setDragging(null);
		};

		window.addEventListener('pointermove', onPointerMove);
		window.addEventListener('pointerup', onPointerUp);
		window.addEventListener('pointercancel', onPointerUp);

		return () => {
			window.removeEventListener('pointermove', onPointerMove);
			window.removeEventListener('pointerup', onPointerUp);
			window.removeEventListener('pointercancel', onPointerUp);
		};
	});

	useEffect(() => {
		const canvas = canvasRef.current;
		const canvasWidth = size?.width;
		if (!canvas || !canvasWidth) {
			return;
		}

		const controller = new AbortController();

		renderFrameStripToCanvas({
			canvas,
			src,
			fromSeconds: 0,
			toSeconds: durationInSeconds,
			width: canvasWidth,
			frameHeight: FILMSTRIP_HEIGHT,
			devicePixelRatio: window.devicePixelRatio,
			signal: controller.signal,
		}).catch(() => undefined);

		return () => {
			controller.abort();
		};
	}, [durationInSeconds, size?.width, src]);

	if (
		durationInSeconds <= 0 ||
		!Number.isFinite(durationInSeconds) ||
		durationInFrames <= 1
	) {
		return null;
	}

	const inProgress = currentInFrame / (durationInFrames - 1);
	const outProgress = currentOutFrame / (durationInFrames - 1);
	const startTimestamp = formatTimestamp(
		(currentInFrame / durationInFrames) * durationInSeconds,
	);
	const endTimestamp = formatTimestamp(
		((currentOutFrame + 1) / durationInFrames) * durationInSeconds,
	);
	const stripWidth = size?.width;
	const startOriginX = stripWidth
		? getOriginX({
				durationInFrames,
				frame: currentInFrame,
				handleWidth,
				width: stripWidth,
			})
		: null;
	const endOriginX = stripWidth
		? getOriginX({
				durationInFrames,
				frame: currentOutFrame,
				handleWidth,
				width: stripWidth,
			})
		: null;
	const startHandleLeft =
		startOriginX === null
			? `calc(${inProgress * 100}% - ${inProgress * handleWidth * 2}px)`
			: startOriginX - handleWidth;
	const endHandleLeft =
		endOriginX === null
			? `calc(${outProgress * 100}% + ${handleWidth - outProgress * handleWidth * 2}px)`
			: endOriginX;
	const activeAreaLeft = startHandleLeft;
	const activeAreaWidth =
		startOriginX === null || endOriginX === null
			? `calc(${(outProgress - inProgress) * 100}% + ${
					handleWidth * 2 - (outProgress - inProgress) * handleWidth * 2
				}px)`
			: endOriginX - startOriginX + handleWidth * 2;
	const rightInactiveLeft =
		endOriginX === null
			? `calc(${outProgress * 100}% + ${
					handleWidth * 2 - outProgress * handleWidth * 2
				}px)`
			: endOriginX + handleWidth;
	const rightInactiveWidth =
		stripWidth === undefined || endOriginX === null
			? `calc(${(1 - outProgress) * 100}% - ${
					(1 - outProgress) * handleWidth * 2
				}px)`
			: stripWidth - endOriginX - handleWidth;

	return (
		<div className="mt-2 w-full">
			<div
				ref={wrapperRef}
				className="relative h-12 w-full touch-none overflow-hidden rounded-md border border-zinc-900 bg-black shadow-sm"
				onPointerCancel={() => setDragging(null)}
			>
				<canvas
					ref={canvasRef}
					className="block h-full w-full opacity-95"
					style={{height: FILMSTRIP_HEIGHT}}
				/>
				<div
					className="pointer-events-none absolute top-0 h-full bg-black/45"
					style={{left: 0, width: activeAreaLeft}}
				/>
				<div
					className="pointer-events-none absolute top-0 h-full bg-black/45"
					style={{
						left: rightInactiveLeft,
						width: rightInactiveWidth,
					}}
				/>
				<div
					className="border-brand pointer-events-none absolute top-0 h-full rounded-md border-2"
					style={{
						left: activeAreaLeft,
						width: activeAreaWidth,
					}}
				/>
				<div
					aria-label="Trim start"
					aria-valuemax={currentOutFrame - minimumFrameDistance}
					aria-valuemin={0}
					aria-valuenow={currentInFrame}
					className="bg-brand absolute top-0 h-full cursor-ew-resize overflow-hidden rounded-l-md border-r border-blue-800"
					role="slider"
					style={{
						left: startHandleLeft,
						width: handleWidth,
					}}
					tabIndex={0}
					onContextMenu={() => {
						setDragging(null);
					}}
					onPointerDown={(event) => {
						if (event.button !== 0) {
							setDragging(null);
							return;
						}

						const {current} = wrapperRef;
						if (!current) {
							return;
						}

						event.stopPropagation();
						setDragPointerOffset(event.clientX, 'in', current);
						setDragging('in');
					}}
					onKeyDown={(event) => {
						if (event.key === 'ArrowLeft') {
							event.preventDefault();
							moveInFrame(-1);
						}

						if (event.key === 'ArrowRight') {
							event.preventDefault();
							moveInFrame(1);
						}
					}}
				>
					<div className="pointer-events-none absolute inset-0 flex items-center justify-center gap-[2px]">
						<div className="h-3 w-px rounded-full bg-white/80" />
						<div className="h-3 w-px rounded-full bg-white/80" />
					</div>
				</div>
				<div
					aria-label="Trim end"
					aria-valuemax={durationInFrames - 1}
					aria-valuemin={currentInFrame + minimumFrameDistance}
					aria-valuenow={currentOutFrame}
					className="bg-brand absolute top-0 h-full cursor-ew-resize overflow-hidden rounded-r-md border-l border-blue-800"
					role="slider"
					style={{
						left: endHandleLeft,
						width: handleWidth,
					}}
					tabIndex={0}
					onContextMenu={() => {
						setDragging(null);
					}}
					onPointerDown={(event) => {
						if (event.button !== 0) {
							setDragging(null);
							return;
						}

						const {current} = wrapperRef;
						if (!current) {
							return;
						}

						event.stopPropagation();
						setDragPointerOffset(event.clientX, 'out', current);
						setDragging('out');
					}}
					onKeyDown={(event) => {
						if (event.key === 'ArrowLeft') {
							event.preventDefault();
							moveOutFrame(-1);
						}

						if (event.key === 'ArrowRight') {
							event.preventDefault();
							moveOutFrame(1);
						}
					}}
				>
					<div className="pointer-events-none absolute inset-0 flex items-center justify-center gap-[2px]">
						<div className="h-3 w-px rounded-full bg-white/80" />
						<div className="h-3 w-px rounded-full bg-white/80" />
					</div>
				</div>
			</div>
			<div className="mt-1 flex items-start justify-between font-brand text-xs tabular-nums text-zinc-700">
				<div className="flex flex-col items-start gap-1">
					<span className="min-w-[4.75rem] text-left">{startTimestamp}</span>
					<div className="flex items-center gap-1">
						<FrameStepButton
							aria-label="Move trim start back by 1 frame"
							disabled={currentInFrame === 0}
							icon="minus"
							onStep={() => moveInFrame(-1)}
						/>
						<FrameStepButton
							aria-label="Move trim start forward by 1 frame"
							disabled={
								currentInFrame >= currentOutFrame - minimumFrameDistance
							}
							icon="plus"
							onStep={() => moveInFrame(1)}
						/>
					</div>
				</div>
				<div className="flex flex-col items-end gap-1">
					<span className="min-w-[4.75rem] text-right">{endTimestamp}</span>
					<div className="flex items-center gap-1">
						<FrameStepButton
							aria-label="Move trim end back by 1 frame"
							disabled={
								currentOutFrame <= currentInFrame + minimumFrameDistance
							}
							icon="minus"
							onStep={() => moveOutFrame(-1)}
						/>
						<FrameStepButton
							aria-label="Move trim end forward by 1 frame"
							disabled={currentOutFrame === durationInFrames - 1}
							icon="plus"
							onStep={() => moveOutFrame(1)}
						/>
					</div>
				</div>
			</div>
		</div>
	);
};
