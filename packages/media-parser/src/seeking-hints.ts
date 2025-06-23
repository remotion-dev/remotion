import type {AacSeekingHints} from './containers/aac/seeking-hints';
import type {FlacSeekingHints} from './containers/flac/seeking-hints';
import type {IsoBaseMediaBox} from './containers/iso-base-media/base-media-box';
import type {TfraBox} from './containers/iso-base-media/mfra/tfra';
import type {MoovBox} from './containers/iso-base-media/moov/moov';
import type {Mp3SeekingHints} from './containers/mp3/seeking-hints';
import type {RiffSeekingHints} from './containers/riff/seeking-hints';
import type {PacketPes} from './containers/transport-stream/parse-pes';
import type {MediaParserKeyframe} from './options';
import type {MoofBox} from './state/iso-base-media/precomputed-moof';
import type {LazyCuesLoadedOrNull} from './state/matroska/lazy-cues-fetch';
import type {MediaSection} from './state/video-section';

export type IsoBaseMediaSeekingHints = {
	type: 'iso-base-media-seeking-hints';
	moovBox: MoovBox;
	moofBoxes: MoofBox[];
	tfraBoxes: TfraBox[];
	mediaSections: MediaSection[];
	mfraAlreadyLoaded: IsoBaseMediaBox[] | null;
};

export type WavSeekingHints = {
	type: 'wav-seeking-hints';
	sampleRate: number;
	blockAlign: number;
	mediaSection: MediaSection;
};

export type TransportStreamSeekingHints = {
	type: 'transport-stream-seeking-hints';
	observedPesHeaders: PacketPes[];
	ptsStartOffset: number;
	firstVideoTrackId: number;
};

export type WebmSeekingHints = {
	type: 'webm-seeking-hints';
	track: null | {timescale: number; trackId: number};
	keyframes: MediaParserKeyframe[];
	loadedCues: LazyCuesLoadedOrNull;
	timestampMap: Map<number, number>;
};

export type M3u8SeekingHints = {
	type: 'm3u8-seeking-hints';
};

export type SeekingHints =
	| IsoBaseMediaSeekingHints
	| WavSeekingHints
	| TransportStreamSeekingHints
	| WebmSeekingHints
	| FlacSeekingHints
	| RiffSeekingHints
	| Mp3SeekingHints
	| AacSeekingHints
	| M3u8SeekingHints;
