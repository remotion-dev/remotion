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
		const callback = () => {
			if (!ref.current) {
				return;
			}

			onVideoFrame(ref.current);
			handle = ref.current.requestVideoFrameCallback(callback);
		};

		callback();

		return () => {
			current.cancelVideoFrameCallback(handle);
		};
	}, [onVideoFrame, ref]);
};
