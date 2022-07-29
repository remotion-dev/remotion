import {PlayerInternals} from '@remotion/player';
import React, {
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import {Internals} from 'remotion';
import {useGetXPositionOfItemInTimeline} from '../../helpers/get-left-of-timeline-slider';
import {TIMELINE_PADDING} from '../../helpers/timeline-layout';
import {
	useTimelineInOutFramePosition,
	useTimelineSetInOutFramePosition,
} from '../../state/in-out';
import {TimelineZoomCtx} from '../../state/timeline-zoom';
import {persistCurrentFrame} from '../FramePersistor';
import {scrollableRef, sliderAreaRef} from './timeline-refs';
import {
	canScrollTimelineIntoDirection,
	getFrameFromX,
	getFrameWhileScrollingLeft,
	getFrameWhileScrollingRight,
} from './timeline-scroll-logic';
import {inMarkerAreaRef, outMarkerAreaRef} from './TimelineInOutPointer';
import {
	inPointerHandle,
	outPointerHandle,
	TimelineInOutPointerHandle,
} from './TimelineInOutPointerHandle';
import {redrawTimelineSliderFast} from './TimelineSlider';

const inner: React.CSSProperties = {
	overflowY: 'auto',
	overflowX: 'hidden',
};

const container: React.CSSProperties = {
	userSelect: 'none',
	position: 'absolute',
	height: '100%',
	top: 0,
};

const getClientXWithScroll = (x: number) => {
	return x + (scrollableRef.current?.scrollLeft as number);
};

export const TimelineDragHandler: React.FC = () => {
	const size = PlayerInternals.useElementSize(scrollableRef, {
		triggerOnWindowResize: true,
		shouldApplyCssTransforms: true,
	});
	const [inOutDragging, setInOutDragging] = useState<
		| {
				dragging: false;
		  }
		| {
				dragging: 'in' | 'out';
				initialOffset: number;
				boundaries: [number, number];
		  }
	>({
		dragging: false,
	});
	const width = scrollableRef.current?.scrollWidth ?? 0;
	const left = size?.left ?? 0;

	const {inFrame, outFrame} = useTimelineInOutFramePosition();

	const {setInAndOutFrames} = useTimelineSetInOutFramePosition();

	const {get} = useGetXPositionOfItemInTimeline();
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
	const {playing, play, pause, seek} = PlayerInternals.usePlayer();
	const videoConfig = Internals.useUnsafeVideoConfig();

	const frameIncrement =
		((width as number) - TIMELINE_PADDING * 2) /
		((videoConfig?.durationInFrames as number) - 1);

	const scroller = useRef<NodeJS.Timeout | null>(null);

	const stopInterval = () => {
		if (scroller.current) {
			clearInterval(scroller.current);
			scroller.current = null;
		}
	};

	const onPointerDown = useCallback(
		(e: React.PointerEvent<HTMLDivElement>) => {
			stopInterval();
			if (!videoConfig) {
				return;
			}

			if ((e.target as Node) === inPointerHandle.current) {
				if (inFrame === null) {
					throw new Error('expected outframe');
				}

				const inMarker = get(inFrame);
				const outMarker = outFrame === null ? Infinity : get(outFrame - 1);
				setInOutDragging({
					dragging: 'in',
					initialOffset: getClientXWithScroll(e.clientX),
					boundaries: [-Infinity, outMarker - inMarker],
				});
				return;
			}

			if ((e.target as Node) === outPointerHandle.current) {
				if (outFrame === null) {
					throw new Error('expected outframe');
				}

				const outMarker = get(outFrame);
				const inMarker = inFrame === null ? -Infinity : get(inFrame + 1);
				setInOutDragging({
					dragging: 'out',
					initialOffset: getClientXWithScroll(e.clientX),
					boundaries: [inMarker - outMarker, Infinity],
				});

				return;
			}

			const frame = getFrameFromX(
				getClientXWithScroll(e.clientX) - left,
				videoConfig.durationInFrames,
				width,
				'clamp'
			);
			seek(frame);
			setDragging({
				dragging: true,
				wasPlaying: playing,
			});
			pause();
		},
		[videoConfig, left, width, seek, playing, pause, outFrame, get, inFrame]
	);

	const onPointerMoveScrubbing = useCallback(
		(e: PointerEvent) => {
			if (!videoConfig) {
				return;
			}

			if (!dragging.dragging) {
				return;
			}

			const isRightOfArea =
				e.clientX > (scrollableRef.current?.clientWidth as number) + left;

			const isLeftOfArea = e.clientX < left;

			const frame = getFrameFromX(
				getClientXWithScroll(e.clientX) - left,
				videoConfig.durationInFrames,
				width,
				'clamp'
			);
			const current = scrollableRef.current as HTMLDivElement;

			if (isLeftOfArea && canScrollTimelineIntoDirection().canScrollLeft) {
				if (scroller.current) {
					return;
				}

				const scrollEvery = () => {
					if (!canScrollTimelineIntoDirection().canScrollLeft) {
						stopInterval();
						return;
					}

					const nextFrame = getFrameWhileScrollingLeft(
						videoConfig.durationInFrames,
						width
					);

					const scrollPos = frameIncrement * nextFrame;

					redrawTimelineSliderFast.current?.draw(nextFrame);
					seek(nextFrame);
					current.scroll({
						left: scrollPos,
					});
				};

				scrollEvery();
				scroller.current = setInterval(() => {
					scrollEvery();
				}, 100);
			} else if (
				isRightOfArea &&
				canScrollTimelineIntoDirection().canScrollRight
			) {
				if (scroller.current) {
					return;
				}

				const scrollEvery = () => {
					if (!canScrollTimelineIntoDirection().canScrollRight) {
						stopInterval();
						return;
					}

					const nextFrame = getFrameWhileScrollingRight({
						durationInFrames: videoConfig.durationInFrames,
						width,
						frameIncrement,
					});

					const framesRemaining = videoConfig.durationInFrames - 1 - nextFrame;

					const fromRight = framesRemaining * frameIncrement + TIMELINE_PADDING;

					const scrollPos =
						(scrollableRef.current?.scrollWidth as number) -
						fromRight -
						(scrollableRef.current?.clientWidth as number) +
						TIMELINE_PADDING +
						4; // clearfix;

					redrawTimelineSliderFast.current?.draw(nextFrame);
					seek(nextFrame);

					current.scroll({
						left: scrollPos,
					});
				};

				scrollEvery();

				scroller.current = setInterval(() => {
					scrollEvery();
				}, 100);
			} else {
				stopInterval();
				seek(frame);
			}
		},
		[videoConfig, dragging.dragging, left, width, frameIncrement, seek]
	);

	const onPointerMoveInOut = useCallback(
		(e: PointerEvent) => {
			if (!videoConfig) {
				return;
			}

			if (!inOutDragging.dragging) {
				return;
			}

			const offset = Math.max(
				inOutDragging.boundaries[0],
				Math.min(
					inOutDragging.boundaries[1],
					getClientXWithScroll(e.clientX) - inOutDragging.initialOffset
				)
			);
			if (inOutDragging.dragging === 'in') {
				if (!inPointerHandle.current) {
					throw new Error('in pointer handle');
				}

				if (!inMarkerAreaRef.current) {
					throw new Error('expected inMarkerAreaRef');
				}

				if (!inFrame) {
					throw new Error('expected inframes');
				}

				inPointerHandle.current.style.transform = `translateX(${
					get(inFrame) + offset
				}px)`;
				inMarkerAreaRef.current.style.width =
					String(get(inFrame) + offset) + 'px';
			}

			if (inOutDragging.dragging === 'out') {
				if (!outPointerHandle.current) {
					throw new Error('in pointer handle');
				}

				if (!outMarkerAreaRef.current) {
					throw new Error('in outMarkerAreaRef');
				}

				if (!outFrame) {
					throw new Error('expected outframes');
				}

				outPointerHandle.current.style.transform = `translateX(${
					get(outFrame) + offset
				}px)`;
				outMarkerAreaRef.current.style.left =
					String(get(outFrame) + offset) + 'px';
				outMarkerAreaRef.current.style.width =
					String(width - get(outFrame) - offset) + 'px';
			}
		},
		[get, inFrame, inOutDragging, outFrame, videoConfig, width]
	);

	const onPointerUpScrubbing = useCallback(
		(e: PointerEvent) => {
			stopInterval();

			if (!videoConfig) {
				return;
			}

			if (!dragging.dragging) {
				return;
			}

			setDragging({
				dragging: false,
			});

			const frame = getFrameFromX(
				getClientXWithScroll(e.clientX) - left,
				videoConfig.durationInFrames,
				width,
				'clamp'
			);

			persistCurrentFrame(frame);

			if (dragging.wasPlaying) {
				play();
			}
		},
		[dragging, left, play, videoConfig, width]
	);

	const onPointerUpInOut = useCallback(
		(e: PointerEvent) => {
			if (!videoConfig) {
				return;
			}

			if (!inOutDragging.dragging) {
				return;
			}

			setInOutDragging({
				dragging: false,
			});

			const frame = getFrameFromX(
				getClientXWithScroll(e.clientX) - left,
				videoConfig.durationInFrames,
				width,
				'extend'
			);
			if (inOutDragging.dragging === 'in') {
				if (frame < 1) {
					return setInAndOutFrames((prev) => ({
						...prev,
						inFrame: null,
					}));
				}

				const maxFrame = outFrame === null ? Infinity : outFrame - 1;
				setInAndOutFrames((prev) => ({
					...prev,
					inFrame: Math.min(maxFrame, frame),
				}));
			} else {
				if (frame > videoConfig.durationInFrames - 2) {
					return setInAndOutFrames((prev) => ({
						...prev,
						outFrame: null,
					}));
				}

				const minFrame = inFrame === null ? -Infinity : inFrame + 1;
				setInAndOutFrames((prev) => ({
					...prev,
					outFrame: Math.max(minFrame, frame),
				}));
			}
		},
		[
			inFrame,
			inOutDragging.dragging,
			left,
			outFrame,
			setInAndOutFrames,
			videoConfig,
			width,
		]
	);

	useEffect(() => {
		if (!dragging.dragging) {
			return;
		}

		window.addEventListener('pointermove', onPointerMoveScrubbing);
		window.addEventListener('pointerup', onPointerUpScrubbing);
		return () => {
			window.removeEventListener('pointermove', onPointerMoveScrubbing);
			window.removeEventListener('pointerup', onPointerUpScrubbing);
		};
	}, [dragging.dragging, onPointerMoveScrubbing, onPointerUpScrubbing]);

	useEffect(() => {
		if (inOutDragging.dragging === false) {
			return;
		}

		window.addEventListener('pointermove', onPointerMoveInOut);
		window.addEventListener('pointerup', onPointerUpInOut);
		return () => {
			window.removeEventListener('pointermove', onPointerMoveInOut);
			window.removeEventListener('pointerup', onPointerUpInOut);
		};
	}, [inOutDragging.dragging, onPointerMoveInOut, onPointerUpInOut]);

	const {zoom} = useContext(TimelineZoomCtx);

	const containerStyle: React.CSSProperties = useMemo(() => {
		return {
			...container,
			width: 100 * zoom + '%',
		};
	}, [zoom]);

	return (
		<div
			ref={sliderAreaRef}
			style={containerStyle}
			onPointerDown={onPointerDown}
		>
			<div style={inner} />
			{inFrame !== null && (
				<TimelineInOutPointerHandle
					type="in"
					atFrame={inFrame}
					dragging={inOutDragging.dragging === 'in'}
				/>
			)}
			{outFrame !== null && (
				<TimelineInOutPointerHandle
					type="out"
					dragging={inOutDragging.dragging === 'out'}
					atFrame={outFrame}
				/>
			)}
		</div>
	);
};
