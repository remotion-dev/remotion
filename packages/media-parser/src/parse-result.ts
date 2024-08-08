import type {AvccBox, HvccBox} from './boxes/iso-base-media/avcc';
import type {BaseBox} from './boxes/iso-base-media/base-type';
import type {EsdsBox} from './boxes/iso-base-media/esds/esds';
import type {FtypBox} from './boxes/iso-base-media/ftyp';
import type {MdatBox} from './boxes/iso-base-media/mdat/mdat';
import type {MdhdBox} from './boxes/iso-base-media/mdhd';
import type {MoovBox} from './boxes/iso-base-media/moov/moov';
import type {MvhdBox} from './boxes/iso-base-media/mvhd';
import type {CttsBox} from './boxes/iso-base-media/stsd/ctts';
import type {KeysBox} from './boxes/iso-base-media/stsd/keys';
import type {MebxBox} from './boxes/iso-base-media/stsd/mebx';
import type {StcoBox} from './boxes/iso-base-media/stsd/stco';
import type {StscBox} from './boxes/iso-base-media/stsd/stsc';
import type {StsdBox} from './boxes/iso-base-media/stsd/stsd';
import type {StssBox} from './boxes/iso-base-media/stsd/stss';
import type {StszBox} from './boxes/iso-base-media/stsd/stsz';
import type {SttsBox} from './boxes/iso-base-media/stsd/stts';
import type {TkhdBox} from './boxes/iso-base-media/tkhd';
import type {TrakBox} from './boxes/iso-base-media/trak/trak';
import type {VoidBox} from './boxes/iso-base-media/void-box';
import type {MatroskaSegment} from './boxes/webm/segments';

export interface RegularBox extends BaseBox {
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
	| StszBox
	| StcoBox
	| StscBox
	| AvccBox
	| HvccBox
	| VoidBox
	| StssBox
	| CttsBox;

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
