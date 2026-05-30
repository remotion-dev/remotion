import {useEffect} from 'react';
import type {OnVideoFrame, OnVideoFramePresented} from './props';

export const useEmitVideoFrame = ({
	ref,
	onVideoFrame,
	onVideoFramePresented,
}: {
	ref: React.RefObject<HTMLVideoElement | null>;
	onVideoFrame: OnVideoFrame | null;
	onVideoFramePresented: OnVideoFramePresented | null;
}) => {
	useEffect(() => {
		const {current} = ref;
		if (!current) {
			return;
		}

		if (!onVideoFrame && !onVideoFramePresented) {
			return;
		}

		let handle = 0;
		const callback: VideoFrameRequestCallback = (_now, metadata) => {
			if (!ref.current) {
				return;
			}

			onVideoFrame?.(ref.current);
			onVideoFramePresented?.(ref.current, metadata);
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
	}, [onVideoFrame, onVideoFramePresented, ref]);
};
