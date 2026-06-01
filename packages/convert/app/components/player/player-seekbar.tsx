import type MediaFox from '@mediafox/core';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useElementSize} from './use-element-size';

const clamp = (value: number, min: number, max: number) => {
	return Math.min(Math.max(value, min), max);
};

export const getTimeFromX = (
	clientX: number,
	durationInSeconds: number,
	width: number,
) => {
	if (
		width <= 0 ||
		durationInSeconds <= 0 ||
		!Number.isFinite(clientX) ||
		!Number.isFinite(durationInSeconds) ||
		!Number.isFinite(width)
	) {
		return 0;
	}

	const progress = clamp(clientX / width, 0, 1);

	return durationInSeconds * progress;
};

export const getSeekBarProgress = (
	currentTime: number,
	durationInSeconds: number,
) => {
	if (
		currentTime <= 0 ||
		durationInSeconds <= 0 ||
		!Number.isFinite(currentTime) ||
		!Number.isFinite(durationInSeconds)
	) {
		return 0;
	}

	return clamp(currentTime / durationInSeconds, 0, 1);
};

const BAR_HEIGHT = 5;
const KNOB_SIZE = 12;
const VERTICAL_PADDING = 4;

const containerStyle: React.CSSProperties = {
	userSelect: 'none',
	WebkitUserSelect: 'none',
	paddingTop: VERTICAL_PADDING,
	paddingBottom: VERTICAL_PADDING,
	boxSizing: 'border-box',
	cursor: 'pointer',
	position: 'relative',
	touchAction: 'none',
	flex: 1,
};

const barBackground: React.CSSProperties = {
	height: BAR_HEIGHT,
	backgroundColor: 'rgba(0, 0, 0, 0.25)',
	width: '100%',
	borderRadius: BAR_HEIGHT / 2,
};

const findBodyInWhichDivIsLocated = (div: HTMLElement) => {
	let current = div;

	while (current.parentElement) {
		current = current.parentElement;
	}

	return current;
};

export const useHoverState = (
	ref: React.RefObject<HTMLDivElement | null>,
	hideControlsWhenPointerDoesntMove: boolean | number,
) => {
	const [hovered, setHovered] = useState(false);

	useEffect(() => {
		const {current} = ref;
		if (!current) {
			return;
		}

		let hoverTimeout: Timer;
		const addHoverTimeout = () => {
			if (hideControlsWhenPointerDoesntMove) {
				clearTimeout(hoverTimeout);
				hoverTimeout = setTimeout(
					() => {
						setHovered(false);
					},
					hideControlsWhenPointerDoesntMove === true
						? 3000
						: hideControlsWhenPointerDoesntMove,
				);
			}
		};

		const onHover = () => {
			setHovered(true);
			addHoverTimeout();
		};

		const onLeave = () => {
			setHovered(false);
			clearTimeout(hoverTimeout);
		};

		const onMove = () => {
			setHovered(true);
			addHoverTimeout();
		};

		current.addEventListener('mouseenter', onHover);
		current.addEventListener('mouseleave', onLeave);
		current.addEventListener('mousemove', onMove);

		return () => {
			current.removeEventListener('mouseenter', onHover);
			current.removeEventListener('mouseleave', onLeave);
			current.removeEventListener('mousemove', onMove);
			clearTimeout(hoverTimeout);
		};
	}, [hideControlsWhenPointerDoesntMove, ref]);
	return hovered;
};

