import React, {useEffect, useMemo, useRef, useState} from 'react';
import type {LoopDisplay} from 'remotion';
import {useVideoConfig} from 'remotion';
import {extractFrames} from '../../helpers/extract-frames';
import type {FrameDatabaseKey} from '../../helpers/frame-database';
import {
	addFrameToCache,
	aspectRatioCache,
	frameDatabase,
	getAspectRatioFromCache,
	getFrameDatabaseKeyPrefix,
	getTimestampFromFrameDatabaseKey,
	makeFrameDatabaseKey,
} from '../../helpers/frame-database';
import {resizeVideoFrame} from '../../helpers/resize-video-frame';
import {
	TIMELINE_LAYER_HEIGHT_AUDIO,
	TIMELINE_LAYER_HEIGHT_IMAGE,
} from '../../helpers/timeline-layout';
import {AudioWaveform} from '../AudioWaveform';
import {
	getLoopDisplayWidth,
	shouldTileLoopDisplay,
} from '../looped-media-timeline';

const FILMSTRIP_HEIGHT = TIMELINE_LAYER_HEIGHT_IMAGE - 2;

const outerStyle: React.CSSProperties = {
	width: '100%',
	height: '100%',
	display: 'flex',
	flexDirection: 'column',
};

const filmstripContainerStyle: React.CSSProperties = {
	height: FILMSTRIP_HEIGHT,
	width: '100%',
	backgroundColor: 'rgba(0, 0, 0, 0.3)',
	display: 'flex',
	borderTopLeftRadius: 2,
	fontSize: 10,
	fontFamily: 'Arial, Helvetica',
};

const WEBCODECS_TIMESCALE = 1_000_000;
const MAX_TIME_DEVIATION = WEBCODECS_TIMESCALE * 0.05;

const getDurationOfOneFrame = ({
	visualizationWidth,
	aspectRatio,
	segmentDuration,
}: {
	visualizationWidth: number;
	aspectRatio: number;
	segmentDuration: number;
}) => {
	const framesFitInWidthUnrounded =
		visualizationWidth / (FILMSTRIP_HEIGHT * aspectRatio);
	return (segmentDuration / framesFitInWidthUnrounded) * WEBCODECS_TIMESCALE;
};

const fixRounding = (value: number) => {
	if (value % 1 >= 0.49999999) {
		return Math.ceil(value);
	}

	return Math.floor(value);
};

const calculateTimestampSlots = ({
	visualizationWidth,
	fromSeconds,
	segmentDuration,
	aspectRatio,
}: {
	visualizationWidth: number;
	fromSeconds: number;
	segmentDuration: number;
	aspectRatio: number;
}) => {
	const framesFitInWidthUnrounded =
		visualizationWidth / (FILMSTRIP_HEIGHT * aspectRatio);
	const framesFitInWidth = Math.ceil(framesFitInWidthUnrounded);
	const durationOfOneFrame = getDurationOfOneFrame({
		visualizationWidth,
		aspectRatio,
		segmentDuration,
	});

	const timestampTargets: number[] = [];
	for (let i = 0; i < framesFitInWidth + 1; i++) {
		const target =
			fromSeconds * WEBCODECS_TIMESCALE + durationOfOneFrame * (i + 0.5);
		const snappedToDuration =
			(Math.round(fixRounding(target / durationOfOneFrame)) - 1) *
			durationOfOneFrame;

		timestampTargets.push(snappedToDuration);
	}

	return timestampTargets;
};

const ensureSlots = ({
	filledSlots,
	naturalWidth,
	fromSeconds,
	toSeconds,
	aspectRatio,
}: {
	filledSlots: Map<number, number | undefined>;
	naturalWidth: number;
	fromSeconds: number;
	toSeconds: number;
	aspectRatio: number;
}) => {
	const segmentDuration = toSeconds - fromSeconds;

	const timestampTargets = calculateTimestampSlots({
		visualizationWidth: naturalWidth,
		fromSeconds,
		segmentDuration,
		aspectRatio,
	});

	for (const timestamp of timestampTargets) {
		if (!filledSlots.has(timestamp)) {
			filledSlots.set(timestamp, undefined);
		}
	}
};

const drawSlot = ({
	frame,
	ctx,
	filledSlots,
	visualizationWidth,
	timestamp,
	segmentDuration,
	fromSeconds,
}: {
	frame: VideoFrame;
	ctx: CanvasRenderingContext2D;
	filledSlots: Map<number, number | undefined>;
	visualizationWidth: number;
	timestamp: number;
	segmentDuration: number;
	fromSeconds: number;
}) => {
	const durationOfOneFrame = getDurationOfOneFrame({
		visualizationWidth,
		aspectRatio: frame.displayWidth / frame.displayHeight,
		segmentDuration,
	});

	const relativeTimestamp = timestamp - fromSeconds * WEBCODECS_TIMESCALE;
	const frameIndex = relativeTimestamp / durationOfOneFrame;
	const thumbnailWidth = frame.displayWidth / window.devicePixelRatio;
	const left = Math.floor(frameIndex * thumbnailWidth);
	const right = Math.ceil((frameIndex + 1) * thumbnailWidth);

	ctx.drawImage(
		frame,
		left,
		0,
		right - left,
		frame.displayHeight / window.devicePixelRatio,
	);
	filledSlots.set(timestamp, frame.timestamp);
};

