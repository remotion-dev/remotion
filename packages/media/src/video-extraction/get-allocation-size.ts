import type {VideoSampleWithoutDuration} from './keyframe-bank';

export const getAllocationSize = (sample: VideoSampleWithoutDuration) => {
	if (sample.format === null) {
		return sample.codedHeight * sample.codedWidth * 4;
	}

	return sample.allocationSize();
};
