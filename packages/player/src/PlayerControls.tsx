import {useCallback, useEffect, useRef, useState} from 'react';
import {Internals, interpolate} from 'remotion';
import {formatTime} from './format-time';
import {usePlaybackTime} from './PlayPause';
import {useElementSize} from './use-element-size';

const getFrameFromX = (
	clientX: number,
	durationInFrames: number,
	width: number
) => {
	const pos = clientX;
	const frame = Math.round(
		interpolate(pos, [0, width], [0, durationInFrames - 1 ?? 0], {
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp',
		})
	);
	return frame;
};

export const Controls: React.FC<{
	fps: number;
	durationInFrames: number;
}> = ({durationInFrames, fps}) => {
	const sliderAreaRef = useRef<HTMLDivElement>(null);
	const size = useElementSize(sliderAreaRef);

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

	const {toggle} = usePlaybackTime();
	const [playing, setPlaying] = Internals.Timeline.usePlayingState();
	const frame = Internals.Timeline.useTimelinePosition();
	const setTimelinePosition = Internals.Timeline.useTimelineSetFrame();

	const onPointerDown = useCallback(
		(e: React.PointerEvent<HTMLDivElement>) => {
			if (!size) {
				throw new Error('Player has no size');
			}
			const _frame = getFrameFromX(
				e.clientX - size.left,
				durationInFrames,
				size.width
			);
			setTimelinePosition(_frame);
			setDragging({
				dragging: true,
				wasPlaying: playing,
			});
			setPlaying(false);
		},
		[durationInFrames, playing, setPlaying, setTimelinePosition, size]
	);

	const onPointerMove = useCallback(
		(e: PointerEvent) => {
			if (!size) {
				throw new Error('Player has no size');
			}
			if (!dragging.dragging) {
				return;
			}
			const _frame = getFrameFromX(
				e.clientX - (size?.left ?? 0),
				durationInFrames,
				size.width
			);
			setTimelinePosition(_frame);
		},
		[dragging.dragging, durationInFrames, setTimelinePosition, size]
	);

	const onPointerUp = useCallback(() => {
		setDragging({
			dragging: false,
		});
		if (!dragging.dragging) {
			return;
		}
		setPlaying(dragging.wasPlaying);
	}, [dragging, setPlaying]);

	useEffect(() => {
		if (!dragging.dragging) {
			return;
		}
		window.addEventListener('pointermove', onPointerMove);
		window.addEventListener('pointerup', onPointerUp);
		return () => {
			window.removeEventListener('pointermove', onPointerMove);
			window.removeEventListener('pointerup', onPointerUp);
		};
	}, [dragging.dragging, onPointerMove, onPointerUp]);

	return (
		<div
			style={{
				boxSizing: 'border-box',
				position: 'absolute',
				bottom: 0,
				width: '100%',
				paddingTop: 40,
				paddingBottom: 10,
				background: 'linear-gradient(transparent, rgba(0, 0, 0, 0.4))',
				display: 'flex',
				paddingRight: 12,
				paddingLeft: 12,
				flexDirection: 'column',
			}}
		>
			<div
				style={{
					display: 'flex',
					flexDirection: 'row',
					width: '100%',
					alignItems: 'center',
					userSelect: 'none',
				}}
			>
				<button type="button" onClick={toggle}>
					{playing ? 'pause' : 'play'}
				</button>
				<div style={{width: 10}} />
				<div
					style={{
						color: 'white',
						fontFamily: 'sans-serif',
						fontSize: 14,
					}}
				>
					{formatTime(frame / fps)} / {formatTime(durationInFrames / fps)}
				</div>
				<div style={{flex: 1}} />
			</div>
			<div style={{height: 8}} />
			<div
				ref={sliderAreaRef}
				onPointerDown={onPointerDown}
				onPointerUp={onPointerUp}
				style={{
					userSelect: 'none',
					paddingTop: 4,
					paddingBottom: 4,
					cursor: 'pointer',
					position: 'relative',
				}}
			>
				<div
					style={{
						height: 5,
						backgroundColor: 'rgba(255, 255, 255, 0.5)',
						width: '100%',
						borderRadius: 3,
					}}
				>
					<div
						style={{
							height: 5,
							backgroundColor: 'rgba(255, 255, 255, 1)',
							width: (frame / durationInFrames) * 100 + '%',
							borderRadius: 3,
						}}
					/>
				</div>
				<div
					style={{
						height: 12,
						width: 12,
						borderRadius: 6,
						position: 'absolute',
						top: 4 - 12 / 2 + 5 / 2,
						backgroundColor: 'white',
						left: (frame / durationInFrames) * ((size?.width ?? 0) - 12),

						boxShadow: '0 0 2px black',
					}}
				/>
			</div>
		</div>
	);
};