const fillWithCachedFrames = ({
	ctx,
	naturalWidth,
	filledSlots,
	src,
	segmentDuration,
	fromSeconds,
}: {
	ctx: CanvasRenderingContext2D;
	naturalWidth: number;
	filledSlots: Map<number, number | undefined>;
	src: string;
	segmentDuration: number;
	fromSeconds: number;
}) => {
	const prefix = getFrameDatabaseKeyPrefix(src);
	const keys = Array.from(frameDatabase.keys()).filter((k) =>
		k.startsWith(prefix),
	);
	const targets = Array.from(filledSlots.keys());

	for (const timestamp of targets) {
		let bestKey: FrameDatabaseKey | undefined;
		let bestDistance = Infinity;
		for (const key of keys) {
			const distance = Math.abs(
				getTimestampFromFrameDatabaseKey(key) - timestamp,
			);
			if (distance < bestDistance) {
				bestDistance = distance;
				bestKey = key;
			}
		}

		if (!bestKey) {
			continue;
		}

		const frame = frameDatabase.get(bestKey);
		if (!frame) {
			continue;
		}

		const alreadyFilled = filledSlots.get(timestamp);

		// Don't fill if a closer frame was already drawn
		if (
			alreadyFilled &&
			Math.abs(alreadyFilled - timestamp) <=
				Math.abs(frame.frame.timestamp - timestamp)
		) {
			continue;
		}

		frame.lastUsed = Date.now();

		drawSlot({
			ctx,
			frame: frame.frame,
			filledSlots,
			visualizationWidth: naturalWidth,
			timestamp,
			segmentDuration,
			fromSeconds,
		});
	}
};

const fillFrameWhereItFits = ({
	frame,
	filledSlots,
	ctx,
	visualizationWidth,
	segmentDuration,
	fromSeconds,
}: {
	frame: VideoFrame;
	filledSlots: Map<number, number | undefined>;
	ctx: CanvasRenderingContext2D;
	visualizationWidth: number;
	segmentDuration: number;
	fromSeconds: number;
}) => {
	const slots = Array.from(filledSlots.keys());

	for (let i = 0; i < slots.length; i++) {
		const slot = slots[i];
		if (Math.abs(slot - frame.timestamp) > MAX_TIME_DEVIATION) {
			continue;
		}

		const filled = filledSlots.get(slot);
		// Don't fill if a better timestamp was already filled
		if (
			filled &&
			Math.abs(filled - slot) <= Math.abs(filled - frame.timestamp)
		) {
			continue;
		}

		drawSlot({
			ctx,
			frame,
			filledSlots,
			visualizationWidth,
			timestamp: slot,
			segmentDuration,
			fromSeconds,
		});
	}
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
		canvas.width = visualizationWidth;
		canvas.height = FILMSTRIP_HEIGHT;
		const ctx = canvas.getContext('2d');
		if (!ctx) {
			return;
		}

		current.appendChild(canvas);

		const loopWidth = getLoopDisplayWidth({
			visualizationWidth: naturalWidth,
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
		const targetWidth = shouldRepeatVideo ? targetCanvas.width : naturalWidth;

		if (aspectRatio.current !== null) {
			ensureSlots({
				filledSlots,
				naturalWidth: targetWidth,
				fromSeconds,
				toSeconds,
				aspectRatio: aspectRatio.current,
			});

			fillWithCachedFrames({
				ctx: targetCtx,
				naturalWidth: targetWidth,
				filledSlots,
				src,
				segmentDuration: toSeconds - fromSeconds,
				fromSeconds,
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
						(FILMSTRIP_HEIGHT / frame.displayHeight) * window.devicePixelRatio;

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
					});
					fillFrameWhereItFits({
						ctx: targetCtx,
						filledSlots,
						visualizationWidth: targetWidth,
						frame: transformed,
						segmentDuration: toSeconds - fromSeconds,
						fromSeconds,
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
		naturalWidth,
		playbackRate,
		src,
		trimBefore,
		visualizationWidth,
	]);

	const audioWidth = visualizationWidth - premountWidth - postmountWidth;

	const audioStyle: React.CSSProperties = useMemo(() => {
		return {
			height: TIMELINE_LAYER_HEIGHT_AUDIO,
			width: audioWidth,
			position: 'relative',
			marginLeft: premountWidth,
		};
	}, [audioWidth, premountWidth]);

	return (
		<div style={outerStyle}>
			<div ref={ref} style={filmstripContainerStyle} />
			<div style={audioStyle}>
				<AudioWaveform
					src={src}
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
