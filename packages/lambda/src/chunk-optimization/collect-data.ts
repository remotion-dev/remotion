import {LAMBDA_INITIALIZED_KEY} from '../constants';
import {lambdaLs, lambdaReadFile} from '../io';
import {streamToString} from '../stream-to-string';
import {ChunkTimingData} from './types';

export const collectChunkInformation = async (bucketName: string) => {
	const files = await lambdaLs({
		bucketName,
		forceS3: true,
	});
	const timingFiles = files.filter((f) =>
		f.Key?.startsWith(LAMBDA_INITIALIZED_KEY)
	);
	const timingFileContents = await Promise.all(
		timingFiles.map(async (file) => {
			const contents = await lambdaReadFile({
				bucketName,
				key: file.Key as string,
			});
			const string = await streamToString(contents);
			return JSON.parse(string) as ChunkTimingData;
		})
	);
	return timingFileContents;
};
