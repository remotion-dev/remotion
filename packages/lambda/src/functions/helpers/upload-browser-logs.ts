import {BrowserLog} from '@remotion/renderer';
import {lambdaLogsPrefix} from '../../defaults';
import {getCurrentRegionInFunction} from './get-current-region';
import {lambdaWriteFile} from './io';

export const uploadBrowserLogs = async ({
	bucketName,
	endFrame,
	expectedBucketOwner,
	logs,
	renderId,
	startFrame,
}: {
	bucketName: string;
	logs: BrowserLog[];
	expectedBucketOwner: string | null;
	renderId: string;
	startFrame: number;
	endFrame: number;
}) => {
	await lambdaWriteFile({
		bucketName,
		body: JSON.stringify(logs, null, 2),
		expectedBucketOwner,
		key: lambdaLogsPrefix(renderId, startFrame, endFrame),
		privacy: 'private',
		region: getCurrentRegionInFunction(),
	});
};
