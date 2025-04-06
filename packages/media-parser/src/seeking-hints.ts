import type {IsoBaseMediaBox} from './containers/iso-base-media/base-media-box';
import type {TfraBox} from './containers/iso-base-media/mfra/tfra';
import type {MoovBox} from './containers/iso-base-media/moov/moov';
import type {PacketPes} from './containers/transport-stream/parse-pes';
import type {MediaParserKeyframe} from './options';
import type {LazyCuesLoadedOrNull} from './state/matroska/lazy-cues-fetch';
import type {MediaSection} from './state/video-section';

export type IsoBaseMediaSeekingHints = {
	type: 'iso-base-media-seeking-hints';
	moovBox: MoovBox;
	moofBoxes: IsoBaseMediaBox[];
	tfraBoxes: TfraBox[];
	mediaSections: MediaSection[];
	mfraAlreadyLoaded: IsoBaseMediaBox[] | null;
};

export type WavSeekingHints = {
	type: 'wav-seeking-hints';
	sampleRate: number;
	blockAlign: number;
	mediaSections: MediaSection;
};

export type TransportStreamSeekingHints = {
	type: 'transport-stream-seeking-hints';
	observedPesHeaders: PacketPes[];
	ptsStartOffset: number;
};

export type WebmSeekingHints = {
	type: 'webm-seeking-hints';
	track: null | {timescale: number; trackId: number};
	keyframes: MediaParserKeyframe[];
	loadedCues: LazyCuesLoadedOrNull;
};

export type SeekingHints =
	| IsoBaseMediaSeekingHints
	| WavSeekingHints
	| TransportStreamSeekingHints
	| WebmSeekingHints;
