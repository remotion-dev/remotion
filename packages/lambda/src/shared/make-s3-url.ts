// TODO: wait for certificate

import {AwsRegion} from '../pricing/aws-regions';

export const makeS3Url = ({
	bucketName,
	subFolder,
	region,
}: {
	bucketName: string;
	subFolder: string;
	region: AwsRegion;
}): string => {
	return `https://${bucketName}.s3.${region}.amazonaws.com/${subFolder}`;
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
