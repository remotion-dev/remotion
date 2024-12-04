import {
	getMoovBox,
	getTkhdBox,
	getTraks,
} from './boxes/iso-base-media/traversal';
import type {
	IsoBaseMediaStructure,
	RegularBox,
	Structure,
} from './parse-result';
import {truthy} from './truthy';

export type MetadataEntry = {
	key: string;
	value: string | number;
	trackId: number | null;
};

const parseIsoMetaBox = (
	meta: RegularBox,
	trackId: number | null,
): MetadataEntry[] => {
	const ilstBox = meta.children.find((b) => b.type === 'ilst-box');
	const keysBox = meta.children.find((b) => b.type === 'keys-box');
	if (!ilstBox || !keysBox) {
		return [];
	}

	if (ilstBox.entries.length !== keysBox.entries.length) {
		throw new Error('Number of entries in ilst and keys box do not match');
	}

	const entries: MetadataEntry[] = [];

	for (let i = 0; i < ilstBox.entries.length; i++) {
		const ilstEntry = ilstBox.entries[i];
		const keysEntry = keysBox.entries[i];
		if (ilstEntry.value.type !== 'unknown') {
			entries.push({
				key: keysEntry.value,
				value: ilstEntry.value.value,
				trackId,
			});
		}
	}

	return entries;
};

const getMetadataFromIsoBase = (
	isoBase: IsoBaseMediaStructure,
): MetadataEntry[] => {
	const moov = getMoovBox(isoBase.boxes);
	if (!moov) {
		return [];
	}

	const traks = getTraks(moov);
	const meta = moov.children.find(
		(b) => b.type === 'regular-box' && b.boxType === 'meta',
	) as RegularBox | null;
	const metaInTracks = traks
		.map((t) => {
			const metaBox = t.children.find(
				(child) => child.type === 'regular-box' && child.boxType === 'meta',
			) as RegularBox | null;
			if (metaBox) {
				const tkhd = getTkhdBox(t);
				if (!tkhd) {
					throw new Error('No tkhd box found');
				}

				return parseIsoMetaBox(metaBox, tkhd.trackId);
			}

			return null;
		})
		.filter(truthy);
	if (!meta) {
		return metaInTracks.flat(1);
	}

	return [...parseIsoMetaBox(meta, null), ...metaInTracks.flat(1)];
};

export const getMetadata = (structure: Structure): MetadataEntry[] => {
	if (structure.type === 'matroska') {
		return [];
	}

	if (structure.type === 'riff') {
		return [];
	}

	return getMetadataFromIsoBase(structure);
};
