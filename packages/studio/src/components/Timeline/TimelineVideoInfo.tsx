import {hasBeenAborted, WEBCODECS_TIMESCALE} from '@remotion/media-parser';
import {extractFrames, WebCodecsInternals} from '@remotion/webcodecs';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {useVideoConfig} from 'remotion';
import {TIMELINE_LAYER_HEIGHT} from '../../helpers/timeline-layout';

const HEIGHT = TIMELINE_LAYER_HEIGHT - 2;

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
	const framesFitInWidth = Math.ceil(
		visualizationWidth / (HEIGHT * aspectRatio),
	);
	const timestampTargets: number[] = [];
	for (let i = 0; i < framesFitInWidth; i++) {
		timestampTargets.push(
			fromSeconds +
				((segmentDuration * WEBCODECS_TIMESCALE) / framesFitInWidth) *
					(i + 0.5),
		);
	}

	return timestampTargets;
};

const fillWithCachedFrames = ({
	ctx,
	frameDatabase,
	visualizationWidth,
	fromSeconds,
	toSeconds,
	filledSlots,
}: {
	ctx: CanvasRenderingContext2D;
	frameDatabase: Map<number, VideoFrame>;
	visualizationWidth: number;
	fromSeconds: number;
	toSeconds: number;
	filledSlots: Map<number, number | undefined>;
}) => {
	const anyFrame = frameDatabase.values().next().value;
	if (!anyFrame) {
		return;
	}

	const segmentDuration = toSeconds - fromSeconds;

	const aspectRatio = anyFrame.displayWidth / anyFrame.displayHeight;
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

	const keys = Array.from(frameDatabase.keys());
	for (let i = 0; i < timestampTargets.length; i++) {
		const timestamp = timestampTargets[i];
		let bestKey: number | undefined;
		let bestDistance = Infinity;
		for (const key of keys) {
			const distance = Math.abs(key - timestamp);
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
				Math.abs(frame.timestamp - timestamp)
		) {
			continue;
		}

		// Max 0.1 second difference
		if (Math.abs(frame.timestamp - timestamp) > WEBCODECS_TIMESCALE * 0.1) {
			continue;
		}

		ctx.drawImage(frame, (i / timestampTargets.length) * visualizationWidth, 0);
		filledSlots.set(timestamp, frame.timestamp);
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

	const frameDatabase = useMemo<Map<number, VideoFrame>>(() => new Map(), []);

	useEffect(() => {
		if (error) {
			return;
		}

		const {current} = ref;
		if (!current) {
			return;
		}

		const canvas = document.createElement('canvas');
		canvas.width = visualizationWidth;
		canvas.height = HEIGHT;
		const ctx = canvas.getContext('2d');
		if (!ctx) {
			return;
		}

		// desired-timestamp -> filled-timestamp
		const filledSlots = new Map<number, number | undefined>();

		const fromSeconds = startFrom / fps;
		const toSeconds = (startFrom + durationInFrames) / fps;

		fillWithCachedFrames({
			ctx,
			frameDatabase,
			visualizationWidth,
			fromSeconds,
			toSeconds,
			filledSlots,
		});

		current.appendChild(canvas);

		const controller = new AbortController();

		extractFrames({
			fromSeconds,
			toSeconds,
			width: visualizationWidth,
			height: HEIGHT,
			src,
			onFrame: (frame) => {
				const scale = HEIGHT / frame.displayHeight;

				const transformed = WebCodecsInternals.rotateAndResizeVideoFrame({
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

				const existingFrame = frameDatabase.get(transformed.timestamp);
				if (existingFrame) {
					transformed.close();
					return;
				}

				frameDatabase.set(transformed.timestamp, transformed);
				fillWithCachedFrames({
					ctx,
					filledSlots,
					frameDatabase,
					fromSeconds,
					toSeconds,
					visualizationWidth,
				});
			},
			signal: controller.signal,
		}).catch((e) => {
			if (hasBeenAborted(e)) {
				return;
			}

			setError(e);
		});

		return () => {
			controller.abort();
			current.removeChild(canvas);
		};
	}, [
		durationInFrames,
		error,
		fps,
		frameDatabase,
		src,
		startFrom,
		visualizationWidth,
	]);

	useEffect(() => {
		return () => {
			const entries = Array.from(frameDatabase.entries());
			for (const [, frame] of entries) {
				frame.close();
			}

			frameDatabase.clear();
		};
	}, [frameDatabase]);

	return <div ref={ref} style={containerStyle} />;
};
