import {useEffect} from 'react';
import type {OnVideoFrame, OnVideoFrameCallback} from './props';

export const useEmitVideoFrame = ({
	ref,
	onVideoFrame,
	onVideoFrameCallback,
}: {
	ref: React.RefObject<HTMLVideoElement | null>;
	onVideoFrame: OnVideoFrame | null;
	onVideoFrameCallback: OnVideoFrameCallback | null;
}) => {
	useEffect(() => {
		const {current} = ref;
		if (!current) {
			return;
		}

		if (!onVideoFrame && !onVideoFrameCallback) {
			return;
		}

		let handle = 0;
		const callback: VideoFrameRequestCallback = (_now, metadata) => {
			if (!ref.current) {
				return;
			}

			onVideoFrame?.(ref.current);
			onVideoFrameCallback?.(_now, metadata);
			handle = ref.current.requestVideoFrameCallback(callback);
		};

		onVideoFrame?.(current);
		if (!current.requestVideoFrameCallback) {
			return;
		}

		handle = current.requestVideoFrameCallback(callback);

		return () => {
			if (handle) {
				current.cancelVideoFrameCallback(handle);
			}
		};
	}, [onVideoFrame, onVideoFrameCallback, ref]);
};
