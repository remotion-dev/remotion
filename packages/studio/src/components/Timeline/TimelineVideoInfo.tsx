import {
	addFrameToCache,
	aspectRatioCache,
	ensureSlots,
	extractFrames,
	fillFrameWhereItFits,
	fillWithCachedFrames,
	getAspectRatioFromCache,
	getLoopDisplayWidth,
	makeFrameDatabaseKey,
	resizeVideoFrame,
	shouldTileLoopDisplay,
	WEBCODECS_TIMESCALE,
} from '@remotion/timeline-utils';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import type {LoopDisplay} from 'remotion';
import {useVideoConfig} from 'remotion';
import {
	TIMELINE_LAYER_FILMSTRIP_HEIGHT,
	TIMELINE_VIDEO_INFO_WAVEFORM_HEIGHT,
} from '../../helpers/timeline-layout';
import {AudioWaveform} from '../AudioWaveform';
import {getTimelineVideoInfoWidths} from './get-timeline-video-info-widths';

const outerStyle: React.CSSProperties = {
	width: '100%',
	height: '100%',
	display: 'flex',
	flexDirection: 'column',
};

const filmstripContainerStyle: React.CSSProperties = {
	height: TIMELINE_LAYER_FILMSTRIP_HEIGHT,
	backgroundColor: 'rgba(0, 0, 0, 0.3)',
	display: 'flex',
	borderTopLeftRadius: 2,
	fontSize: 10,
	fontFamily: 'Arial, Helvetica',
};

export const TimelineVideoInfo: React.FC<{
	readonly src: string;
	readonly visualizationWidth: number;
	readonly naturalWidth: number;
	readonly trimBefore: number;
	readonly durationInFrames: number;
	readonly playbackRate: number;
	readonly volume: string | number;
	readonly doesVolumeChange: boolean;
	readonly premountWidth: number;
	readonly postmountWidth: number;
	readonly loopDisplay: LoopDisplay | undefined;
}> = ({
	src,
	visualizationWidth,
	naturalWidth,
	trimBefore,
	durationInFrames,
	playbackRate,
	volume,
	doesVolumeChange,
	premountWidth,
	postmountWidth,
	loopDisplay,
}) => {
	const {fps} = useVideoConfig();
	const ref = useRef<HTMLDivElement>(null);
	const [error, setError] = useState<Error | null>(null);
	const aspectRatio = useRef<number | null>(getAspectRatioFromCache(src));
	const {mediaVisualizationWidth, mediaNaturalWidth} = useMemo(() => {
		return getTimelineVideoInfoWidths({
			visualizationWidth,
			naturalWidth,
			premountWidth,
			postmountWidth,
		});
	}, [naturalWidth, postmountWidth, premountWidth, visualizationWidth]);

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

		const canvas = document.createElement('canvas');
		canvas.width = mediaVisualizationWidth;
		canvas.height = TIMELINE_LAYER_FILMSTRIP_HEIGHT;
		const ctx = canvas.getContext('2d');
		if (!ctx) {
			return;
		}

		current.appendChild(canvas);

		const loopWidth = getLoopDisplayWidth({
			visualizationWidth: mediaNaturalWidth,
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
			current.removeChild(canvas);
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

		const fromSeconds = trimBefore / fps;
		const visibleDurationInFrames =
			shouldRepeatVideo && loopDisplay
				? loopDisplay.durationInFrames
				: durationInFrames;
		// Trim is applied first, then playbackRate. Each composition frame
		// advances the source video by `playbackRate` source frames.
		const toSeconds =
			fromSeconds + (visibleDurationInFrames * playbackRate) / fps;
		const targetWidth = shouldRepeatVideo
			? targetCanvas.width
			: mediaNaturalWidth;

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
					current.removeChild(canvas);
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
			current.removeChild(canvas);
		};
	}, [
		durationInFrames,
		error,
		fps,
		loopDisplay,
		mediaNaturalWidth,
		mediaVisualizationWidth,
		playbackRate,
		src,
		trimBefore,
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
					startFrom={trimBefore}
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
