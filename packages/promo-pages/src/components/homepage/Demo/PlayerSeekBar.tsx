import type {PlayerRef} from '@remotion/player';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {interpolate} from 'remotion';
import {useElementSize} from '../layout/use-el-size';

const getFrameFromX = (
	clientX: number,
	durationInFrames: number,
	width: number,
) => {
	const pos = clientX;
	const frame = Math.round(
		interpolate(pos, [0, width], [0, durationInFrames - 1], {
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp',
		}),
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
	readonly durationInFrames: number;
	readonly onSeekStart: () => void;
	readonly onSeekEnd: () => void;
	readonly inFrame: number | null;
	readonly outFrame: number | null;
	readonly playerRef: React.RefObject<PlayerRef | null>;
}> = ({
	durationInFrames,
	onSeekEnd,
	onSeekStart,
	inFrame,
	outFrame,
	playerRef,
}) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const barHovered = useHoverState(containerRef, false);
	const size = useElementSize(containerRef.current);
	const [playing, setPlaying] = useState(false);

	const [frame, setFrame] = useState(0);

	useEffect(() => {
		const {current} = playerRef;
		if (!current) {
			return;
		}

		const onFrameUpdate = () => {
			setFrame(playerRef.current!.getCurrentFrame());
		};

		current.addEventListener('frameupdate', onFrameUpdate);

		return () => {
			current.removeEventListener('frameupdate', onFrameUpdate);
		};
	}, [playerRef]);

	useEffect(() => {
		const {current} = playerRef;
		if (!current) {
			return;
		}

		const onPlay = () => {
			setPlaying(true);
		};

		const onPause = () => {
			setPlaying(false);
		};

		current.addEventListener('play', onPlay);
		current.addEventListener('pause', onPause);

		return () => {
			current.removeEventListener('play', onPlay);
			current.removeEventListener('pause', onPause);
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

			const _frame = getFrameFromX(
				e.clientX - posLeft,
				durationInFrames,
				width,
			);
			playerRef.current!.pause();
			playerRef.current!.seekTo(_frame);
			setDragging({
				dragging: true,
				wasPlaying: playing,
			});
			onSeekStart();
		},
		[durationInFrames, width, playerRef, playing, onSeekStart],
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

			const _frame = getFrameFromX(
				e.clientX - posLeft,
				durationInFrames,
				size.width,
			);
			playerRef.current!.seekTo(_frame);
		},
		[dragging.dragging, durationInFrames, playerRef, size],
	);

	const onPointerUp = useCallback(() => {
		setDragging({
			dragging: false,
		});
		if (!dragging.dragging) {
			return;
		}

		if (dragging.wasPlaying) {
			playerRef.current!.play();
		} else {
			playerRef.current!.pause();
		}

		onSeekEnd();
	}, [dragging, onSeekEnd, playerRef]);

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
			backgroundColor: 'var(--ifm-font-color-base)',
			left: Math.max(
				0,
				(frame / Math.max(1, durationInFrames - 1)) * width - KNOB_SIZE / 2,
			),
			outline: '2px solid var(--ifm-background-color)',
			opacity: Number(barHovered),
			transition: 'opacity 0.s ease',
		};
	}, [barHovered, durationInFrames, frame, width]);

	const fillStyle: React.CSSProperties = useMemo(() => {
		return {
			height: BAR_HEIGHT,
			backgroundColor: 'var(--ifm-font-color-base)',
			width: ((frame - (inFrame ?? 0)) / (durationInFrames - 1)) * 100 + '%',
			marginLeft: ((inFrame ?? 0) / (durationInFrames - 1)) * 100 + '%',
			borderRadius: BAR_HEIGHT / 2,
		};
	}, [durationInFrames, frame, inFrame]);

	const active: React.CSSProperties = useMemo(() => {
		return {
			height: BAR_HEIGHT,
			backgroundColor: 'var(--ifm-font-color-base)',
			opacity: 0.2,
			width:
				(((outFrame ?? durationInFrames - 1) - (inFrame ?? 0)) /
					(durationInFrames - 1)) *
					100 +
				'%',
			marginLeft: ((inFrame ?? 0) / (durationInFrames - 1)) * 100 + '%',
			borderRadius: BAR_HEIGHT / 2,
			position: 'absolute',
		};
	}, [durationInFrames, inFrame, outFrame]);

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
