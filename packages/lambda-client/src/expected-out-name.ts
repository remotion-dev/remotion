import type {Codec} from '@remotion/renderer';
import {NoReactAPIs} from '@remotion/renderer/pure';
import {getCustomOutName} from './get-custom-out-name';
import type {RenderMetadata} from './render-metadata';
import {
	customOutName,
	outName,
	outStillName,
	type CustomCredentials,
	type OutNameInput,
	type OutNameOutput,
	type RenderOutput,
} from './shared-constants';
import {validateOutname} from './validate-outname';

export const getCredentialsFromOutName = (
	name: OutNameInput | null,
): CustomCredentials | null => {
	if (typeof name === 'string') {
		return null;
	}

	if (name === null) {
		return null;
	}

	if (typeof name === 'undefined') {
		return null;
	}

	return name.s3OutputProvider ?? null;
};

export const getExpectedOutName = ({
	renderMetadata,
	bucketName,
	customCredentials,
	bucketNamePrefix,
	output,
}: {
	renderMetadata: RenderMetadata;
	bucketName: string;
	customCredentials: CustomCredentials | null;
	bucketNamePrefix: string;
	output: RenderOutput;
}): OutNameOutput => {
	if (renderMetadata.type === 'sequence') {
		if (output === 'separate-audio') {
			throw new Error('This render does not have a separate audio output.');
		}

		return {
			key: renderMetadata.outputSequence.manifestKey,
			renderBucketName: renderMetadata.outputSequence.bucketName,
			customCredentials,
		};
	}

	const outNameValue = getCustomOutName({
		customCredentials,
		outName:
			output === 'main'
				? (renderMetadata.outName ?? null)
				: (renderMetadata.separateAudioTo ?? null),
		privacy: renderMetadata.privacy,
	});
	const separateAudioFilename =
		typeof renderMetadata.separateAudioTo === 'string'
			? renderMetadata.separateAudioTo
			: (renderMetadata.separateAudioTo?.key ?? null);
	if (outNameValue) {
		validateOutname({
			outName: outNameValue,
			codec: output === 'main' ? renderMetadata.codec : null,
			audioCodecSetting: renderMetadata.audioCodec,
			separateAudioTo: separateAudioFilename?.toLowerCase() ?? null,
			bucketNamePrefix,
		});
		if (typeof outNameValue === 'string') {
			return customOutName(renderMetadata.renderId, bucketName, outNameValue);
		}

		if (outNameValue.key !== undefined) {
			return customOutName(renderMetadata.renderId, bucketName, {
				...outNameValue,
				key: outNameValue.key,
			});
		}
	}

	if (output === 'separate-audio') {
		throw new Error('This render does not have a separate audio output.');
	}

	const destination =
		typeof outNameValue === 'object' && outNameValue !== null
			? outNameValue
			: null;

	if (renderMetadata.type === 'still') {
		return {
			renderBucketName: destination?.bucketName ?? bucketName,
			key: outStillName(renderMetadata.renderId, renderMetadata.imageFormat),
			customCredentials: destination?.s3OutputProvider ?? null,
		};
	}

	if (renderMetadata.type === 'video') {
		return {
			renderBucketName: destination?.bucketName ?? bucketName,
			key: outName(
				renderMetadata.renderId,
				NoReactAPIs.getFileExtensionFromCodec(
					renderMetadata.codec as Codec,
					separateAudioFilename === null ? renderMetadata.audioCodec : null,
				),
			),
			customCredentials: destination?.s3OutputProvider ?? null,
		};
	}

	throw new TypeError('no type passed');
};
