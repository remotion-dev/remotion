import {useContext, useMemo} from 'react';
import {SequenceContext} from './SequenceContext.js';
import {useVideo} from './use-video.js';
import type {VideoConfig} from './video-config.js';

export const useUnsafeVideoConfig = (
	duration: 'clipped' | 'unclipped' = 'clipped',
): VideoConfig | null => {
	const context = useContext(SequenceContext);
	const ctxWidth = context?.width ?? null;
	const ctxHeight = context?.height ?? null;
	const ctxDuration =
		duration === 'unclipped'
			? context?.unclippedDurationInFrames
			: context?.durationInFrames;
	const video = useVideo();

	return useMemo(() => {
		if (!video) {
			return null;
		}

		const {
			id,
			durationInFrames,
			fps,
			height,
			width,
			defaultProps,
			props,
			defaultCodec,
			defaultOutName,
			defaultVideoImageFormat,
			defaultPixelFormat,
			defaultProResProfile,
			defaultSampleRate,
		} = video;

		return {
			id,
			width: ctxWidth ?? width,
			height: ctxHeight ?? height,
			fps,
			durationInFrames: ctxDuration ?? durationInFrames,
			defaultProps,
			props,
			defaultCodec,
			defaultOutName,
			defaultVideoImageFormat,
			defaultPixelFormat,
			defaultProResProfile,
			defaultSampleRate,
		};
	}, [ctxDuration, ctxHeight, ctxWidth, video]);
};
