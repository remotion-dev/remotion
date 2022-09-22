import type {Codec} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';
import type {OutNameInput, OutNameOutput, RenderMetadata} from '../../defaults';
import {customOutName, outName, outStillName} from '../../defaults';
import {validateOutname} from '../../shared/validate-outname';

export const getExpectedOutName = (
	renderMetadata: RenderMetadata,
	bucketName: string,
	outNameValue: OutNameInput | null
): OutNameOutput => {
	if (outNameValue) {
		validateOutname(outNameValue);
		return customOutName(renderMetadata.renderId, bucketName, outNameValue);
	}

	if (renderMetadata.type === 'still') {
		return {
			renderBucketName: bucketName,
			key: outStillName(renderMetadata.renderId, renderMetadata.imageFormat),
			customCredentials: null,
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
			customCredentials: null,
		};
	}

	throw new TypeError('no type passed');
};
