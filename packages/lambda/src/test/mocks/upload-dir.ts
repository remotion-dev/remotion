import {VERSION} from 'remotion/version';
import type {MockFile, uploadDir as original} from '../../api/upload-dir';
import {writeMockS3File} from './mock-store';

const mockIndexHtml = `<!DOCTYPE html>
<html lang="en">
<head><title>Test</title></head>
<body>
<script>
	window.siteVersion = '11';
	window.remotion_version = '${VERSION}';
</script>
</body>
</html>`;

export const getDirFiles = (dir: string): MockFile[] => {
	if (dir === '/path/to/bundle-1') {
		return [
			{
				name: 'index.html',
				content: mockIndexHtml,
			},
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

	if (dir === '/path/to/bundle-2') {
		return [
			{
				name: 'index.html',
				content: mockIndexHtml,
			},
			{
				name: 'bundle.js',
				content: 'console.log("Hello World")',
			},
			{
				name: 'styles2.css',
				content: 'body {background: red}',
			},
		];
	}

	throw new Error('could not get dir for ' + dir);
};

export const mockUploadDir: typeof original = async (input) => {
	const files = getDirFiles(input.localDir);
	for (const file of files) {
		await writeMockS3File({
			privacy: input.privacy,
			bucketName: input.bucket,
			body: file.content,
			// Should not use path.join here because on Windows it's not / separator
			key: [input.keyPrefix, file.name].join('/'),
			region: input.region,
		});
	}

	return Promise.resolve();
};
