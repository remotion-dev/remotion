import type {RegularBox} from '../containers/iso-base-media/base-media-box';
import type {IlstBox} from '../containers/iso-base-media/meta/ilst';
import {
	getMoovBox,
	getTkhdBox,
	getTraks,
} from '../containers/iso-base-media/traversal';
import type {ParserState} from '../state/parser-state';
import {truthy} from '../truthy';
import type {MetadataEntry} from './get-metadata';

/**
 * 
 * @param ilstBox 	©ART - Artist
	▪	Hex: A9 41 52 54
	2.	©alb - Album
	▪	Hex: A9 61 6C 62
	3.	©cmt - Comment
	▪	Hex: A9 63 6D 74
	4.	©day - Release Date
	▪	Hex: A9 64 61 79
	5.	©gen - Genre
	▪	Hex: A9 67 65 6E
	6.	©nam - Title
	▪	Hex: A9 6E 61 6D
	7.	©too - Encoder
	▪	Hex: A9 74 6F 6F
	8.	©wrt - Writer
	▪	Hex: A9 77 72 74
	9.	©cpy - Copyright
	▪	Hex: A9 63 70 79
	10.	©dir - Director
	▪	Hex: A9 64 69 72
	11.	©prd - Producer
	▪	Hex: A9 70 72 64
	12.	©des - Description
	▪	Hex: A9 64 65 73
 */
const mapToKey = (index: number) => {
	if (index === 0xa9415254) {
		return 'artist';
	}

	if (index === 0xa9616c62) {
		return 'album';
	}

	if (index === 0xa9636d74) {
		return 'comment';
	}

	if (index === 0xa9646179) {
		return 'releaseDate';
	}

	if (index === 0xa967656e) {
		return 'genre';
	}

	if (index === 0xa96e616d) {
		return 'title';
	}

	if (index === 0xa9746f6f) {
		return 'encoder';
	}

	if (index === 0xa9777274) {
		return 'writer';
	}

	if (index === 0xa9637079) {
		return 'copyright';
	}

	if (index === 0xa9646972) {
		return 'director';
	}

	if (index === 0xa9707264) {
		return 'producer';
	}

	if (index === 0xa9646573) {
		return 'description';
	}

	return null;
};

const parseIlstBoxWithoutKeys = (ilstBox: IlstBox): MetadataEntry[] => {
	return ilstBox.entries
		.map((entry): MetadataEntry | null => {
			const key = mapToKey(entry.index);
			if (!key) {
				return null;
			}

			if (entry.value.type === 'unknown') {
				return null;
			}

			return {
				trackId: null,
				key,
				value: entry.value.value,
			};
		})
		.filter(truthy);
};

export const parseIsoMetaBox = (
	meta: RegularBox,
	trackId: number | null,
): MetadataEntry[] => {
	const ilstBox = meta.children.find((b) => b.type === 'ilst-box');
	const keysBox = meta.children.find((b) => b.type === 'keys-box');
	if (!ilstBox || !keysBox) {
		if (ilstBox) {
			return parseIlstBoxWithoutKeys(ilstBox as IlstBox);
		}

		return [];
	}

	const entries: MetadataEntry[] = [];

	for (let i = 0; i < ilstBox.entries.length; i++) {
		const ilstEntry = ilstBox.entries[i];
		const keysEntry = keysBox.entries[i];
		if (ilstEntry.value.type !== 'unknown') {
			const value =
				typeof ilstEntry.value.value === 'string' &&
				ilstEntry.value.value.endsWith('\u0000')
					? ilstEntry.value.value.slice(0, -1)
					: ilstEntry.value.value;
			entries.push({
				key: keysEntry.value,
				value,
				trackId,
			});
		}
	}

	return entries;
};

export const getMetadataFromIsoBase = (state: ParserState): MetadataEntry[] => {
	const moov = getMoovBox(state);
	if (!moov) {
		return [];
	}

	const traks = getTraks(moov);
	const meta = moov.children.find(
		(b) => b.type === 'regular-box' && b.boxType === 'meta',
	) as RegularBox | null;
	const udta = moov.children.find(
		(b) => b.type === 'regular-box' && b.boxType === 'udta',
	) as RegularBox | null;
	const metaInUdta = udta?.children.find((b) => {
		return b.type === 'regular-box' && b.boxType === 'meta';
	}) as RegularBox | null;

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

	return [
		...(meta ? parseIsoMetaBox(meta, null) : []),
		...(metaInUdta ? parseIsoMetaBox(metaInUdta, null) : []),
		...metaInTracks.flat(1),
	];
};
