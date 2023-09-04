/* eslint-disable no-undef */
import {RenderExpiryDays, getRenderProgress} from '@remotion/lambda/client';
import dotenv from 'dotenv';
dotenv.config();
const {overallProgress} = await getRenderProgress({
	renderId: '46obvm7srq',
	bucketName: process.env.BUCKET_NAME ?? '',
	functionName: process.env.FUNCTION_NAME ?? '',
	region: 'us-east-1',
	renderFolderExpiry: RenderExpiryDays.AFTER_1_DAYS,
});

console.log(`Render progress ${overallProgress}`);
