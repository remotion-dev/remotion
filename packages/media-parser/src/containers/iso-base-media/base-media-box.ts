import type {BaseBox} from './base-type';
import type {ElstBox} from './elst';
import type {EsdsBox} from './esds/esds';
import type {FtypBox} from './ftyp';
import type {MdhdBox} from './mdhd';
import type {HdlrBox} from './meta/hdlr';
import type {IlstBox} from './meta/ilst';
import type {TfraBox} from './mfra/tfra';
import type {MoovBox} from './moov/moov';
import type {MvhdBox} from './moov/mvhd';
import type {TrexBox} from './moov/trex';
import type {Av1CBox} from './stsd/av1c';
import type {AvccBox} from './stsd/avcc';
import type {ColorParameterBox} from './stsd/colr';
import type {CttsBox} from './stsd/ctts';
import type {HvccBox} from './stsd/hvcc';
import type {KeysBox} from './stsd/keys';
import type {MebxBox} from './stsd/mebx';
import type {PaspBox} from './stsd/pasp';
import type {StcoBox} from './stsd/stco';
import type {StscBox} from './stsd/stsc';
import type {StsdBox} from './stsd/stsd';
import type {StssBox} from './stsd/stss';
import type {StszBox} from './stsd/stsz';
import type {SttsBox} from './stsd/stts';
import type {VpccBox} from './stsd/vpcc';
import type {TfdtBox} from './tfdt';
import type {TfhdBox} from './tfhd';
import type {TkhdBox} from './tkhd';
import type {TrakBox} from './trak/trak';
import type {TrunBox} from './trun';
import type {VoidBox} from './void-box';

export interface RegularBox extends BaseBox {
	boxType: string;
	boxSize: number;
	children: IsoBaseMediaBox[];
	offset: number;
	type: 'regular-box';
}

export type IsoBaseMediaBox =
	| RegularBox
	| FtypBox
	| MvhdBox
	| TkhdBox
	| StsdBox
	| ElstBox
	| MebxBox
	| KeysBox
	| MoovBox
	| TrakBox
	| SttsBox
	| MdhdBox
	| IlstBox
	| EsdsBox
	| StszBox
	| StcoBox
	| StscBox
	| AvccBox
	| HvccBox
	| VpccBox
	| VoidBox
	| StssBox
	| PaspBox
	| CttsBox
	| Av1CBox
	| TrunBox
	| HdlrBox
	| ColorParameterBox
	| TfdtBox
	| TfhdBox
	| TfraBox
	| TrexBox;
