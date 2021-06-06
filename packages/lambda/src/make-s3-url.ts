// TODO: Do it with HTTPS, but wait for certificate

import {REGION} from './constants';

export const makeS3Url = (bucketName: string, subFolder: string): string => {
	return `https://${bucketName}.s3.${REGION}.amazonaws.com/${subFolder}`;
};
