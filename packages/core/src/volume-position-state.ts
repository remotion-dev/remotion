import {createContext, useContext, useMemo} from 'react';

export type MediaVolumeContextValue = {
	playerMuted: boolean;
	mediaVolume: number;
};

export type SetMediaVolumeContextValue = {
	setPlayerMuted: (u: React.SetStateAction<boolean>) => void;
	setMediaVolume: (u: number) => void;
};

export const MediaVolumeContext = createContext<MediaVolumeContextValue>({
	playerMuted: false,
	mediaVolume: 1,
});

export const SetMediaVolumeContext = createContext<SetMediaVolumeContextValue>({
	setPlayerMuted: () => {
		throw new Error('default');
	},
	setMediaVolume: () => {
		throw new Error('default');
	},
});

type MediaVolumeReturnType = readonly [number, (u: number) => void];

export const useMediaVolumeState = (): MediaVolumeReturnType => {
	const {mediaVolume} = useContext(MediaVolumeContext);
	const {setMediaVolume} = useContext(SetMediaVolumeContext);
	return useMemo(() => {
		return [mediaVolume, setMediaVolume];
	}, [mediaVolume, setMediaVolume]);
};

type PlayerMutedReturnType = readonly [
	boolean,
	(u: React.SetStateAction<boolean>) => void,
];

export const usePlayerMutedState = (): PlayerMutedReturnType => {
	const {playerMuted} = useContext(MediaVolumeContext);
	const {setPlayerMuted} = useContext(SetMediaVolumeContext);

	return useMemo(() => {
		return [playerMuted, setPlayerMuted];
	}, [playerMuted, setPlayerMuted]);
};
