import {TAsset} from 'remotion';

export type UnsafeAsset = Omit<TAsset, 'sequenceFrame'> & {
	startInVideo: number;
	duration: number | null;
};

export type MediaAsset = Omit<UnsafeAsset, 'duration'> & {
	duration: number;
};

export type AssetAudioDetails = {
	channels: number;
};

export type Assets = MediaAsset[];
