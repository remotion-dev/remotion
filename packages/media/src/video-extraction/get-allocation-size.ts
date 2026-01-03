import type {VideoSample} from 'mediabunny';

export const getAllocationSize = (sample: VideoSample) => {
	if (sample.format === null) {
		return sample.codedHeight * sample.codedWidth * 4;
	}

	return sample.allocationSize();
};
