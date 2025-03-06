import type {MoovBox} from './containers/iso-base-media/moov/moov';

export type IsoBaseMediaSeekingInfo = {
	type: 'iso-base-media-seeking-info';
	moovBox: MoovBox;
};

export type SeekingInfo = IsoBaseMediaSeekingInfo;
