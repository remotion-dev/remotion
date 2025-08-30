import {WEBCODECS_TIMESCALE} from '@remotion/media-parser';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import type {Player} from '../play-media';
import {useElementSize} from './use-element-size';

const getFrameFromX = ({
	clientX,
	durationInSeconds,
	width,
}: {
	clientX: number;
	durationInSeconds: number;
	width: number;
}) => {
	const frame = Math.max(
		0,
		Math.min(durationInSeconds, (clientX / width) * durationInSeconds),
	);
	return frame;
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
	marginLeft: 14,
	marginRight: 14,
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
	readonly durationInSeconds: number;
	readonly playerRef: Player;
}> = ({durationInSeconds, playerRef}) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const barHovered = useHoverState(containerRef, false);
	const size = useElementSize(containerRef.current);
	const [playing, setPlaying] = useState(false);

	const [frame, setFrame] = useState(0);

	useEffect(() => {
		const onFrameUpdate = () => {
			setFrame(playerRef.getCurrentTime() / WEBCODECS_TIMESCALE);
		};

		playerRef.addEventListener('timeupdate', onFrameUpdate);

		return () => {
			playerRef.removeEventListener('timeupdate', onFrameUpdate);
		};
	}, [playerRef]);

	useEffect(() => {
		const onPlay = () => {
			setPlaying(true);
		};

		const onPause = () => {
			setPlaying(false);
		};

		playerRef.addEventListener('play', onPlay);
		playerRef.addEventListener('pause', onPause);

		return () => {
			playerRef.removeEventListener('play', onPlay);
			playerRef.removeEventListener('pause', onPause);
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

			const _frame = getFrameFromX({
				clientX: e.clientX - posLeft,
				durationInSeconds,
				width,
			});
			playerRef.pause();
			playerRef.seek(_frame);
			setDragging({
				dragging: true,
				wasPlaying: playing,
			});
		},
		[durationInSeconds, width, playerRef, playing],
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

			const _frame = getFrameFromX({
				clientX: e.clientX - posLeft,
				durationInSeconds,
				width: size.width,
			});

			playerRef.seek(_frame);
		},
		[dragging.dragging, durationInSeconds, playerRef, size],
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
		return {
			height: KNOB_SIZE,
			width: KNOB_SIZE,
			borderRadius: KNOB_SIZE / 2,
			position: 'absolute',
			top: VERTICAL_PADDING - KNOB_SIZE / 2 + 5 / 2,
			backgroundColor: 'black',
			left: Math.max(
				0,
				(frame / Math.max(1, durationInSeconds)) * width - KNOB_SIZE / 2,
			),
			outline: '2px solid var(--ifm-background-color)',
			opacity: Number(barHovered),
			transition: 'opacity 0.s ease',
		};
	}, [barHovered, durationInSeconds, frame, width]);

	const fillStyle: React.CSSProperties = useMemo(() => {
		return {
			height: BAR_HEIGHT,
			backgroundColor: 'black',
			width: (frame / durationInSeconds) * 100 + '%',
			borderRadius: BAR_HEIGHT / 2,
		};
	}, [durationInSeconds, frame]);

	const active: React.CSSProperties = useMemo(() => {
		return {
			height: BAR_HEIGHT,
			backgroundColor: 'black',
			opacity: 0.2,
			width: 100 + '%',
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
