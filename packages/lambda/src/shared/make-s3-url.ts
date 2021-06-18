// TODO: wait for certificate

import {REGION} from './constants';

export const makeS3Url = (bucketName: string, subFolder: string): string => {
	return `https://${bucketName}.s3.${REGION}.amazonaws.com/${subFolder}`;
};

// TODO: Instead of site ID, could also just make a hash
export const getSiteId = (url: string) => {
	const match = url.match(
		/https:\/\/(.*)\.s3\.(.*)\.amazonaws\.com\/sites\/(.*)/
	);

	if (!match) {
		throw new Error('invalid aws url ' + url);
	}

	const lastPart = match[3];

	const siteId =
		lastPart.indexOf('/') === -1
			? lastPart
			: lastPart.substr(0, lastPart.indexOf('/'));

	return {
		bucketName: match[1],
		// TODO: is wrong
		region: match[2],
		siteId,
	};
};
