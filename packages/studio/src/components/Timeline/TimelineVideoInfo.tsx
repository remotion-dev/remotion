import {hasBeenAborted, WEBCODECS_TIMESCALE} from '@remotion/media-parser';
import {extractFrames, WebCodecsInternals} from '@remotion/webcodecs';
import React, {useEffect, useRef, useState} from 'react';
import {useVideoConfig} from 'remotion';
import type {FrameDatabaseKey} from '../../helpers/frame-database';
import {
	frameDatabase,
	getTimestampFromFrameDatabaseKey,
	makeFrameDatabaseKey,
} from '../../helpers/frame-database';
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

const MAX_TIME_DEVIATION = WEBCODECS_TIMESCALE * 0.05;

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

const createSlots = ({
	filledSlots,
	visualizationWidth,
	fromSeconds,
	toSeconds,
}: {
	filledSlots: Map<number, number | undefined>;
	visualizationWidth: number;
	fromSeconds: number;
	toSeconds: number;
}) => {
	if (filledSlots.size > 0) {
		return;
	}

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
};

const fillWithCachedFrames = ({
	ctx,
	visualizationWidth,
	filledSlots,
}: {
	ctx: CanvasRenderingContext2D;
	visualizationWidth: number;
	filledSlots: Map<number, number | undefined>;
}) => {
	const keys = Array.from(frameDatabase.keys());
	const targets = Array.from(filledSlots.keys());

	for (let i = 0; i < filledSlots.size; i++) {
		const timestamp = targets[i];
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
				Math.abs(frame.timestamp - timestamp)
		) {
			continue;
		}

		ctx.drawImage(frame, (i / filledSlots.size) * visualizationWidth, 0);
		filledSlots.set(timestamp, frame.timestamp);
	}
};

const fillFrameWhereItFits = ({
	frame,
	filledSlots,
	ctx,
	visualizationWidth,
}: {
	frame: VideoFrame;
	filledSlots: Map<number, number | undefined>;
	ctx: CanvasRenderingContext2D;
	visualizationWidth: number;
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

		console.log('draw');
		ctx.drawImage(frame, (i / filledSlots.size) * visualizationWidth, 0);
		filledSlots.set(slot, frame.timestamp);
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

	useEffect(() => {
		if (error) {
			return;
		}

		const {current} = ref;
		if (!current) {
			return;
		}

		console.log('TimelineVideoInfo', frameDatabase);

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

		createSlots({
			filledSlots,
			visualizationWidth,
			fromSeconds,
			toSeconds,
		});

		fillWithCachedFrames({
			ctx,
			visualizationWidth,
			filledSlots,
		});

		current.appendChild(canvas);

		const controller = new AbortController();

		console.log('extracting', fromSeconds, toSeconds);
		extractFrames({
			acknowledgeRemotionLicense: true,
			timestampsInSeconds: ({track}) => {
				const aspectRatio = track.width / track.height;
				const framesFitInWidth = Math.ceil(
					visualizationWidth / (HEIGHT * aspectRatio),
				);
				const timestampTargets: number[] = [];
				const segmentDuration = toSeconds - fromSeconds;

				for (let i = 0; i < framesFitInWidth; i++) {
					timestampTargets.push(
						fromSeconds + (segmentDuration / framesFitInWidth) * (i + 0.5),
					);
				}

				return timestampTargets;
			},
			src,
			onFrame: (frame) => {
				console.log('onFrame', frame.timestamp);
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

				const databaseKey = makeFrameDatabaseKey(src, transformed.timestamp);

				const existingFrame = frameDatabase.get(databaseKey);
				if (existingFrame) {
					existingFrame.close();
				}

				frameDatabase.set(databaseKey, transformed);
				createSlots({
					filledSlots,
					fromSeconds,
					toSeconds,
					visualizationWidth,
				});
				fillFrameWhereItFits({
					ctx,
					filledSlots,
					visualizationWidth,
					frame: transformed,
				});
			},
			signal: controller.signal,
		})
			.then(() => {
				fillWithCachedFrames({
					ctx,
					visualizationWidth,
					filledSlots,
				});
			})
			.catch((e) => {
				if (hasBeenAborted(e)) {
					return;
				}

				setError(e);
			});

		return () => {
			controller.abort();
			current.removeChild(canvas);
		};
	}, [durationInFrames, error, fps, src, startFrom, visualizationWidth]);

	return <div ref={ref} style={containerStyle} />;
};
