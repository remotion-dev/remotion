import {_Object} from '@aws-sdk/client-s3';
import {RenderMetadata} from '../../shared/constants';
import {getExpectedOutName} from './expected-out-name';
import {getCurrentRegionInFunction} from './get-current-region';

export const findOutputFileInBucket = ({
	contents,
	renderMetadata,
	bucketName,
	renderId,
	type,
}: {
	contents: _Object[];
	renderMetadata: RenderMetadata | null;
	bucketName: string;
	renderId: string;
	type: 'still' | 'video';
}): {
	url: string;
	size: number;
	lastModified: number;
} | null => {
	const expectedOutName =
		renderMetadata === null ? null : getExpectedOutName(renderMetadata);

	const output = expectedOutName
		? renderMetadata
			? contents.find((c) => c.Key?.includes(expectedOutName)) ?? null
			: null
		: null;

	if (!output) {
		return null;
	}

	if (!renderMetadata) {
		throw new Error('unexpectedly did not get renderMetadata');
	}

	return {
		lastModified: output.LastModified?.getTime() as number,
		size: output.Size as number,
		url: `https://s3.${getCurrentRegionInFunction()}.amazonaws.com/${bucketName}/${expectedOutName}`,
	};
};
