import React, {useMemo, useState} from 'react';
import type {
	MediaVolumeContextValue,
	SetMediaVolumeContextValue,
} from 'remotion';
import {Internals} from 'remotion';
import {loadMuteOption} from '../state/mute';

export const MediaVolumeProvider: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	const [playerMuted, setPlayerMuted] = useState<boolean>(() =>
		loadMuteOption(),
	);
	const [mediaVolume, setMediaVolume] = useState<number>(1);

	const mediaVolumeContextValue = useMemo((): MediaVolumeContextValue => {
		return {
			playerMuted,
			mediaVolume,
		};
	}, [playerMuted, mediaVolume]);

	const setMediaVolumeContextValue = useMemo((): SetMediaVolumeContextValue => {
		return {
			setPlayerMuted,
			setMediaVolume,
		};
	}, []);

	return (
		<Internals.MediaVolumeContext.Provider value={mediaVolumeContextValue}>
			<Internals.SetMediaVolumeContext.Provider
				value={setMediaVolumeContextValue}
			>
				{children}
			</Internals.SetMediaVolumeContext.Provider>
		</Internals.MediaVolumeContext.Provider>
	);
};
