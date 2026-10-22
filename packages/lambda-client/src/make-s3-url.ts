import {getAwsRegionMetadata} from './aws-region-metadata';
import type {AwsRegion} from './regions';

export const makeS3ServeUrl = ({
	bucketName,
	subFolder,
	region,
}: {
	bucketName: string;
	subFolder: string;
	region: AwsRegion;
}): string => {
	const {dnsSuffix} = getAwsRegionMetadata(region);
	return `https://${bucketName}.s3.${region}.${dnsSuffix}/${subFolder}/index.html`;
};
