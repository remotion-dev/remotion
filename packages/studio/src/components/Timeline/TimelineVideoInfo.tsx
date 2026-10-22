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
	getSlotsToExtract,
	getTimestampFromFrameDatabaseKey,
	hydrateThumbnailsFromPersistentCache,
	makeFrameDatabaseKey,
	mediaDurationCache,
	resizeVideoFrame,
	snapCanvasPositionToDevicePixel,
	WEBCODECS_TIMESCALE,
	writeThumbnailToPersistentCache,
} from '@remotion/timeline-utils';
import React, {useLayoutEffect, useMemo, useRef, useState} from 'react';
import type {LoopDisplay} from 'remotion';
import {Internals, useVideoConfig} from 'remotion';
import {alignCanvasToDevicePixels} from '../../helpers/align-canvas-to-device-pixels';
import {BLACK_ALPHA_30} from '../../helpers/colors';
import {getStudioPixelRatio} from '../../helpers/studio-pixel-ratio';
import {
	TIMELINE_LAYER_FILMSTRIP_HEIGHT,
	TIMELINE_VIDEO_INFO_WAVEFORM_HEIGHT,
} from '../../helpers/timeline-layout';
import {AudioWaveform} from '../AudioWaveform';
import {getTimelineMediaStartFrame} from './get-timeline-media-start-frame';
import type {TimelineVolume} from './get-timeline-volume';
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
		readonly loopDisplayOffsetInFrames: number;
		readonly loopDisplay: LoopDisplay;
		readonly loopWidth: number;
	} | null;
	readonly playbackRate: number;
	readonly volume: TimelineVolume;
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
	muted,
	frozenMediaFrame,
	extendLastFrame,
}) => {
	const {fps} = useVideoConfig();
	const resolvedSrc = Internals.usePreload(src);
	const ref = useRef<HTMLCanvasElement>(null);
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
	useLayoutEffect(() => {
		const {current: canvas} = ref;
		if (!canvas) {
			return;
		}

		const ctx = canvas.getContext('2d');
		if (!ctx) {
			return;
		}

		if (error) {
			ctx.resetTransform();
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			return;
		}

		const controller = new AbortController();
		const pixelRatio = getStudioPixelRatio();
		const {horizontalOffset} = alignCanvasToDevicePixels({
			canvas,
			cssHeight: TIMELINE_LAYER_FILMSTRIP_HEIGHT,
			cssWidth: visualizationWidth,
			pixelRatio,
		});
		ctx.setTransform(1, 0, 0, 1, horizontalOffset, 0);

		const clearCanvas = () => {
			ctx.save();
			ctx.resetTransform();
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			ctx.restore();
		};

		const drawRepeatedFrame = (frame: VideoFrame) => {
			const thumbnailWidth = Math.max(1, frame.displayWidth);

			clearCanvas();
			for (let x = 0; x < canvas.width; x += thumbnailWidth) {
				const left = snapCanvasPositionToDevicePixel({
					horizontalOffset,
					position: x,
				});
				const right = snapCanvasPositionToDevicePixel({
					horizontalOffset,
					position: x + thumbnailWidth,
				});
				ctx.drawImage(frame, left, 0, right - left, canvas.height);
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
				return;
			}

			hydrateThumbnailsFromPersistentCache({
				src,
				height: canvas.height,
				getTimestamps: () => [timestamp],
			})
				.then(() => {
					if (controller.signal.aborted) {
						return;
					}

					const persistedFrame = getCachedFrozenFrame(timestamp);
					if (persistedFrame) {
						drawRepeatedFrame(persistedFrame);
						return;
					}

					return extractFrames({
						repeatLastFrame: extendLastFrame,
						timestampsInSeconds: ({
							track,
							durationInSeconds,
						}: {
							track: {height: number; width: number};
							durationInSeconds: number | null;
						}) => {
							aspectRatio.current = track.width / track.height;
							aspectRatioCache.set(src, aspectRatio.current);
							if (durationInSeconds !== null) {
								mediaDurationCache.set(src, durationInSeconds);
							}

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
								writeThumbnailToPersistentCache({src, frame: transformed});

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
					});
				})
				.catch((e: unknown) => {
					setError(e as Error);
				});

			return () => {
				controller.abort();
			};
		}

		const targetCanvas = tiledLoop ? document.createElement('canvas') : canvas;
		if (tiledLoop) {
			targetCanvas.width = Math.max(
				1,
				Math.ceil(tiledLoop.loopWidth * pixelRatio),
			);
			targetCanvas.height = canvas.height;
		}

		const targetCtx = tiledLoop ? targetCanvas.getContext('2d') : ctx;
		if (!targetCtx) {
			return;
		}

		// desired-timestamp -> filled-timestamp
		const filledSlots = new Map<number, number | undefined>();
		const frameDrawOffset = tiledLoop ? 0 : horizontalOffset;

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
				((tiledLoop.displayOffsetInFrames +
					tiledLoop.loopDisplayOffsetInFrames) %
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
			clearCanvas();
			ctx.fillStyle = pattern;
			ctx.fillRect(0, 0, canvas.width, canvas.height);
		};

		// Returns whether every slot could be filled with a frame from memory.
		const fillWithFramesInMemory = () => {
			if (aspectRatio.current === null) {
				return false;
			}

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
				horizontalOffset: frameDrawOffset,
			});
			repeatTarget();

			return getSlotsToExtract({filledSlots, src}).length === 0;
		};

		// Don't extract frames if every slot has a fitting frame
		if (fillWithFramesInMemory()) {
			return;
		}

		hydrateThumbnailsFromPersistentCache({
			src,
			height: canvas.height,
			getTimestamps: () => {
				// A persisted source also restores its aspect ratio.
				if (aspectRatio.current === null) {
					aspectRatio.current = getAspectRatioFromCache(src);
				}

				if (aspectRatio.current === null) {
					return [];
				}

				ensureSlots({
					filledSlots,
					naturalWidth: targetWidth,
					fromSeconds,
					toSeconds,
					aspectRatio: aspectRatio.current,
					frameHeight: canvas.height,
				});
				return Array.from(filledSlots.keys());
			},
		})
			.then(() => {
				if (controller.signal.aborted) {
					return;
				}

				if (fillWithFramesInMemory()) {
					return;
				}

				return extractFrames({
					repeatLastFrame: extendLastFrame,
					timestampsInSeconds: ({
						track,
						durationInSeconds,
					}: {
						track: {height: number; width: number};
						durationInSeconds: number | null;
					}) => {
						aspectRatio.current = track.width / track.height;
						aspectRatioCache.set(src, aspectRatio.current);
						if (durationInSeconds !== null) {
							mediaDurationCache.set(src, durationInSeconds);
						}

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
							horizontalOffset: frameDrawOffset,
						});
						repeatTarget();

						return getSlotsToExtract({filledSlots, src}).map(
							(timestamp) => timestamp / WEBCODECS_TIMESCALE,
						);
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
							if (aspectRatio.current === null) {
								throw new Error('Aspect ratio is not set');
							}

							writeThumbnailToPersistentCache({src, frame: transformed});

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
								src,
								filledSlots,
								visualizationWidth: targetWidth,
								frame: transformed,
								segmentDuration: toSeconds - fromSeconds,
								fromSeconds,
								devicePixelRatio: 1,
								frameHeight: canvas.height,
								horizontalOffset: frameDrawOffset,
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
				}).then(() => {
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
						horizontalOffset: frameDrawOffset,
					});
					repeatTarget();
				});
			})
			.catch((e: unknown) => {
				setError(e as Error);
			});

		return () => {
			controller.abort();
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
			<div style={filmstripStyle}>
				<canvas ref={ref} />
			</div>
			<div style={audioStyle}>
				<AudioWaveform
					src={src}
					height={TIMELINE_VIDEO_INFO_WAVEFORM_HEIGHT}
					visualizationWidth={audioWidth}
					startFrom={mediaStartFrame}
					durationInFrames={durationInFrames}
					displayOffsetInFrames={tiledLoop?.displayOffsetInFrames ?? 0}
					loopDisplayOffsetInFrames={tiledLoop?.loopDisplayOffsetInFrames ?? 0}
					displayDurationInFrames={
						tiledLoop?.displayDurationInFrames ?? durationInFrames
					}
					volume={volume}
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
	if (!loopDisplay || loopDisplay.durationInFrames <= 0) {
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
	readonly volume: TimelineVolume;
	readonly muted: boolean;
	readonly marginLeft: number;
	readonly loopDisplay: LoopDisplay | undefined;
	readonly loopDisplayOffsetInFrames: number;
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
	muted,
	marginLeft,
	loopDisplay,
	loopDisplayOffsetInFrames,
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
			loopDisplayOffsetInFrames,
			loopDisplay,
			loopWidth,
		};
	}, [
		displayDurationInFrames,
		displayOffsetInFrames,
		loopDisplayOffsetInFrames,
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
			displayOffsetInFrames: displayOffsetInFrames + loopDisplayOffsetInFrames,
			loopDisplay,
		});
	}, [
		displayDurationInFrames,
		displayOffsetInFrames,
		loopDisplayOffsetInFrames,
		loopDisplay,
		shouldTileLoop,
	]);
	const getSegmentVolume = (
		segmentDisplayOffsetInFrames: number,
		segmentDurationInFrames: number,
	): TimelineVolume => {
		if (volume.type === 'constant') {
			return volume;
		}

		if (volume.type === 'linear') {
			return {
				type: 'linear',
				points: volume.points.map((point) => ({
					frame: point.frame - segmentDisplayOffsetInFrames,
					value: point.value,
				})),
			};
		}

		return {
			type: 'sampled',
			samples: volume.samples.slice(
				Math.max(0, Math.floor(segmentDisplayOffsetInFrames)),
				Math.min(
					volume.samples.length,
					Math.ceil(segmentDisplayOffsetInFrames + segmentDurationInFrames),
				),
			),
		};
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
							segment.displayOffsetInFrames - loopDisplayOffsetInFrames,
							segment.durationInFrames,
						)}
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
