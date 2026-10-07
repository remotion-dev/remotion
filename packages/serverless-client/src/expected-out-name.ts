import type {Codec} from '@remotion/renderer';
import {NoReactAPIs} from '@remotion/renderer/pure';
import {
	customOutName,
	outName,
	outStillName,
	type CustomCredentials,
	type OutNameInput,
	type OutNameOutput,
	type RenderOutput,
} from './constants';
import {getCustomOutName} from './get-custom-out-name';
import type {RenderMetadata} from './render-metadata';
import type {CloudProvider} from './types';
import {validateOutname} from './validate-outname';

export const getCredentialsFromOutName = <Provider extends CloudProvider>(
	name: OutNameInput<Provider> | null,
): CustomCredentials<Provider> | null => {
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

export const getExpectedOutName = <Provider extends CloudProvider>({
	renderMetadata,
	bucketName,
	customCredentials,
	bucketNamePrefix,
	output,
}: {
	renderMetadata: RenderMetadata<Provider>;
	bucketName: string;
	customCredentials: CustomCredentials<Provider> | null;
	bucketNamePrefix: string;
	output: RenderOutput;
}): OutNameOutput<Provider> => {
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
		return customOutName(renderMetadata.renderId, bucketName, outNameValue);
	}

	if (output === 'separate-audio') {
		throw new Error('This render does not have a separate audio output.');
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
				NoReactAPIs.getFileExtensionFromCodec(
					renderMetadata.codec as Codec,
					separateAudioFilename === null ? renderMetadata.audioCodec : null,
				),
			),
			customCredentials: null,
		};
	}

	throw new TypeError('no type passed');
};
