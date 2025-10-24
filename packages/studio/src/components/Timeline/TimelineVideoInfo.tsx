import {hasBeenAborted, WEBCODECS_TIMESCALE} from '@remotion/media-parser';
import {rotateAndResizeVideoFrame} from '@remotion/webcodecs';
import React, {useEffect, useRef, useState} from 'react';
import {useVideoConfig} from 'remotion';
import {extractFrames} from '../../helpers/extract-frames';
import type {FrameDatabaseKey} from '../../helpers/frame-database';
import {
	aspectRatioCache,
	clearOldFrames,
	frameDatabase,
	getAspectRatioFromCache,
	getTimestampFromFrameDatabaseKey,
	makeFrameDatabaseKey,
} from '../../helpers/frame-database';
import {getTimelineLayerHeight} from '../../helpers/timeline-layout';

const HEIGHT = getTimelineLayerHeight('video') - 2;

const containerStyle: React.CSSProperties = {
	height: HEIGHT,
	width: '100%',
	backgroundColor: 'rgba(0, 0, 0, 0.3)',
	display: 'flex',
	borderTopLeftRadius: 2,
	borderBottomLeftRadius: 2,
	fontSize: 10,
	fontFamily: 'Arial, Helvetica',
};

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
	const framesFitInWidthUnrounded = visualizationWidth / (HEIGHT * aspectRatio);
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
	const framesFitInWidthUnrounded = visualizationWidth / (HEIGHT * aspectRatio);
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
	visualizationWidth,
	fromSeconds,
	toSeconds,
	aspectRatio,
}: {
	filledSlots: Map<number, number | undefined>;
	visualizationWidth: number;
	fromSeconds: number;
	toSeconds: number;
	aspectRatio: number;
}) => {
	const segmentDuration = toSeconds - fromSeconds;

	const timestampTargets = calculateTimestampSlots({
		visualizationWidth,
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
	const left = Math.floor(
		(frameIndex * frame.displayWidth) / window.devicePixelRatio,
	); // round to avoid antialiasing

	ctx.drawImage(
		frame,
		left,
		0,
		frame.displayWidth / window.devicePixelRatio,
		frame.displayHeight / window.devicePixelRatio,
	);
	filledSlots.set(timestamp, frame.timestamp);
};

const fillWithCachedFrames = ({
	ctx,
	visualizationWidth,
	filledSlots,
	src,
	segmentDuration,
	fromSeconds,
}: {
	ctx: CanvasRenderingContext2D;
	visualizationWidth: number;
	filledSlots: Map<number, number | undefined>;
	src: string;
	segmentDuration: number;
	fromSeconds: number;
}) => {
	const keys = Array.from(frameDatabase.keys()).filter((k) =>
		k.startsWith(src),
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
			visualizationWidth,
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
	readonly startFrom: number;
	readonly durationInFrames: number;
}> = ({src, visualizationWidth, startFrom, durationInFrames}) => {
	const {fps} = useVideoConfig();
	const ref = useRef<HTMLDivElement>(null);
	const [error, setError] = useState<Error | null>(null);
	const aspectRatio = useRef<number | null>(getAspectRatioFromCache(src));

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
		canvas.height = HEIGHT;
		const ctx = canvas.getContext('2d');
		if (!ctx) {
			return;
		}

		current.appendChild(canvas);

		// desired-timestamp -> filled-timestamp
		const filledSlots = new Map<number, number | undefined>();

		const fromSeconds = startFrom / fps;
		const toSeconds = (startFrom + durationInFrames) / fps;

		if (aspectRatio.current !== null) {
			ensureSlots({
				filledSlots,
				visualizationWidth,
				fromSeconds,
				toSeconds,
				aspectRatio: aspectRatio.current,
			});

			fillWithCachedFrames({
				ctx,
				visualizationWidth,
				filledSlots,
				src,
				segmentDuration: toSeconds - fromSeconds,
				fromSeconds,
			});

			const unfilled = Array.from(filledSlots.keys()).filter(
				(timestamp) => !filledSlots.get(timestamp),
			);

			// Don't extract frames if all slots are filled
			if (unfilled.length === 0) {
				return () => {
					current.removeChild(canvas);
					clearOldFrames();
				};
			}
		}

		clearOldFrames();

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
					visualizationWidth,
					aspectRatio: aspectRatio.current,
				});

				return Array.from(filledSlots.keys()).map(
					(timestamp) => timestamp / WEBCODECS_TIMESCALE,
				);
			},
			src,
			onFrame: (frame: VideoFrame) => {
				const scale = (HEIGHT / frame.displayHeight) * window.devicePixelRatio;

				const transformed = rotateAndResizeVideoFrame({
					frame,
					resizeOperation: {
						mode: 'scale',
						scale,
					},
					rotation: 0,
					needsToBeMultipleOfTwo: false,
				});

				if (transformed !== frame) {
					frame.close();
				}

				const databaseKey = makeFrameDatabaseKey(src, transformed.timestamp);

				const existingFrame = frameDatabase.get(databaseKey);
				if (existingFrame) {
					existingFrame.frame.close();
				}

				frameDatabase.set(databaseKey, {
					frame: transformed,
					lastUsed: Date.now(),
				});
				if (aspectRatio.current === null) {
					throw new Error('Aspect ratio is not set');
				}

				ensureSlots({
					filledSlots,
					fromSeconds,
					toSeconds,
					visualizationWidth,
					aspectRatio: aspectRatio.current,
				});
				fillFrameWhereItFits({
					ctx,
					filledSlots,
					visualizationWidth,
					frame: transformed,
					segmentDuration: toSeconds - fromSeconds,
					fromSeconds,
				});
			},
			signal: controller.signal,
		})
			.then(() => {
				fillWithCachedFrames({
					ctx,
					visualizationWidth,
					filledSlots,
					src,
					segmentDuration: toSeconds - fromSeconds,
					fromSeconds,
				});
			})
			.catch((e: unknown) => {
				if (hasBeenAborted(e)) {
					return;
				}

				setError(e as Error);
			})
			.finally(() => {
				clearOldFrames();
			});

		return () => {
			controller.abort();
			current.removeChild(canvas);
		};
	}, [durationInFrames, error, fps, src, startFrom, visualizationWidth]);

	return <div ref={ref} style={containerStyle} />;
};
