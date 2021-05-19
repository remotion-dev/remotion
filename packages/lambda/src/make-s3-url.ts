// TODO: Do it with HTTPS, but wait for certificate

import {REGION} from './constants';

export const makeS3Url = (bucketName: string): string => {
	return `http://${bucketName}.s3.${REGION}.amazonaws.com`;
};
