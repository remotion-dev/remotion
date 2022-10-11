import type {Codec} from '@remotion/renderer';
import {RenderInternals, validateOutputFilename} from '@remotion/renderer';
import type {OutNameInputWithoutCredentials} from './constants';
import {validateBucketName} from './validate-bucketname';

const validateS3Key = (s3Key: string) => {
	if (typeof s3Key !== 'string') {
		throw new TypeError(
			'The S3 key must be a string. Passed an object of type ' + typeof s3Key
		);
	}

	if (!s3Key.match(/^([0-9a-zA-Z-!_.*'()/]+)$/g)) {
		throw new Error(
			"The S3 Key must match the RegExp `/([0-9a-zA-Z-!_.*'()/]+)/g`. You passed: " +
				s3Key +
				'. Check for invalid characters.'
		);
	}
};

export const validateOutname = (
	outName: OutNameInputWithoutCredentials | undefined | null,
	codec?: Codec
) => {
	if (typeof outName === 'undefined' || outName === null) {
		return;
	}

	if (typeof outName === 'string') {
		if (codec) {
			validateOutputFilename(
				codec,
				RenderInternals.getExtensionOfFilename(outName ?? null)
			);
		}

		validateS3Key(outName);
		return;
	}

	validateS3Key(outName.key);
	validateBucketName(outName.bucketName, {mustStartWithRemotion: false});
};
