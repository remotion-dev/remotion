import path from 'path';
import {uploadDir as original} from '../upload-dir';
import {mockS3Upload} from './mock-s3';

type MockFile = {
	name: string;
	content: string;
};

const getDirFiles = (dir: string): MockFile[] => {
	if (dir === '/path/to/bundle-1') {
		return [
			{
				name: 'bundle.js',
				content: 'console.log("Hello World")',
			},
			{
				name: 'styles.css',
				content: 'body {background: red}',
			},
		];
	}

	return [];
};

export const uploadDir: typeof original = async (input) => {
	const files = getDirFiles(input.dir);
	for (const file of files) {
		mockS3Upload({
			acl: 'public-read',
			bucketName: input.bucket,
			content: file.content,
			key: path.join(input.folder, file.name),
			region: input.region,
		});
	}

	return Promise.resolve();
};
