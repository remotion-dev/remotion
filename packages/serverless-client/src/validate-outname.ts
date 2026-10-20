import type {AudioCodec, Codec} from '@remotion/renderer';
import {NoReactAPIs} from '@remotion/renderer/pure';
import type {OutNameInputWithoutCredentials} from './constants';
import {validateBucketName} from './validate-bucket-name';

const validateOutputKey = (key: string) => {
	if (typeof key !== 'string') {
		throw new TypeError(
			'The output key must be a string. Passed an object of type ' + typeof key,
		);
	}

	// The S3 safe character set is used as the common denominator across storage providers:
	// https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-keys.html
	if (!key.match(/^([0-9a-zA-Z-!_.*'()/:&$@=;+,?]+)/g)) {
		throw new Error(
			"The output key must match the RegExp `/^([0-9a-zA-Z-!_.*'()/:&$@=;+,?]+)/g`. You passed: " +
				key +
				'. Check for invalid characters.',
		);
	}
};

export const validateOutname = ({
	outName,
	codec,
	audioCodecSetting,
	separateAudioTo,
	bucketNamePrefix,
}: {
	outName: OutNameInputWithoutCredentials | undefined | null;
	codec: Codec | null;
	audioCodecSetting: AudioCodec | null;
	separateAudioTo: string | null;
	bucketNamePrefix: string;
}) => {
	if (typeof outName === 'undefined' || outName === null) {
		return;
	}

	if (typeof outName !== 'string') {
		validateOutputKey(outName.key);
		validateBucketName({
			bucketName: outName.bucketName,
			bucketNamePrefix,
			options: {
				mustStartWithRemotion: false,
			},
		});
		return;
	}

	if (codec) {
		NoReactAPIs.validateOutputFilename({
			codec,
			audioCodecSetting,
			extension: NoReactAPIs.getExtensionOfFilename(outName) as string,
			preferLossless: false,
			separateAudioTo,
		});
	}

	validateOutputKey(outName);
};
