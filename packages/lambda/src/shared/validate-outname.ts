import type {AudioCodec, Codec} from '@remotion/renderer';
import {RenderInternals, validateOutputFilename} from '@remotion/renderer';
import type {OutNameInputWithoutCredentials} from './constants';
import {validateBucketName} from './validate-bucketname';

const validateS3Key = (s3Key: string) => {
	if (typeof s3Key !== 'string') {
		throw new TypeError(
			'The S3 key must be a string. Passed an object of type ' + typeof s3Key
		);
	}

	// https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-keys.html
	if (!s3Key.match(/^([0-9a-zA-Z-!_.*'()/:&$@=;+,?]+)/g)) {
		throw new Error(
			"The S3 Key must match the RegExp `/^([0-9a-zA-Z-!_.*'()/:&$@=;+,?]+)/g`. You passed: " +
				s3Key +
				'. Check for invalid characters.'
		);
	}
};

export const validateOutname = (
	outName: OutNameInputWithoutCredentials | undefined | null,
	codec: Codec | null,
	audioCodec: AudioCodec | null
) => {
	if (typeof outName === 'undefined' || outName === null) {
		return;
	}

	if (typeof outName !== 'string') {
		validateS3Key(outName.key);
		validateBucketName(outName.bucketName, {mustStartWithRemotion: false});
		return;
	}

	if (codec) {
		validateOutputFilename({
			codec,
			audioCodec,
			extension: RenderInternals.getExtensionOfFilename(outName) as string,
			preferLossless: false,
		});
	}

	validateS3Key(outName);
};
