import {getOrCreateBucket} from '../api/get-or-create-bucket';
import type {AwsRegion} from '../pricing/aws-regions';
import {DOCS_URL} from './docs-url';

export const convertToServeUrl = async (urlOrId: string, region: AwsRegion) => {
	if (urlOrId.startsWith('src/')) {
		throw new Error(
			`Remotion Lambda can only render based on a URL in the cloud. It seems like you passed a local file: ${urlOrId}. Read the setup guide for Remotion Lambda ${DOCS_URL}/docs/lambda/setup`
		);
	}

	if (urlOrId.startsWith('http://') || urlOrId.startsWith('https://')) {
		return urlOrId;
	}

	const {bucketName} = await getOrCreateBucket({
		region,
	});

	return `https://${bucketName}.s3.${region}.amazonaws.com/sites/${urlOrId}/index.html`;
};
