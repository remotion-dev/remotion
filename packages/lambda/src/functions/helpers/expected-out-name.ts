import {Codec} from 'remotion';
import {outName, outStillName, RenderMetadata} from '../../defaults';

export const getExpectedOutName = (renderMetadata: RenderMetadata) => {
	if (renderMetadata.type === 'still') {
		return outStillName(renderMetadata.renderId, renderMetadata.imageFormat);
	}

	if (renderMetadata.type === 'video') {
		return outName(renderMetadata.renderId, renderMetadata.codec as Codec);
	}

	throw new TypeError('no type passed');
};
