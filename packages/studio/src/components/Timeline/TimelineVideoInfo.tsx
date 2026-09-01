import {
	addFrameToCache,
	aspectRatioCache,
	ensureSlots,
	extractFrames,
	fillFrameWhereItFits,
	fillWithCachedFrames,
	frameDatabase,
	getAspectRatioFromCache,
	getFrameDatabaseKeyPrefix,
	getLoopDisplaySegments,
	getTimestampFromFrameDatabaseKey,
	makeFrameDatabaseKey,
	resizeVideoFrame,
	WEBCODECS_TIMESCALE,
} from '@remotion/timeline-utils';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import type {LoopDisplay} from 'remotion';
import {Internals, useVideoConfig} from 'remotion';
import {BLACK_ALPHA_30} from '../../helpers/colors';
import {
	TIMELINE_LAYER_FILMSTRIP_HEIGHT,
	TIMELINE_VIDEO_INFO_WAVEFORM_HEIGHT,
} from '../../helpers/timeline-layout';
import {AudioWaveform} from '../AudioWaveform';
import {getTimelineMediaStartFrame} from './get-timeline-media-start-frame';
import {getTimelineVideoFilmstripTimes} from './timeline-video-filmstrip-times';

const outerStyle: React.CSSProperties = {
	width: '100%',
	height: '100%',
	display: 'flex',
	flexDirection: 'column',
};

const filmstripContainerStyle: React.CSSProperties = {
	height: TIMELINE_LAYER_FILMSTRIP_HEIGHT,
	backgroundColor: BLACK_ALPHA_30,
	display: 'flex',
	overflow: 'hidden',
	borderTopLeftRadius: 2,
	fontSize: 10,
	fontFamily: 'Arial, Helvetica',
};

const MAX_FROZEN_FRAME_CACHE_DEVIATION = WEBCODECS_TIMESCALE * 0.05;

