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