export const PlayerSeekBar: React.FC<{
	readonly playerRef: MediaFox;
}> = ({playerRef}) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const barHovered = useHoverState(containerRef, false);
	const size = useElementSize(containerRef);
	const [playing, setPlaying] = useState(false);

	const [frame, setFrame] = useState(0);

	useEffect(() => {
		const onFrameUpdate = () => {
			setFrame(playerRef.currentTime);
		};

		playerRef.on('timeupdate', onFrameUpdate);

		return () => {
			playerRef.off('timeupdate', onFrameUpdate);
		};
	}, [playerRef]);

	useEffect(() => {
		const onPlay = () => {
			setPlaying(true);
		};

		const onPause = () => {
			setPlaying(false);
		};

		playerRef.on('play', onPlay);
		playerRef.on('pause', onPause);

		return () => {
			playerRef.off('play', onPlay);
			playerRef.off('pause', onPause);
		};
	}, [playerRef]);

	const [dragging, setDragging] = useState<
		| {
				dragging: false;
		  }
		| {
				dragging: true;
				wasPlaying: boolean;
		  }
	>({
		dragging: false,
	});

	const width = size?.width ?? 0;

	const onPointerDown = useCallback(
		(e: React.PointerEvent<HTMLDivElement>) => {
			if (e.button !== 0) {
				return;
			}

			const posLeft = containerRef.current?.getBoundingClientRect()
				.left as number;

			const _frame = getTimeFromX(
				e.clientX - posLeft,
				playerRef.duration,
				width,
			);
			playerRef.pause();
			playerRef.currentTime = _frame;
			setDragging({
				dragging: true,
				wasPlaying: playing,
			});
		},
		[playerRef, playing, width],
	);

	const onPointerMove = useCallback(
		(e: PointerEvent) => {
			if (!size) {
				throw new Error('Player has no size');
			}

			if (!dragging.dragging) {
				return;
			}

			const posLeft = containerRef.current?.getBoundingClientRect()
				.left as number;

			const _frame = getTimeFromX(
				e.clientX - posLeft,
				playerRef.duration,
				size.width,
			);
			playerRef.currentTime = _frame;
		},
		[dragging.dragging, playerRef, size],
	);

	const onPointerUp = useCallback(() => {
		setDragging({
			dragging: false,
		});
		if (!dragging.dragging) {
			return;
		}

		if (dragging.wasPlaying) {
			playerRef.play();
		} else {
			playerRef.pause();
		}
	}, [dragging, playerRef]);

	useEffect(() => {
		if (!dragging.dragging) {
			return;
		}

		const body = findBodyInWhichDivIsLocated(
			containerRef.current as HTMLElement,
		);

		body.addEventListener('pointermove', onPointerMove);
		body.addEventListener('pointerup', onPointerUp);
		return () => {
			body.removeEventListener('pointermove', onPointerMove);
			body.removeEventListener('pointerup', onPointerUp);
		};
	}, [dragging.dragging, onPointerMove, onPointerUp]);

	const knobStyle: React.CSSProperties = useMemo(() => {
		const progress = getSeekBarProgress(frame, playerRef.duration);

		return {
			height: KNOB_SIZE,
			width: KNOB_SIZE,
			borderRadius: KNOB_SIZE / 2,
			position: 'absolute',
			backgroundColor: 'white',
			top: VERTICAL_PADDING - KNOB_SIZE / 2 + 5 / 2,
			left: Math.max(0, progress * width - KNOB_SIZE / 2),
			outline: '2px solid #000',
			opacity: Number(barHovered),
			transition: 'opacity 0.2s ease',
		};
	}, [barHovered, frame, playerRef.duration, width]);

	const fillStyle: React.CSSProperties = useMemo(() => {
		const progress = getSeekBarProgress(frame, playerRef.duration);

		return {
			height: BAR_HEIGHT,
			backgroundColor: 'black',
			width: `${progress * 100}%`,
			borderRadius: BAR_HEIGHT / 2,
		};
	}, [frame, playerRef.duration]);

	const active: React.CSSProperties = useMemo(() => {
		return {
			height: BAR_HEIGHT,
			backgroundColor: 'black',
			opacity: 0.2,
			width: '100%',
			borderRadius: BAR_HEIGHT / 2,
			position: 'absolute',
		};
	}, []);

	return (
		<div
			ref={containerRef}
			onPointerDown={onPointerDown}
			style={containerStyle}
		>
			<div style={barBackground}>
				<div style={active} />
				<div style={fillStyle} />
			</div>
			<div style={knobStyle} />
		</div>
	);
};
