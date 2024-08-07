import type {BaseBox} from './boxes/iso-base-media/base-type';
import type {EsdsBox} from './boxes/iso-base-media/esds/esds';
import type {FtypBox} from './boxes/iso-base-media/ftyp';
import type {MdatBox} from './boxes/iso-base-media/mdat/mdat';
import type {MdhdBox} from './boxes/iso-base-media/mdhd';
import type {MoovBox} from './boxes/iso-base-media/moov/moov';
import type {MvhdBox} from './boxes/iso-base-media/mvhd';
import type {KeysBox} from './boxes/iso-base-media/stsd/keys';
import type {MebxBox} from './boxes/iso-base-media/stsd/mebx';
import type {StsdBox} from './boxes/iso-base-media/stsd/stsd';
import type {StszBox} from './boxes/iso-base-media/stsd/stsz';
import type {SttsBox} from './boxes/iso-base-media/stts/stts';
import type {TkhdBox} from './boxes/iso-base-media/tkhd';
import type {TrakBox} from './boxes/iso-base-media/trak/trak';
import type {MatroskaSegment} from './boxes/webm/segments';

interface RegularBox extends BaseBox {
	boxType: string;
	boxSize: number;
	children: AnySegment[];
	offset: number;
	type: 'regular-box';
}

export type IsoBaseMediaBox =
	| RegularBox
	| FtypBox
	| MvhdBox
	| TkhdBox
	| StsdBox
	| MebxBox
	| KeysBox
	| MoovBox
	| TrakBox
	| SttsBox
	| MdhdBox
	| EsdsBox
	| MdatBox
	| StszBox;

export type AnySegment = MatroskaSegment | IsoBaseMediaBox;

export type ParseResult =
	| {
			status: 'done';
			segments: AnySegment[];
	  }
	| {
			status: 'incomplete';
			segments: AnySegment[];
			skipTo: number | null;
			continueParsing: () => ParseResult;
	  };
