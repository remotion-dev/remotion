import React, {useEffect, useState} from 'react';
import {Internals} from 'remotion';
import {subscribeToPreviewServerEvents} from '../helpers/preview-server-events';

export const PlaybackPitchSettingsProvider: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	const [preservePitch, setPreservePitch] = useState(
		() => window.remotion_studioConfig?.preservePitchOnPlayback ?? true,
	);

	useEffect(() => {
		return subscribeToPreviewServerEvents((event) => {
			if (event.type === 'config-file-changed') {
				setPreservePitch(event.studioRuntimeConfig.preservePitchOnPlayback);
			}
		});
	}, []);

	return (
		<Internals.PlaybackPitchContext.Provider value={preservePitch}>
			{children}
		</Internals.PlaybackPitchContext.Provider>
	);
};
