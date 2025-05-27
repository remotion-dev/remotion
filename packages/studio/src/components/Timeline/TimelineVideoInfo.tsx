import {hasBeenAborted, WEBCODECS_TIMESCALE} from '@remotion/media-parser';
import {extractFrames, WebCodecsInternals} from '@remotion/webcodecs';
import React, {useEffect, useMemo, useRef} from 'react';
import {useVideoConfig} from 'remotion';
import {TIMELINE_LAYER_HEIGHT} from '../../helpers/timeline-layout';

const HEIGHT = TIMELINE_LAYER_HEIGHT - 2;

const containerStyle: React.CSSProperties = {
	height: HEIGHT,
	width: '100%',
	backgroundColor: 'rgba(0, 0, 0, 0.3)',
	display: 'flex',
	justifyContent: 'center',
	alignItems: 'center',
	textAlign: 'center',
	borderTopLeftRadius: 2,
	borderBottomLeftRadius: 2,
	fontSize: 10,
	fontFamily: 'Arial, Helvetica',
};

const fillWithCachedFrames = ({
	ctx,
	frameDatabase,
	visualizationWidth,
	fromSeconds,
	toSeconds,
}: {
	ctx: CanvasRenderingContext2D;
	frameDatabase: Map<number, VideoFrame>;
	visualizationWidth: number;
	fromSeconds: number;
	toSeconds: number;
}) => {
	const anyFrame = frameDatabase.values().next().value;
	if (!anyFrame) {
		return;
	}

	const segmentDuration = toSeconds - fromSeconds;

	const aspectRatio = anyFrame.displayWidth / anyFrame.displayHeight;
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

	const keys = Array.from(frameDatabase.keys());
	for (let i = 0; i < framesFitInWidth; i++) {
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
		if (frame) {
			console.log('drawing from cache	', bestKey, bestDistance, frame);
			ctx.drawImage(frame, (i / framesFitInWidth) * visualizationWidth, 0);
		} else {
			console.log('frame not found', bestKey, bestDistance);
		}
	}

	console.log(framesFitInWidth);
};

export const TimelineVideoInfo: React.FC<{
	readonly src: string;
	readonly visualizationWidth: number;
	readonly startFrom: number;
	readonly durationInFrames: number;
}> = ({src, visualizationWidth, startFrom, durationInFrames}) => {
	const {fps} = useVideoConfig();
	const ref = useRef<HTMLDivElement>(null);

	const frameDatabase = useMemo<Map<number, VideoFrame>>(() => new Map(), []);

	useEffect(() => {
		const canvas = document.createElement('canvas');
		canvas.width = visualizationWidth;
		canvas.height = HEIGHT;
		const ctx = canvas.getContext('2d');
		if (!ctx) {
			return;
		}

		const fromSeconds = startFrom / fps;
		const toSeconds = (startFrom + durationInFrames) / fps;

		fillWithCachedFrames({
			ctx,
			frameDatabase,
			visualizationWidth,
			fromSeconds,
			toSeconds,
		});

		const {current} = ref;

		current?.appendChild(canvas);

		let frameCount = 0;

		const controller = new AbortController();

		extractFrames({
			fromSeconds,
			toSeconds,
			width: visualizationWidth,
			height: HEIGHT,
			src,
			onFrame: (frame) => {
				const scale = HEIGHT / frame.displayHeight;

				const actualWidth = frame.displayWidth * scale;

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

				const existingFrame = frameDatabase.get(frame.timestamp);
				if (existingFrame) {
					existingFrame.close();
				}

				frameDatabase.set(frame.timestamp, transformed);

				ctx.drawImage(transformed, actualWidth * frameCount, 0);
				frameCount++;
			},
			signal: controller.signal,
		}).catch((e) => {
			if (hasBeenAborted(e)) {
				return;
			}

			throw e;
		});

		return () => {
			controller.abort();
			current?.removeChild(canvas);
		};
	}, [
		durationInFrames,
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
