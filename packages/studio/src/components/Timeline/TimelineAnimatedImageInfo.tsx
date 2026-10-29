import type {TimelineLoopDisplay} from '@remotion/sdk';
import {renderAnimatedImageFrameStrip} from '@remotion/timeline-utils';
import React, {useLayoutEffect, useRef} from 'react';
import type {TSequence} from 'remotion';
import {Internals} from 'remotion';
import {alignCanvasToDevicePixels} from '../../helpers/align-canvas-to-device-pixels';
import {getStudioPixelRatio} from '../../helpers/studio-pixel-ratio';
import {getTimelineLayerHeight} from '../../helpers/timeline-layout';

export const TimelineAnimatedImageInfo: React.FC<{
	readonly sequence: Extract<TSequence, {type: 'image'}>;
	readonly sequenceFrameOffset: number;
	readonly displayOffsetInFrames: number;
	readonly displayDurationInFrames: number;
	readonly visualizationWidth: number;
	readonly loopDisplay: TimelineLoopDisplay | null;
	readonly fps: number;
}> = ({
	sequence,
	sequenceFrameOffset,
	displayOffsetInFrames,
	displayDurationInFrames,
	visualizationWidth,
	loopDisplay,
	fps,
}) => {
	const ref = useRef<HTMLCanvasElement>(null);
	const {src, animated, frozenFrame, sequencePlaybackRate} = sequence;
	const loopDuration = loopDisplay?.durationInFrames ?? null;
	const loopMediaOffset = loopDisplay?.mediaOffsetInFrames ?? 0;
	const loopPhaseOffset = loopDisplay?.phaseOffsetInFrames ?? 0;
	useLayoutEffect(() => {
		const canvas = ref.current;
		if (!canvas || !animated || typeof ImageDecoder === 'undefined') {
			return;
		}

		const controller = new AbortController();
		const pixelRatio = getStudioPixelRatio();
		const height = getTimelineLayerHeight('image');
		const {horizontalOffset} = alignCanvasToDevicePixels({
			canvas,
			cssHeight: height,
			cssWidth: visualizationWidth,
			pixelRatio,
		});
		renderAnimatedImageFrameStrip({
			canvas,
			src,
			width: visualizationWidth * pixelRatio,
			frameHeight: height,
			devicePixelRatio: pixelRatio,
			horizontalOffset,
			fromSeconds: displayOffsetInFrames / fps,
			toSeconds: (displayOffsetInFrames + displayDurationInFrames) / fps,
			loopBehavior: animated.loopBehavior,
			requestInit: animated.requestInit,
			signal: controller.signal,
			getTimestampInSeconds: (time) => {
				if (frozenFrame !== null) {
					return frozenFrame / fps;
				}

				const displayFrame = time * fps;
				if (loopDuration !== null) {
					return (
						(sequenceFrameOffset -
							loopMediaOffset * sequencePlaybackRate +
							((displayFrame + loopPhaseOffset) % loopDuration) *
								sequencePlaybackRate) /
						fps
					);
				}

				return (
					(sequenceFrameOffset + displayFrame * sequencePlaybackRate) / fps
				);
			},
		}).catch((error) => {
			if (!controller.signal.aborted) {
				Internals.Log.warn(
					{logLevel: 'warn', tag: 'animated-image-filmstrip'},
					`Could not render filmstrip for ${src}`,
					error,
				);
			}
		});
		return () => controller.abort();
	}, [
		animated,
		displayDurationInFrames,
		displayOffsetInFrames,
		fps,
		frozenFrame,
		loopDuration,
		loopMediaOffset,
		loopPhaseOffset,
		sequenceFrameOffset,
		sequencePlaybackRate,
		src,
		visualizationWidth,
	]);

	if (typeof ImageDecoder === 'undefined') {
		return null;
	}

	return <canvas ref={ref} />;
};
