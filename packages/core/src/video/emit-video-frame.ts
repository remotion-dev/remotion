import {useEffect} from 'react';
import type {OnVideoFrame} from './props';

export const useEmitVideoFrame = ({
	ref,
	onVideoFrame,
}: {
	ref: React.RefObject<HTMLVideoElement | null>;
	onVideoFrame: OnVideoFrame | null;
}) => {
	useEffect(() => {
		const {current} = ref;
		if (!current) {
			return;
		}

		if (!onVideoFrame) {
			return;
		}

		let handle = 0;
		const callback: VideoFrameRequestCallback = (_now, metadata) => {
			if (!ref.current) {
				return;
			}

			onVideoFrame(ref.current, _now, metadata);
			handle = ref.current.requestVideoFrameCallback(callback);
		};

		onVideoFrame(current);
		if (!current.requestVideoFrameCallback) {
			return;
		}

		handle = current.requestVideoFrameCallback(callback);

		return () => {
			if (handle) {
				current.cancelVideoFrameCallback(handle);
			}
		};
	}, [onVideoFrame, ref]);
};
