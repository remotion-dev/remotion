import type {PossibleEbml} from '../containers/webm/segments/all-segments';
import {getTrackWithUid} from '../containers/webm/traversal';
import type {MatroskaStructure} from '../parse-result';
import type {MetadataEntry} from './get-metadata';

const removeEndZeroes = (value: string): string => {
	return value.endsWith('\u0000') ? removeEndZeroes(value.slice(0, -1)) : value;
};

const parseSimpleTagIntoEbml = (
	children: PossibleEbml[],
	trackId: number | null,
): MetadataEntry | null => {
	const tagName = children.find((c) => c.type === 'TagName');
	const tagString = children.find((c) => c.type === 'TagString');
	if (!tagName || !tagString) {
		return null;
	}

	return {
		trackId,
		key: tagName.value.toLowerCase(),
		value: removeEndZeroes(tagString.value),
	};
};

export const getMetadataFromMatroska = (
	structure: MatroskaStructure,
): MetadataEntry[] => {
	const entries: MetadataEntry[] = [];
	for (const segment of structure.boxes) {
		if (segment.type !== 'Segment') {
			continue;
		}

		const tags = segment.value.filter((s) => s.type === 'Tags');
		for (const tag of tags) {
			for (const child of tag.value) {
				if (child.type !== 'Tag') {
					continue;
				}

				let trackId: number | null = null;

				const target = child.value.find((c) => c.type === 'Targets');
				if (target) {
					const tagTrackId = target.value.find(
						(c) => c.type === 'TagTrackUID',
					)?.value;

					if (tagTrackId) {
						trackId = getTrackWithUid(segment, tagTrackId);
					}
				}

				const simpleTags = child.value.filter((s) => s.type === 'SimpleTag');
				for (const simpleTag of simpleTags) {
					const parsed = parseSimpleTagIntoEbml(simpleTag.value, trackId);

					if (parsed) {
						entries.push(parsed);
					}
				}
			}
		}
	}

	return entries;
};
