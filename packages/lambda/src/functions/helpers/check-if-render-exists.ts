import type {_Object} from '@aws-sdk/client-s3';
import type {AwsRegion} from '../../client';
import {initalizedMetadataKey} from '../../shared/constants';

export const checkIfRenderExists = (
	contents: _Object[],
	renderId: string,
	bucketName: string,
	region: AwsRegion
) => {
	const initializedExists = Boolean(
		contents.find((c) => {
			return c.Key?.startsWith(initalizedMetadataKey(renderId));
		})
	);

	if (!initializedExists) {
		throw new TypeError(
			`No render with ID "${renderId}" found in bucket ${bucketName} and region ${region}`
		);
	}
};
