import type {RenderMetadata} from '../../defaults';
import {getExpectedOutName} from './expected-out-name';
import {getCurrentRegionInFunction} from './get-current-region';

export const getOutputUrlFromMetadata = (
	renderMetadata: RenderMetadata,
	bucketName: string
) => {
	const outname = getExpectedOutName(renderMetadata, bucketName);
	return `https://s3.${getCurrentRegionInFunction()}.amazonaws.com/${
		outname.renderBucketName
	}/${outname.key}`;
};
