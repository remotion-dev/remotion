import type {RegularBox} from '../containers/iso-base-media/base-media-box';
import type {IlstBox} from '../containers/iso-base-media/meta/ilst';
import {
	getMoovBoxFromState,
	getTkhdBox,
	getTraks,
} from '../containers/iso-base-media/traversal';
import type {ParserState} from '../state/parser-state';
import {truthy} from '../truthy';
import type {MediaParserMetadataEntry} from './get-metadata';

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
const mapToKey = (index: string) => {
	if (index === '�ART') {
		return 'artist';
	}

	if (index === '�alb') {
		return 'album';
	}

	if (index === '�cmt') {
		return 'comment';
	}

	if (index === '�day') {
		return 'releaseDate';
	}

	if (index === '�gen') {
		return 'genre';
	}

	if (index === '�nam') {
		return 'title';
	}

	if (index === '�too') {
		return 'encoder';
	}

	if (index === '�wrt') {
		return 'writer';
	}

	if (index === '�cpy') {
		return 'copyright';
	}

	if (index === '�dir') {
		return 'director';
	}

	if (index === '�prd') {
		return 'producer';
	}

	if (index === '�des') {
		return 'description';
	}

	return null;
};

const parseIlstBoxWithoutKeys = (
	ilstBox: IlstBox,
): MediaParserMetadataEntry[] => {
	return ilstBox.entries
		.map((entry): MediaParserMetadataEntry | null => {
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
): MediaParserMetadataEntry[] => {
	const ilstBox = meta.children.find((b) => b.type === 'ilst-box');
	const keysBox = meta.children.find((b) => b.type === 'keys-box');
	if (!ilstBox || !keysBox) {
		if (ilstBox) {
			return parseIlstBoxWithoutKeys(ilstBox as IlstBox);
		}

		return [];
	}

	const entries: MediaParserMetadataEntry[] = [];

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

export const getMetadataFromIsoBase = (
	state: ParserState,
): MediaParserMetadataEntry[] => {
	const moov = getMoovBoxFromState({
		structureState: state.structure,
		isoState: state.iso,
		mp4HeaderSegment: state.m3uPlaylistContext?.mp4HeaderSegment ?? null,
		mayUsePrecomputed: true,
	});
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
