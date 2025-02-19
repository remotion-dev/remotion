import {createContext, useContext, useMemo} from 'react';

export type MediaVolumeContextValue = {
	mediaMuted: boolean;
	mediaVolume: number;
};

export type SetMediaVolumeContextValue = {
	setMediaMuted: (u: React.SetStateAction<boolean>) => void;
	setMediaVolume: (u: number) => void;
};

export const MediaVolumeContext = createContext<MediaVolumeContextValue>({
	mediaMuted: false,
	mediaVolume: 1,
});

export const SetMediaVolumeContext = createContext<SetMediaVolumeContextValue>({
	setMediaMuted: () => {
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

type MediaMutedReturnType = readonly [
	boolean,
	(u: React.SetStateAction<boolean>) => void,
];

export const useMediaMutedState = (): MediaMutedReturnType => {
	const {mediaMuted} = useContext(MediaVolumeContext);
	const {setMediaMuted} = useContext(SetMediaVolumeContext);

	return useMemo(() => {
		return [mediaMuted, setMediaMuted];
	}, [mediaMuted, setMediaMuted]);
};
