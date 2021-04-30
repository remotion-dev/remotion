import {LambdaClient} from '@aws-sdk/client-lambda';
import {S3Client} from '@aws-sdk/client-s3';
import {REGION} from './constants';

export const s3Client = new S3Client({region: REGION});
export const lambdaClient = new LambdaClient({region: REGION});
