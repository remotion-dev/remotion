import type {AnySegment} from '../../parse-result';
import type {ParserState} from '../../state/parser-state';
import type {IsoBaseMediaBox, RegularBox} from './base-media-box';
import type {FtypBox} from './ftyp';
import type {MdhdBox} from './mdhd';
import type {MoovBox} from './moov/moov';
import type {MvhdBox} from './mvhd';
import type {CttsBox} from './stsd/ctts';
import type {StcoBox} from './stsd/stco';
import type {StscBox} from './stsd/stsc';
import type {StsdBox} from './stsd/stsd';
import type {StssBox} from './stsd/stss';
import type {StszBox} from './stsd/stsz';
import type {SttsBox} from './stsd/stts';
import type {TfdtBox} from './tfdt';
import type {TfhdBox} from './tfhd';
import type {TkhdBox} from './tkhd';
import type {TrakBox} from './trak/trak';
import type {TrunBox} from './trun';

export const getFtypBox = (segments: AnySegment[]): FtypBox | null => {
	const ftypBox = segments.find((s) => s.type === 'ftyp-box');
	if (!ftypBox || ftypBox.type !== 'ftyp-box') {
		return null;
	}

	return ftypBox;
};

export const getMoovBox = (state: ParserState): MoovBox | null => {
	if (state.iso.moov.getMoovBox()) {
		return state.iso.moov.getMoovBox();
	}

	const structure = state.getIsoStructure();

	const moovBox = structure.boxes.find((s) => s.type === 'moov-box');
	if (!moovBox || moovBox.type !== 'moov-box') {
		return null;
	}

	return moovBox;
};

export const getMoofBoxes = (main: AnySegment[]): IsoBaseMediaBox[] => {
	const moofBoxes = main.filter(
		(s) => s.type === 'regular-box' && s.boxType === 'moof',
	);
	return moofBoxes as IsoBaseMediaBox[];
};

export const getMvhdBox = (moovBox: MoovBox): MvhdBox | null => {
	const mvHdBox = moovBox.children.find((s) => s.type === 'mvhd-box');

	if (!mvHdBox || mvHdBox.type !== 'mvhd-box') {
		return null;
	}

	return mvHdBox;
};

export const getTraks = (moovBox: MoovBox): TrakBox[] => {
	return moovBox.children.filter((s) => s.type === 'trak-box') as TrakBox[];
};

export const getTkhdBox = (trakBox: TrakBox): TkhdBox | null => {
	const tkhdBox = trakBox.children.find(
		(s) => s.type === 'tkhd-box',
	) as TkhdBox | null;

	return tkhdBox;
};

export const getMdiaBox = (trakBox: TrakBox): RegularBox | null => {
	const mdiaBox = trakBox.children.find(
		(s) => s.type === 'regular-box' && s.boxType === 'mdia',
	);

	if (!mdiaBox || mdiaBox.type !== 'regular-box') {
		return null;
	}

	return mdiaBox;
};

export const getMdhdBox = (trakBox: TrakBox): MdhdBox | null => {
	const mdiaBox = getMdiaBox(trakBox);

	if (!mdiaBox) {
		return null;
	}

	const mdhdBox = mdiaBox.children.find(
		(c) => c.type === 'mdhd-box',
	) as MdhdBox | null;

	return mdhdBox;
};

export const getStblBox = (trakBox: TrakBox): RegularBox | null => {
	const mdiaBox = getMdiaBox(trakBox);

	if (!mdiaBox) {
		return null;
	}

	const minfBox = mdiaBox.children.find(
		(s) => s.type === 'regular-box' && s.boxType === 'minf',
	);

	if (!minfBox || minfBox.type !== 'regular-box') {
		return null;
	}

	const stblBox = minfBox.children.find(
		(s) => s.type === 'regular-box' && s.boxType === 'stbl',
	);

	if (!stblBox || stblBox.type !== 'regular-box') {
		return null;
	}

	return stblBox;
};

export const getStsdBox = (trakBox: TrakBox): StsdBox | null => {
	const stblBox = getStblBox(trakBox);

	if (!stblBox || stblBox.type !== 'regular-box') {
		return null;
	}

	const stsdBox = stblBox.children.find(
		(s) => s.type === 'stsd-box',
	) as StsdBox | null;

	return stsdBox;
};

