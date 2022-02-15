import {RenderInternals} from '@remotion/renderer';
import {Codec} from 'remotion';
import {
	customOutName,
	outName,
	OutNameOutput,
	outStillName,
	RenderMetadata,
} from '../../defaults';
import {validateOutname} from '../../shared/validate-outname';

export const getExpectedOutName = (
	renderMetadata: RenderMetadata,
	bucketName: string
): OutNameOutput => {
	if (renderMetadata.outName) {
		validateOutname(renderMetadata.outName);
		return customOutName(
			renderMetadata.renderId,
			bucketName,
			renderMetadata.outName
		);
	}

	if (renderMetadata.type === 'still') {
		return {
			renderBucketName: bucketName,
			key: outStillName(renderMetadata.renderId, renderMetadata.imageFormat),
		};
	}

	if (renderMetadata.type === 'video') {
		return {
			renderBucketName: bucketName,
			key: outName(
				renderMetadata.renderId,
				RenderInternals.getFileExtensionFromCodec(
					renderMetadata.codec as Codec,
					'final'
				)
			),
		};
	}

	throw new TypeError('no type passed');
};
