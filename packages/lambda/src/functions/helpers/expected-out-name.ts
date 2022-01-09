import {RenderInternals} from '@remotion/renderer';
import {Codec} from 'remotion';
import {
	customOutName,
	outName,
	outStillName,
	RenderMetadata,
} from '../../defaults';

export const getExpectedOutName = (renderMetadata: RenderMetadata) => {
	if (renderMetadata.outName) {
		return customOutName(renderMetadata.renderId, renderMetadata.outName);
	}

	if (renderMetadata.type === 'still') {
		return outStillName(renderMetadata.renderId, renderMetadata.imageFormat);
	}

	if (renderMetadata.type === 'video') {
		return outName(
			renderMetadata.renderId,
			RenderInternals.getFileExtensionFromCodec(
				renderMetadata.codec as Codec,
				'final'
			)
		);
	}

	throw new TypeError('no type passed');
};