const TimelineVideoInfoSegment: React.FC<{
	readonly src: string;
	readonly visualizationWidth: number;
	readonly startMediaFrom: number;
	readonly mediaFrameAtSequenceZero: number | null;
	readonly sequenceFrameOffset: number;
	readonly durationInFrames: number;
	readonly sourceOffsetInFrames: number;
	readonly tiledLoop: {
		readonly displayDurationInFrames: number;
		readonly displayOffsetInFrames: number;
		readonly loopDisplay: LoopDisplay;
		readonly loopWidth: number;
	} | null;
	readonly playbackRate: number;
	readonly volume: string | number;
	readonly doesVolumeChange: boolean;
	readonly muted: boolean;
	readonly frozenMediaFrame: number | null;
	readonly extendLastFrame: boolean;
}> = ({
	src,
	visualizationWidth,
	startMediaFrom,
	mediaFrameAtSequenceZero,
	sequenceFrameOffset,
	durationInFrames,
	sourceOffsetInFrames,
	tiledLoop,
	playbackRate,
	volume,
	doesVolumeChange,
	muted,
	frozenMediaFrame,
	extendLastFrame,
}) => {
	const {fps} = useVideoConfig();
	const resolvedSrc = Internals.usePreload(src);
	const ref = useRef<HTMLDivElement>(null);
	const [error, setError] = useState<Error | null>(null);
	const aspectRatio = useRef<number | null>(getAspectRatioFromCache(src));
	const mediaStartFrame =
		getTimelineMediaStartFrame({
			startMediaFrom,
			mediaFrameAtSequenceZero,
			sequenceFrameOffset,
			playbackRate,
		}) +
		sourceOffsetInFrames * playbackRate;

	// for rendering frames
	useEffect(() => {
		if (error) {
			return;
		}

		const {current} = ref;
		if (!current) {
			return;
		}

		const controller = new AbortController();
		const pixelRatio = window.devicePixelRatio;

		const canvas = document.createElement('canvas');
		canvas.width = Math.ceil(visualizationWidth * pixelRatio);
		canvas.height = Math.ceil(TIMELINE_LAYER_FILMSTRIP_HEIGHT * pixelRatio);
		canvas.style.width = canvas.width / pixelRatio + 'px';
		canvas.style.height = canvas.height / pixelRatio + 'px';
		const ctx = canvas.getContext('2d');
		if (!ctx) {
			return;
		}

		current.appendChild(canvas);

		const drawRepeatedFrame = (frame: VideoFrame) => {
			const thumbnailWidth = Math.max(1, frame.displayWidth);

			ctx.clearRect(0, 0, canvas.width, canvas.height);
			for (let x = 0; x < canvas.width; x += thumbnailWidth) {
				ctx.drawImage(frame, x, 0, thumbnailWidth, canvas.height);
			}
		};

		const getCachedFrozenFrame = (timestamp: number) => {
			const prefix = getFrameDatabaseKeyPrefix(src);
			const keys = Array.from(frameDatabase.keys()).filter((k) =>
				k.startsWith(prefix),
			);
			let bestDistance = Infinity;
			let bestFrame: VideoFrame | null = null;

			for (const key of keys) {
				const frame = frameDatabase.get(key);
				if (!frame) {
					continue;
				}

				const distance = Math.abs(
					getTimestampFromFrameDatabaseKey(key) - timestamp,
				);
				if (distance < bestDistance) {
					bestDistance = distance;
					bestFrame = frame.frame;
				}
			}

			return bestDistance <= MAX_FROZEN_FRAME_CACHE_DEVIATION
				? bestFrame
				: null;
		};

		const times = getTimelineVideoFilmstripTimes({
			trimBefore: mediaStartFrame,
			durationInFrames,
			playbackRate,
			fps,
			loopDisplay: undefined,
			frozenMediaFrame,
		});

		if (times.type === 'frozen') {
			const timestamp = times.timestampInSeconds * WEBCODECS_TIMESCALE;
			const cachedFrame = getCachedFrozenFrame(timestamp);

			if (cachedFrame) {
				drawRepeatedFrame(cachedFrame);

				return () => {
					current.removeChild(canvas);
				};
			}

			extractFrames({
				repeatLastFrame: extendLastFrame,
				timestampsInSeconds: ({
					track,
				}: {
					track: {height: number; width: number};
				}) => {
					aspectRatio.current = track.width / track.height;
					aspectRatioCache.set(src, aspectRatio.current);

					return [times.timestampInSeconds];
				},
				src: resolvedSrc,
				onVideoSample: (sample) => {
					let frame: VideoFrame | undefined;
					try {
						frame = sample.toVideoFrame();
						const scale = canvas.height / frame.displayHeight;

						const transformed = resizeVideoFrame({
							frame,
							scale,
						});

						if (transformed !== frame) {
							frame.close();
						}

						frame = undefined;

						const databaseKey = makeFrameDatabaseKey(
							src,
							transformed.timestamp,
						);

						addFrameToCache(databaseKey, transformed);
						drawRepeatedFrame(transformed);
					} catch (e) {
						if (frame) {
							frame.close();
						}

						throw e;
					} finally {
						sample.close();
					}
				},
				signal: controller.signal,
			}).catch((e: unknown) => {
				setError(e as Error);
			});

			return () => {
				controller.abort();
				current.removeChild(canvas);
			};
		}

		const targetCanvas = tiledLoop ? document.createElement('canvas') : canvas;
		targetCanvas.width = tiledLoop
			? Math.max(1, Math.ceil(tiledLoop.loopWidth * pixelRatio))
			: canvas.width;
		targetCanvas.height = canvas.height;
		const targetCtx = tiledLoop ? targetCanvas.getContext('2d') : ctx;
		if (!targetCtx) {
			current.removeChild(canvas);
			return;
		}

		// desired-timestamp -> filled-timestamp
		const filledSlots = new Map<number, number | undefined>();

		const {fromSeconds, toSeconds} = times;
		// Keep the time-to-pixel scale independent of the integer canvas backing size.
		const targetWidth = tiledLoop
			? tiledLoop.loopWidth * pixelRatio
			: visualizationWidth * pixelRatio;
		const repeatTarget = () => {
			if (!tiledLoop) {
				return;
			}

			const pattern = ctx.createPattern(targetCanvas, 'repeat-x');
			if (!pattern) {
				return;
			}

			const phase =
				(tiledLoop.displayOffsetInFrames %
					tiledLoop.loopDisplay.durationInFrames) *
				((tiledLoop.loopWidth * pixelRatio) /
					tiledLoop.loopDisplay.durationInFrames);
			pattern.setTransform(
				new DOMMatrix([
					(tiledLoop.loopWidth * pixelRatio) / targetCanvas.width,
					0,
					0,
					1,
					-phase,
					0,
				]),
			);
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			ctx.fillStyle = pattern;
			ctx.fillRect(0, 0, canvas.width, canvas.height);
		};

		if (aspectRatio.current !== null) {
			ensureSlots({
				filledSlots,
				naturalWidth: targetWidth,
				fromSeconds,
				toSeconds,
				aspectRatio: aspectRatio.current,
				frameHeight: canvas.height,
			});

			fillWithCachedFrames({
				ctx: targetCtx,
				naturalWidth: targetWidth,
				filledSlots,
				src,
				segmentDuration: toSeconds - fromSeconds,
				fromSeconds,
				devicePixelRatio: 1,
				frameHeight: canvas.height,
			});
			repeatTarget();
			const unfilled = Array.from(filledSlots.keys()).filter(
				(timestamp) => filledSlots.get(timestamp) === undefined,
			);

			// Don't extract frames if all slots are filled
			if (unfilled.length === 0) {
				return () => {
					current.removeChild(canvas);
				};
			}
		}

		extractFrames({
			repeatLastFrame: extendLastFrame,
			timestampsInSeconds: ({
				track,
			}: {
				track: {height: number; width: number};
			}) => {
				aspectRatio.current = track.width / track.height;
				aspectRatioCache.set(src, aspectRatio.current);

				ensureSlots({
					filledSlots,
					fromSeconds,
					toSeconds,
					naturalWidth: targetWidth,
					aspectRatio: aspectRatio.current,
					frameHeight: canvas.height,
				});
				fillWithCachedFrames({
					ctx: targetCtx,
					naturalWidth: targetWidth,
					filledSlots,
					src,
					segmentDuration: toSeconds - fromSeconds,
					fromSeconds,
					devicePixelRatio: 1,
					frameHeight: canvas.height,
				});
				repeatTarget();

				return Array.from(filledSlots.keys())
					.filter((timestamp) => filledSlots.get(timestamp) === undefined)
					.map((timestamp) => timestamp / WEBCODECS_TIMESCALE);
			},
			src: resolvedSrc,
			onVideoSample: (sample) => {
				let frame: VideoFrame | undefined;
				try {
					frame = sample.toVideoFrame();
					const scale = canvas.height / frame.displayHeight;

					const transformed = resizeVideoFrame({
						frame,
						scale,
					});

					if (transformed !== frame) {
						frame.close();
					}

					frame = undefined;

					const databaseKey = makeFrameDatabaseKey(src, transformed.timestamp);

					addFrameToCache(databaseKey, transformed);
					if (aspectRatio.current === null) {
						throw new Error('Aspect ratio is not set');
					}

					ensureSlots({
						filledSlots,
						fromSeconds,
						toSeconds,
						naturalWidth: targetWidth,
						aspectRatio: aspectRatio.current,
						frameHeight: canvas.height,
					});
					fillFrameWhereItFits({
						ctx: targetCtx,
						filledSlots,
						visualizationWidth: targetWidth,
						frame: transformed,
						segmentDuration: toSeconds - fromSeconds,
						fromSeconds,
						devicePixelRatio: 1,
						frameHeight: canvas.height,
					});
					repeatTarget();
				} catch (e) {
					if (frame) {
						frame.close();
					}

					throw e;
				} finally {
					sample.close();
				}
			},
			signal: controller.signal,
		})
			.then(() => {
				if (controller.signal.aborted) {
					return;
				}

				fillWithCachedFrames({
					ctx: targetCtx,
					naturalWidth: targetWidth,
					filledSlots,
					src,
					segmentDuration: toSeconds - fromSeconds,
					fromSeconds,
					devicePixelRatio: 1,
					frameHeight: canvas.height,
				});
				repeatTarget();
			})
			.catch((e: unknown) => {
				setError(e as Error);
			});

		return () => {
			controller.abort();
			current.removeChild(canvas);
		};
	}, [
		durationInFrames,
		error,
		extendLastFrame,
		fps,
		frozenMediaFrame,
		mediaStartFrame,
		playbackRate,
		resolvedSrc,
		src,
		tiledLoop,
		visualizationWidth,
	]);

	const audioWidth = visualizationWidth;

	const filmstripStyle: React.CSSProperties = useMemo(() => {
		return {
			...filmstripContainerStyle,
			width: visualizationWidth,
		};
	}, [visualizationWidth]);

	const audioStyle: React.CSSProperties = useMemo(() => {
		return {
			width: audioWidth,
			position: 'relative',
		};
	}, [audioWidth]);
	const segmentStyle: React.CSSProperties = useMemo(() => {
		return {
			...outerStyle,
			width: visualizationWidth,
			flexShrink: 0,
		};
	}, [visualizationWidth]);

	return (
		<div style={segmentStyle}>
			<div ref={ref} style={filmstripStyle} />
			<div style={audioStyle}>
				<AudioWaveform
					src={src}
					height={TIMELINE_VIDEO_INFO_WAVEFORM_HEIGHT}
					visualizationWidth={audioWidth}
					startFrom={mediaStartFrame}
					durationInFrames={durationInFrames}
					displayOffsetInFrames={tiledLoop?.displayOffsetInFrames ?? 0}
					displayDurationInFrames={
						tiledLoop?.displayDurationInFrames ?? durationInFrames
					}
					volume={volume}
					doesVolumeChange={doesVolumeChange}
					muted={muted}
					playbackRate={playbackRate}
					loopDisplay={tiledLoop?.loopDisplay}
				/>
			</div>
		</div>
	);
};

