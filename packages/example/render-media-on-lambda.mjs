/* eslint-disable no-undef */
import {RenderExpiryDays, renderMediaOnLambda} from '@remotion/lambda/client';
import dotenv from 'dotenv';
dotenv.config();

const {bucketName, renderId} = await renderMediaOnLambda({
	serveUrl: process.env.SERVE_URL ?? '',
	bucketName: process.env.BUCKET_NAME ?? '',
	functionName: process.env.FUNCTION_NAME ?? '',
	composition: 'react-svg',
	region: 'us-east-1',
	colorSpace: 'default',
	codec: 'h264',
	renderFolderExpiryInDays: RenderExpiryDays.AFTER_1_DAYS,
});

console.log(
	`Render initiated it is in this bucket=${bucketName} and the id=${renderId}`,
);
