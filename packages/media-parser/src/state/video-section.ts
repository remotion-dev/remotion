/**
 * Keeps track of in which section of the file the video is playing
 * Usually this section is in a different format and it is the only section
 * that can be read partially
 */

import type {BufferIterator} from '../iterator/buffer-iterator';

export type VideoSection = {
	start: number;
	size: number;
};

export const videoSectionState = () => {
	const videoSections: VideoSection[] = [];

	const addVideoSection = (section: VideoSection) => {
		// Check if section overlaps with any existing sections
		const overlaps = videoSections.some(
			(existingSection) =>
				section.start < existingSection.start + existingSection.size &&
				section.start + section.size > existingSection.start,
		);

		if (!overlaps) {
			videoSections.push(section);
		}
	};

	const getVideoSections = () => {
		return videoSections;
	};

	const isByteInVideoSection = (
		byte: number,
	): 'no-section-defined' | 'in-section' | 'outside-section' => {
		if (videoSections.length === 0) {
			return 'no-section-defined';
		}

		for (const section of videoSections) {
			if (byte >= section.start && byte < section.start + section.size) {
				return 'in-section';
			}
		}

		return 'outside-section';
	};

	const isCurrentByteInVideoSection = (
		iterator: BufferIterator,
	): 'no-section-defined' | 'in-section' | 'outside-section' => {
		const offset = iterator.counter.getOffset();
		return isByteInVideoSection(offset);
	};

	const getCurrentVideoSection = (offset: number): VideoSection | null => {
		for (const section of videoSections) {
			if (offset >= section.start && offset < section.start + section.size) {
				return section;
			}
		}

		return null;
	};

	const getVideoSectionAssertOnlyOne = (): VideoSection => {
		if (videoSections.length !== 1) {
			throw new Error('Expected only one video section');
		}

		return videoSections[0];
	};

	return {
		addVideoSection,
		getVideoSections,
		isCurrentByteInVideoSection,
		isByteInVideoSection,
		getCurrentVideoSection,
		getVideoSectionAssertOnlyOne,
	};
};
