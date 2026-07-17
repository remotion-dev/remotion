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
	getLoopDisplayWidth,
	getTimestampFromFrameDatabaseKey,
	makeFrameDatabaseKey,
	resizeVideoFrame,
	shouldTileLoopDisplay,
	WEBCODECS_TIMESCALE,
} from '@remotion/timeline-utils';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import type {LoopDisplay} from 'remotion';
import {useVideoConfig} from 'remotion';
import {BLACK_ALPHA_30} from '../../helpers/colors';
import {getFilmstripLayoutWidth} from '../../helpers/filmstrip-layout-width';
import {
	TIMELINE_LAYER_FILMSTRIP_HEIGHT,
	TIMELINE_VIDEO_INFO_WAVEFORM_HEIGHT,
} from '../../helpers/timeline-layout';
import {AudioWaveform} from '../AudioWaveform';
import {getTimelineMediaStartFrame} from './get-timeline-media-start-frame';
import {getTimelineVideoInfoWidths} from './get-timeline-video-info-widths';
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
	borderTopLeftRadius: 2,
	fontSize: 10,
	fontFamily: 'Arial, Helvetica',
};

const MAX_FROZEN_FRAME_CACHE_DEVIATION = WEBCODECS_TIMESCALE * 0.05;

export const TimelineVideoInfo: React.FC<{
	readonly src: string;
	readonly visualizationWidth: number;
	readonly naturalWidth: number;
	readonly startMediaFrom: number;
	readonly mediaFrameAtSequenceZero: number | null;
	readonly sequenceFrameOffset: number;
	readonly durationInFrames: number;
	readonly playbackRate: number;
	readonly volume: string | number;
	readonly doesVolumeChange: boolean;
	readonly premountWidth: number;
	readonly postmountWidth: number;
	readonly loopDisplay: LoopDisplay | undefined;
	readonly frozenMediaFrame: number | null;
}> = ({
	src,
	visualizationWidth,
	naturalWidth,
	startMediaFrom,
	mediaFrameAtSequenceZero,
	sequenceFrameOffset,
	durationInFrames,
	playbackRate,
	volume,
	doesVolumeChange,
	premountWidth,
	postmountWidth,
	loopDisplay,
	frozenMediaFrame,
}) => {
	const {fps} = useVideoConfig();
	const ref = useRef<HTMLDivElement>(null);
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const [error, setError] = useState<Error | null>(null);
	const aspectRatio = useRef<number | null>(getAspectRatioFromCache(src));
	const mediaStartFrame = getTimelineMediaStartFrame({
		startMediaFrom,
		mediaFrameAtSequenceZero,
		sequenceFrameOffset,
		playbackRate,
	});
	const {mediaVisualizationWidth, mediaNaturalWidth} = useMemo(() => {
		return getTimelineVideoInfoWidths({
			visualizationWidth,
			naturalWidth,
			premountWidth,
			postmountWidth,
		});
	}, [naturalWidth, postmountWidth, premountWidth, visualizationWidth]);
	const filmstripLayoutWidth = useMemo(() => {
		return getFilmstripLayoutWidth(mediaNaturalWidth);
	}, [mediaNaturalWidth]);

	useEffect(() => {
		return () => {
			const canvas = canvasRef.current;
			if (canvas?.parentNode) {
				canvas.parentNode.removeChild(canvas);
			}

			canvasRef.current = null;
		};
	}, []);

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

		let canvas = canvasRef.current;
		if (!canvas || !current.contains(canvas)) {
			canvas = document.createElement('canvas');
			canvasRef.current = canvas;
			current.appendChild(canvas);
		}

		canvas.width = mediaVisualizationWidth;
		canvas.height = TIMELINE_LAYER_FILMSTRIP_HEIGHT;
		const ctx = canvas.getContext('2d');
		if (!ctx) {
			return;
		}

		ctx.clearRect(0, 0, canvas.width, canvas.height);

		const drawRepeatedFrame = (frame: VideoFrame) => {
			const thumbnailWidth = Math.max(
				1,
				frame.displayWidth / window.devicePixelRatio,
			);

			ctx.clearRect(0, 0, canvas.width, canvas.height);
			for (let x = 0; x < canvas.width; x += thumbnailWidth) {
				ctx.drawImage(
					frame,
					x,
					0,
					thumbnailWidth,
					TIMELINE_LAYER_FILMSTRIP_HEIGHT,
				);
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
			loopDisplay,
			frozenMediaFrame,
		});

		if (times.type === 'frozen') {
			const timestamp = times.timestampInSeconds * WEBCODECS_TIMESCALE;
			const cachedFrame = getCachedFrozenFrame(timestamp);

			if (cachedFrame) {
				drawRepeatedFrame(cachedFrame);

				return () => {
					controller.abort();
				};
			}

			extractFrames({
				timestampsInSeconds: ({
					track,
				}: {
					track: {height: number; width: number};
				}) => {
					aspectRatio.current = track.width / track.height;
					aspectRatioCache.set(src, aspectRatio.current);

					return [times.timestampInSeconds];
				},
				src,
				onVideoSample: (sample) => {
					let frame: VideoFrame | undefined;
					try {
						frame = sample.toVideoFrame();
						const scale =
							(TIMELINE_LAYER_FILMSTRIP_HEIGHT / frame.displayHeight) *
							window.devicePixelRatio;

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
			};
		}

		const loopWidth = getLoopDisplayWidth({
			visualizationWidth: filmstripLayoutWidth,
			loopDisplay,
		});
		const shouldRepeatVideo = shouldTileLoopDisplay(loopDisplay);
		const targetCanvas = shouldRepeatVideo
			? document.createElement('canvas')
			: canvas;
		targetCanvas.width = shouldRepeatVideo
			? Math.max(1, Math.ceil(loopWidth))
			: canvas.width;
		targetCanvas.height = canvas.height;
		const targetCtx = shouldRepeatVideo ? targetCanvas.getContext('2d') : ctx;
		if (!targetCtx) {
			return;
		}

		const repeatTarget = () => {
			if (!shouldRepeatVideo) {
				return;
			}

			const pattern = ctx.createPattern(targetCanvas, 'repeat-x');
			if (!pattern) {
				return;
			}

			pattern.setTransform(
				new DOMMatrix().scaleSelf(loopWidth / targetCanvas.width, 1),
			);
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			ctx.fillStyle = pattern;
			ctx.fillRect(0, 0, canvas.width, canvas.height);
		};

		// desired-timestamp -> filled-timestamp
		const filledSlots = new Map<number, number | undefined>();

		const {fromSeconds, toSeconds} = times;
		const targetWidth = shouldRepeatVideo
			? targetCanvas.width
			: filmstripLayoutWidth;

		if (aspectRatio.current !== null) {
			ensureSlots({
				filledSlots,
				naturalWidth: targetWidth,
				fromSeconds,
				toSeconds,
				aspectRatio: aspectRatio.current,
				frameHeight: TIMELINE_LAYER_FILMSTRIP_HEIGHT,
			});

			fillWithCachedFrames({
				ctx: targetCtx,
				naturalWidth: targetWidth,
				filledSlots,
				src,
				segmentDuration: toSeconds - fromSeconds,
				fromSeconds,
				devicePixelRatio: window.devicePixelRatio,
				frameHeight: TIMELINE_LAYER_FILMSTRIP_HEIGHT,
			});
			repeatTarget();

			const unfilled = Array.from(filledSlots.keys()).filter(
				(timestamp) => !filledSlots.get(timestamp),
			);

			// Don't extract frames if all slots are filled
			if (unfilled.length === 0) {
				return () => {
					controller.abort();
				};
			}
		}

		extractFrames({
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
					frameHeight: TIMELINE_LAYER_FILMSTRIP_HEIGHT,
				});

				return Array.from(filledSlots.keys()).map(
					(timestamp) => timestamp / WEBCODECS_TIMESCALE,
				);
			},
			src,
			onVideoSample: (sample) => {
				let frame: VideoFrame | undefined;
				try {
					frame = sample.toVideoFrame();
					const scale =
						(TIMELINE_LAYER_FILMSTRIP_HEIGHT / frame.displayHeight) *
						window.devicePixelRatio;

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
						frameHeight: TIMELINE_LAYER_FILMSTRIP_HEIGHT,
					});
					fillFrameWhereItFits({
						ctx: targetCtx,
						filledSlots,
						visualizationWidth: targetWidth,
						frame: transformed,
						segmentDuration: toSeconds - fromSeconds,
						fromSeconds,
						devicePixelRatio: window.devicePixelRatio,
						frameHeight: TIMELINE_LAYER_FILMSTRIP_HEIGHT,
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
					devicePixelRatio: window.devicePixelRatio,
					frameHeight: TIMELINE_LAYER_FILMSTRIP_HEIGHT,
				});
				repeatTarget();
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
		filmstripLayoutWidth,
		fps,
		frozenMediaFrame,
		loopDisplay,
		mediaVisualizationWidth,
		mediaStartFrame,
		playbackRate,
		src,
	]);

	const audioWidth = mediaVisualizationWidth;

	const filmstripStyle: React.CSSProperties = useMemo(() => {
		return {
			...filmstripContainerStyle,
			width: mediaVisualizationWidth,
			marginLeft: premountWidth,
		};
	}, [mediaVisualizationWidth, premountWidth]);

	const audioStyle: React.CSSProperties = useMemo(() => {
		return {
			width: audioWidth,
			position: 'relative',
			marginLeft: premountWidth,
		};
	}, [audioWidth, premountWidth]);

	return (
		<div style={outerStyle}>
			<div ref={ref} style={filmstripStyle} />
			<div style={audioStyle}>
				<AudioWaveform
					src={src}
					height={TIMELINE_VIDEO_INFO_WAVEFORM_HEIGHT}
					visualizationWidth={audioWidth}
					startFrom={mediaStartFrame}
					durationInFrames={durationInFrames}
					volume={volume}
					doesVolumeChange={doesVolumeChange}
					playbackRate={playbackRate}
					loopDisplay={loopDisplay}
				/>
			</div>
		</div>
	);
};
