import type {AudioCodec, Codec} from '@remotion/renderer';
import {NoReactAPIs} from '@remotion/renderer/pure';
import type {OutNameInputWithoutCredentials} from './constants';
import {validateBucketName} from './validate-bucket-name';

const validateS3Key = (s3Key: string) => {
	if (typeof s3Key !== 'string') {
		throw new TypeError(
			'The S3 key must be a string. Passed an object of type ' + typeof s3Key,
		);
	}

	// https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-keys.html
	if (!s3Key.match(/^([0-9a-zA-Z-!_.*'()/:&$@=;+,?]+)/g)) {
		throw new Error(
			"The S3 Key must match the RegExp `/^([0-9a-zA-Z-!_.*'()/:&$@=;+,?]+)/g`. You passed: " +
				s3Key +
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
		validateS3Key(outName.key);
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

	validateS3Key(outName);
};
