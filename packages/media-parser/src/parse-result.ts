import type {IsoBaseMediaBox} from './boxes/iso-base-media/base-media-box';
import type {RiffBox, RiffStructure} from './boxes/riff/riff-box';
import type {TransportStreamBox} from './boxes/transport-stream/boxes';
import type {WavStructure} from './boxes/wav/types';
import type {MatroskaSegment} from './boxes/webm/segments';
import type {MetadataEntry} from './metadata/get-metadata';

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
	| WavStructure;

export type ParseResult = {
	skipTo: number | null;
};

export type MatroskaParseResult = {
	skipTo: number | null;
};