export const getVideoDescriptors = (trakBox: TrakBox): Uint8Array | null => {
	const stsdBox = getStsdBox(trakBox);

	if (!stsdBox) {
		return null;
	}

	const descriptors = stsdBox.samples.map((s) => {
		return s.type === 'video'
			? s.descriptors.map((d) => {
					return d.type === 'avcc-box'
						? d.privateData
						: d.type === 'hvcc-box'
							? d.privateData
							: null;
				})
			: [];
	});

	return descriptors.flat(1).filter(Boolean)[0] ?? null;
};

export const getStcoBox = (trakBox: TrakBox): StcoBox | null => {
	const stblBox = getStblBox(trakBox);

	if (!stblBox || stblBox.type !== 'regular-box') {
		return null;
	}

	const stcoBox = stblBox.children.find(
		(s) => s.type === 'stco-box',
	) as StcoBox | null;

	return stcoBox;
};

export const getSttsBox = (trakBox: TrakBox): SttsBox | null => {
	const stblBox = getStblBox(trakBox);

	if (!stblBox || stblBox.type !== 'regular-box') {
		return null;
	}

	const sttsBox = stblBox.children.find(
		(s) => s.type === 'stts-box',
	) as SttsBox | null;

	return sttsBox;
};

export const getCttsBox = (trakBox: TrakBox): CttsBox | null => {
	const stblBox = getStblBox(trakBox);

	if (!stblBox || stblBox.type !== 'regular-box') {
		return null;
	}

	const cttsBox = stblBox.children.find(
		(s) => s.type === 'ctts-box',
	) as CttsBox | null;

	return cttsBox;
};

export const getStszBox = (trakBox: TrakBox): StszBox | null => {
	const stblBox = getStblBox(trakBox);

	if (!stblBox || stblBox.type !== 'regular-box') {
		return null;
	}

	const stszBox = stblBox.children.find(
		(s) => s.type === 'stsz-box',
	) as StszBox | null;

	return stszBox;
};

export const getStscBox = (trakBox: TrakBox): StscBox | null => {
	const stblBox = getStblBox(trakBox);

	if (!stblBox || stblBox.type !== 'regular-box') {
		return null;
	}

	const stcoBox = stblBox.children.find(
		(b) => b.type === 'stsc-box',
	) as StscBox | null;

	return stcoBox;
};

export const getStssBox = (trakBox: TrakBox): StssBox | null => {
	const stblBox = getStblBox(trakBox);

	if (!stblBox || stblBox.type !== 'regular-box') {
		return null;
	}

	const stssBox = stblBox.children.find(
		(b) => b.type === 'stss-box',
	) as StssBox | null;

	return stssBox;
};

export const getTfdtBox = (segment: IsoBaseMediaBox): TfdtBox | null => {
	if (segment.type !== 'regular-box' || segment.boxType !== 'traf') {
		throw new Error('Expected traf-box');
	}

	const tfhdBox = segment.children.find((c) => c.type === 'tfdt-box');

	if (!tfhdBox || tfhdBox.type !== 'tfdt-box') {
		throw new Error('Expected tfhd-box');
	}

	return tfhdBox;
};

export const getTfhdBox = (segment: IsoBaseMediaBox): TfhdBox | null => {
	if (segment.type !== 'regular-box' || segment.boxType !== 'traf') {
		throw new Error('Expected traf-box');
	}

	const tfhdBox = segment.children.find(
		(c) => c.type === 'tfhd-box',
	) as TfhdBox;

	if (!tfhdBox || tfhdBox.type !== 'tfhd-box') {
		throw new Error('Expected tfhd-box');
	}

	return tfhdBox;
};

export const getTrunBoxes = (segment: IsoBaseMediaBox): TrunBox[] => {
	if (segment.type !== 'regular-box' || segment.boxType !== 'traf') {
		throw new Error('Expected traf-box');
	}

	const trunBoxes = segment.children.filter((c) => c.type === 'trun-box');

	return trunBoxes as TrunBox[];
};
