import {TAsset} from 'remotion';

export type UnsafeAsset = Omit<TAsset, 'sequenceFrame' | 'id'> & {
	startInVideo: number;
	duration: number | null;
	trimLeft: number;
};

export type MediaAsset = Omit<UnsafeAsset, 'duration'> & {
	duration: number;
};

export type AssetAudioDetails = {
	channels: number;
};

export type Assets = MediaAsset[];
