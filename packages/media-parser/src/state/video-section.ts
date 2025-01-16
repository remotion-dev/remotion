/**
 * Keeps track of in which section of the file the video is playing
 * Usually this section is in a different format and it is the only section
 * that can be read partially
 */

import type {BufferIterator} from '../buffer-iterator';

type VideoSection = {
	start: number;
	size: number;
};

export const videoSectionState = () => {
	let videoSection: VideoSection | null = null;

	const setVideoSection = (section: VideoSection) => {
		videoSection = section;
	};

	const getVideoSection = () => {
		if (!videoSection) {
			throw new Error('No video section defined');
		}

		return videoSection;
	};

	const isInVideoSectionState = (
		iterator: BufferIterator,
	): 'no-section-defined' | 'in-section' | 'outside-section' => {
		if (!videoSection) {
			return 'no-section-defined';
		}

		const offset = iterator.counter.getOffset();
		if (
			offset >= videoSection.start &&
			offset < videoSection.start + videoSection.size
		) {
			return 'in-section';
		}

		return 'outside-section';
	};

	return {
		setVideoSection,
		getVideoSection,
		isInVideoSectionState,
	};
};
