import type {MediaFox, PlayerStateData} from '@mediafox/core';
import type React from 'react';
import {useEffect, useMemo, useState} from 'react';
import {ResizeHandle} from './ResizeHandle';

export const CropUI: React.FC<{
	readonly mediaFox: MediaFox;
}> = ({mediaFox}) => {
	const [state, setState] = useState<PlayerStateData | null>(() =>
		mediaFox.getState(),
	);

	const dimensions = useMemo(() => {
		if (!state) {
			return null;
		}

		const selectedVideoTrack = state.videoTracks.find(
			(t) => t.id === state.selectedVideoTrack,
		);

		if (!selectedVideoTrack) {
			return null;
		}

		return {
			width: selectedVideoTrack.width,
			height: selectedVideoTrack.height,
		};
	}, [state]);

	useEffect(() => {
		const handleTrackChange = () => {
			setState(mediaFox.getState());
		};

		mediaFox.on('trackchange', handleTrackChange);
		mediaFox.on('loadedmetadata', handleTrackChange);
		return () => {
			mediaFox.off('trackchange', handleTrackChange);
			mediaFox.off('loadedmetadata', handleTrackChange);
		};
	}, [mediaFox]);

	if (!dimensions) {
		return null;
	}

	return (
		<div
			className="absolute w-full"
			style={{
				aspectRatio: `${dimensions.width} / ${dimensions.height}`,
			}}
		>
			<div className="border-brand absolute border-4 rounded-md w-full h-full" />
			<ResizeHandle position="top-left" />
			<ResizeHandle position="top-right" />
			<ResizeHandle position="bottom-left" />
			<ResizeHandle position="bottom-right" />
		</div>
	);
};
