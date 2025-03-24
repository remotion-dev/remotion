import type {IsoBaseMediaBox} from './containers/iso-base-media/base-media-box';
import type {MoovBox} from './containers/iso-base-media/moov/moov';

export type IsoBaseMediaSeekingInfo = {
	type: 'iso-base-media-seeking-info';
	moovBox: MoovBox;
	moofBoxes: IsoBaseMediaBox[];
};

export type SeekingInfo = IsoBaseMediaSeekingInfo;
