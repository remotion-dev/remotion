import crypto from 'crypto';
import type {AwsRegion} from '../pricing/aws-regions';

export const makeS3ServeUrl = ({
	bucketName,
	subFolder,
	region,
}: {
	bucketName: string;
	subFolder: string;
	region: AwsRegion;
}): string => {
	return `https://${bucketName}.s3.${region}.amazonaws.com/${subFolder}/index.html`;
};

const hashCache: {[key: string]: string} = {};

export const getServeUrlHash = (url: string) => {
	if (hashCache[url]) {
		return hashCache[url];
	}

	const hash = crypto.createHash('md5').update(url).digest('hex');

	hashCache[url] = hash;

	return hash;
};
