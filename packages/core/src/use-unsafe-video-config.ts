import {useContext, useMemo} from 'react';
import {SequenceContext} from './SequenceContext.js';
import {useVideo} from './use-video.js';
import type {VideoConfig} from './video-config.js';

export const useUnsafeVideoConfig = (): VideoConfig | null => {
	const context = useContext(SequenceContext);
	const ctxWidth = context?.width ?? null;
	const ctxHeight = context?.height ?? null;
	const ctxDuration = context?.durationInFrames ?? null;
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
		};
	}, [ctxDuration, ctxHeight, ctxWidth, video]);
};
