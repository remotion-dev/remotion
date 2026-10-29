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
	useLayoutEffect(() => {
		const canvas = ref.current;
		if (!canvas || !sequence.animated || typeof ImageDecoder === 'undefined') {
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
			src: sequence.src,
			width: visualizationWidth * pixelRatio,
			frameHeight: height,
			devicePixelRatio: pixelRatio,
			horizontalOffset,
			fromSeconds: displayOffsetInFrames / fps,
			toSeconds: (displayOffsetInFrames + displayDurationInFrames) / fps,
			loopBehavior: sequence.animated.loopBehavior,
			requestInit: sequence.animated.requestInit,
			signal: controller.signal,
			getTimestampInSeconds: (time) => {
				if (sequence.frozenFrame !== null) {
					return sequence.frozenFrame / fps;
				}

				const displayFrame = time * fps;
				if (loopDisplay) {
					return (
						(sequenceFrameOffset -
							loopDisplay.mediaOffsetInFrames * sequence.sequencePlaybackRate +
							((displayFrame + loopDisplay.phaseOffsetInFrames) %
								loopDisplay.durationInFrames) *
								sequence.sequencePlaybackRate) /
						fps
					);
				}

				return (
					(sequenceFrameOffset + displayFrame * sequence.sequencePlaybackRate) /
					fps
				);
			},
		}).catch((error) => {
			if (!controller.signal.aborted) {
				Internals.Log.warn(
					{logLevel: 'warn', tag: 'animated-image-filmstrip'},
					`Could not render filmstrip for ${sequence.src}`,
					error,
				);
			}
		});
		return () => controller.abort();
	}, [
		displayDurationInFrames,
		displayOffsetInFrames,
		fps,
		loopDisplay,
		sequence,
		sequenceFrameOffset,
		visualizationWidth,
	]);

	if (typeof ImageDecoder === 'undefined') {
		return null;
	}

	return <canvas ref={ref} />;
};
