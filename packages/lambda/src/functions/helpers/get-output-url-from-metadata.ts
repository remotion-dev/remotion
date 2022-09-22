import type {OutNameInput, RenderMetadata} from '../../defaults';
import {getExpectedOutName} from './expected-out-name';
import {getCurrentRegionInFunction} from './get-current-region';

export const getOutputUrlFromMetadata = (
	renderMetadata: RenderMetadata,
	bucketName: string,
	outName: OutNameInput | null
) => {
	const outname = getExpectedOutName(renderMetadata, bucketName, outName);
	return `https://s3.${getCurrentRegionInFunction()}.amazonaws.com/${
		outname.renderBucketName
	}/${outname.key}`;
};