const getVisibleSegments = ({
	displayDurationInFrames,
	displayOffsetInFrames,
	loopDisplay,
}: {
	readonly displayDurationInFrames: number;
	readonly displayOffsetInFrames: number;
	readonly loopDisplay: LoopDisplay | undefined;
}) => {
	if (
		!loopDisplay ||
		loopDisplay.numberOfTimes <= 1 ||
		loopDisplay.durationInFrames <= 0
	) {
		return [
			{
				key: 'single',
				displayOffsetInFrames,
				durationInFrames: displayDurationInFrames,
				sourceOffsetInFrames: displayOffsetInFrames,
			},
		];
	}

	return getLoopDisplaySegments({
		displayDurationInFrames,
		displayOffsetInFrames,
		loopDurationInFrames: loopDisplay.durationInFrames,
	}).map((segment) => {
		return {
			key: `loop-${segment.loopIndex}`,
			displayOffsetInFrames: segment.absoluteOffsetInFrames,
			durationInFrames: segment.durationInFrames,
			sourceOffsetInFrames: segment.loopOffsetInFrames,
		};
	});
};

const TimelineVideoInfoInner: React.FC<{
	readonly src: string;
	readonly visualizationWidth: number;
	readonly displayOffsetInFrames: number;
	readonly displayDurationInFrames: number;
	readonly startMediaFrom: number;
	readonly mediaFrameAtSequenceZero: number | null;
	readonly sequenceFrameOffset: number;
	readonly playbackRate: number;
	readonly volume: string | number;
	readonly doesVolumeChange: boolean;
	readonly muted: boolean;
	readonly marginLeft: number;
	readonly loopDisplay: LoopDisplay | undefined;
	readonly frozenMediaFrame: number | null;
	readonly extendLastFrame: boolean;
}> = ({
	src,
	visualizationWidth,
	displayOffsetInFrames,
	displayDurationInFrames,
	startMediaFrom,
	mediaFrameAtSequenceZero,
	sequenceFrameOffset,
	playbackRate,
	volume,
	doesVolumeChange,
	muted,
	marginLeft,
	loopDisplay,
	frozenMediaFrame,
	extendLastFrame,
}) => {
	const pixelsPerFrame = visualizationWidth / displayDurationInFrames;
	const loopWidth = loopDisplay
		? loopDisplay.durationInFrames * pixelsPerFrame
		: null;
	const shouldTileLoop =
		loopDisplay !== undefined &&
		loopWidth !== null &&
		loopWidth <= visualizationWidth;
	const tiledLoop = useMemo(() => {
		if (!shouldTileLoop || !loopDisplay || loopWidth === null) {
			return null;
		}

		return {
			displayDurationInFrames,
			displayOffsetInFrames,
			loopDisplay,
			loopWidth,
		};
	}, [
		displayDurationInFrames,
		displayOffsetInFrames,
		loopDisplay,
		loopWidth,
		shouldTileLoop,
	]);
	const segments = useMemo(() => {
		if (shouldTileLoop) {
			return [];
		}

		return getVisibleSegments({
			displayDurationInFrames,
			displayOffsetInFrames,
			loopDisplay,
		});
	}, [
		displayDurationInFrames,
		displayOffsetInFrames,
		loopDisplay,
		shouldTileLoop,
	]);
	const getSegmentVolume = (
		segmentDisplayOffsetInFrames: number,
		segmentDurationInFrames: number,
	) => {
		if (typeof volume === 'number') {
			return volume;
		}

		const values = volume.split(',');
		return values
			.slice(
				Math.max(0, Math.floor(segmentDisplayOffsetInFrames)),
				Math.min(
					values.length,
					Math.ceil(segmentDisplayOffsetInFrames + segmentDurationInFrames),
				),
			)
			.join(',');
	};

	return (
		<div style={{display: 'flex', marginLeft, height: '100%'}}>
			{tiledLoop ? (
				<TimelineVideoInfoSegment
					src={src}
					visualizationWidth={visualizationWidth}
					startMediaFrom={startMediaFrom}
					mediaFrameAtSequenceZero={mediaFrameAtSequenceZero}
					sequenceFrameOffset={sequenceFrameOffset}
					durationInFrames={tiledLoop.loopDisplay.durationInFrames}
					sourceOffsetInFrames={0}
					tiledLoop={tiledLoop}
					playbackRate={playbackRate}
					volume={volume}
					doesVolumeChange={doesVolumeChange}
					muted={muted}
					frozenMediaFrame={frozenMediaFrame}
					extendLastFrame={extendLastFrame}
				/>
			) : (
				segments.map((segment) => (
					<TimelineVideoInfoSegment
						key={segment.key}
						src={src}
						visualizationWidth={segment.durationInFrames * pixelsPerFrame}
						startMediaFrom={startMediaFrom}
						mediaFrameAtSequenceZero={mediaFrameAtSequenceZero}
						sequenceFrameOffset={sequenceFrameOffset}
						durationInFrames={segment.durationInFrames}
						sourceOffsetInFrames={segment.sourceOffsetInFrames}
						tiledLoop={null}
						playbackRate={playbackRate}
						volume={getSegmentVolume(
							segment.sourceOffsetInFrames,
							segment.durationInFrames,
						)}
						doesVolumeChange={doesVolumeChange}
						muted={muted}
						frozenMediaFrame={frozenMediaFrame}
						extendLastFrame={extendLastFrame}
					/>
				))
			)}
		</div>
	);
};

export const TimelineVideoInfo = React.memo(TimelineVideoInfoInner);
