/**
 * Keeps track of in which section of the file the video is playing
 * Usually this section is in a different format and it is the only section
 * that can be read partially
 */

import type {BufferIterator} from '../iterator/buffer-iterator';

export type MediaSection = {
	start: number;
	size: number;
};

export const isByteInMediaSection = ({
	position,
	mediaSections,
}: {
	position: number;
	mediaSections: MediaSection[];
}): 'no-section-defined' | 'in-section' | 'outside-section' => {
	if (mediaSections.length === 0) {
		return 'no-section-defined';
	}

	for (const section of mediaSections) {
		if (position >= section.start && position < section.start + section.size) {
			return 'in-section';
		}
	}

	return 'outside-section';
};

export const getCurrentMediaSection = ({
	offset,
	mediaSections,
}: {
	offset: number;
	mediaSections: MediaSection[];
}): MediaSection | null => {
	for (const section of mediaSections) {
		if (offset >= section.start && offset < section.start + section.size) {
			return section;
		}
	}

	return null;
};

export const mediaSectionState = () => {
	const mediaSections: MediaSection[] = [];

	const addMediaSection = (section: MediaSection) => {
		// Check if section overlaps with any existing sections
		const overlaps = mediaSections.some(
			(existingSection) =>
				section.start < existingSection.start + existingSection.size &&
				section.start + section.size > existingSection.start,
		);
		if (overlaps) {
			return;
		}

		// Remove any existing sections that are encompassed by the new section
		// Needed by Matroska because we need to define a 1 byte media section
		// when seeking into a Cluster we have not seen yet
		for (let i = mediaSections.length - 1; i >= 0; i--) {
			const existingSection = mediaSections[i];
			if (
				section.start <= existingSection.start &&
				section.start + section.size >=
					existingSection.start + existingSection.size
			) {
				mediaSections.splice(i, 1);
			}
		}

		mediaSections.push(section);
	};

	const getMediaSections = () => {
		return mediaSections;
	};

	const isCurrentByteInMediaSection = (
		iterator: BufferIterator,
	): 'no-section-defined' | 'in-section' | 'outside-section' => {
		const offset = iterator.counter.getOffset();
		return isByteInMediaSection({
			position: offset,
			mediaSections,
		});
	};

	const getMediaSectionAssertOnlyOne = (): MediaSection => {
		if (mediaSections.length !== 1) {
			throw new Error('Expected only one video section');
		}

		return mediaSections[0];
	};

	return {
		addMediaSection,
		getMediaSections,
		isCurrentByteInMediaSection,
		isByteInMediaSection,
		getCurrentMediaSection,
		getMediaSectionAssertOnlyOne,
		mediaSections,
	};
};

export type MediaSectionState = ReturnType<typeof mediaSectionState>;
