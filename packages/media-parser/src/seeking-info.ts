import type {IsoBaseMediaBox} from './containers/iso-base-media/base-media-box';
import type {TfraBox} from './containers/iso-base-media/mfra/tfra';
import type {MoovBox} from './containers/iso-base-media/moov/moov';
import type {PacketPes} from './containers/transport-stream/parse-pes';
import type {MediaSection} from './state/video-section';

export type IsoBaseMediaSeekingInfo = {
	type: 'iso-base-media-seeking-info';
	moovBox: MoovBox;
	moofBoxes: IsoBaseMediaBox[];
	tfraBoxes: TfraBox[];
	mediaSections: MediaSection[];
};

export type WavSeekingInfo = {
	type: 'wav-seeking-info';
	sampleRate: number;
	blockAlign: number;
	mediaSections: MediaSection;
};

export type TransportStreamSeekingInfo = {
	type: 'transport-stream-seeking-info';
	observedPesHeaders: PacketPes[];
	ptsStartOffset: number;
};

export type SeekingInfo =
	| IsoBaseMediaSeekingInfo
	| WavSeekingInfo
	| TransportStreamSeekingInfo;
