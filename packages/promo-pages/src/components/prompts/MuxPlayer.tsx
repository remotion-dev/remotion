import {
	isHLSProvider,
	MediaPlayer,
	MediaProvider,
	type MediaProviderAdapter,
	type MediaProviderChangeEvent,
} from '@vidstack/react';
import {
	defaultLayoutIcons,
	DefaultVideoLayout,
} from '@vidstack/react/player/layouts/default';
import React, {useCallback} from 'react';

import '@vidstack/react/player/styles/default/layouts/video.css';
import '@vidstack/react/player/styles/default/theme.css';

export const MuxPlayer: React.FC<{
	readonly playbackId: string;
	readonly title?: string;
	readonly rounded?: boolean;
}> = ({playbackId, title, rounded = true}) => {
	const onProviderChange = useCallback(
		(provider: MediaProviderAdapter | null, _e: MediaProviderChangeEvent) => {
			if (isHLSProvider(provider)) {
				// @ts-expect-error - hls.js is not typed
				provider.library = () => import('hls.js');
			}
		},
		[],
	);

	return (
		<MediaPlayer
			src={`https://stream.mux.com/${playbackId}.m3u8`}
			crossOrigin
			playsInline
			autoPlay
			muted
			title={title}
			className={`w-full aspect-video bg-black overflow-hidden ${rounded ? 'rounded' : ''}`}
			onProviderChange={onProviderChange}
		>
			<MediaProvider />
			<DefaultVideoLayout
				icons={defaultLayoutIcons}
				slots={{
					captionButton: null,
					pipButton: null,
					airPlayButton: null,
					googleCastButton: null,
					settingsMenu: null,
				}}
			/>
		</MediaPlayer>
	);
};
