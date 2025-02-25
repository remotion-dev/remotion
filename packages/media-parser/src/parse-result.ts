import type {AacStructure} from './containers/aac/types';
import type {FlacStructure} from './containers/flac/types';
import type {IsoBaseMediaBox} from './containers/iso-base-media/base-media-box';
import type {M3uStructure} from './containers/m3u/types';
import type {RiffBox, RiffStructure} from './containers/riff/riff-box';
import type {TransportStreamBox} from './containers/transport-stream/boxes';
import type {WavStructure} from './containers/wav/types';
import type {MatroskaSegment} from './containers/webm/segments';
import type {MetadataEntry} from './metadata/get-metadata';
import type {Skip} from './skip';

type Mp3Id3Header = {
	type: 'id3-header';
	versionMajor: number;
	versionMinor: number;
	flags: number;
	size: number;
	metatags: MetadataEntry[];
};

export type Mp3Box = Mp3Id3Header;

export type AnySegment =
	| MatroskaSegment
	| IsoBaseMediaBox
	| RiffBox
	| TransportStreamBox;

export type IsoBaseMediaStructure = {
	type: 'iso-base-media';
	boxes: IsoBaseMediaBox[];
};

export type MatroskaStructure = {
	type: 'matroska';
	boxes: MatroskaSegment[];
};

export type TransportStreamStructure = {
	type: 'transport-stream';
	boxes: TransportStreamBox[];
};

export type Mp3Structure = {
	type: 'mp3';
	boxes: Mp3Box[];
};

export type Structure =
	| IsoBaseMediaStructure
	| RiffStructure
	| MatroskaStructure
	| TransportStreamStructure
	| Mp3Structure
	| AacStructure
	| WavStructure
	| M3uStructure
	| FlacStructure;

export type ParseResult = Skip | null;
