import {existsSync, readdirSync, readFileSync} from 'node:fs';
import path from 'node:path';
import {VERSION} from 'remotion/version';
import type {MockFile, uploadDir as original} from '../../api/upload-dir';
import {writeMockS3File} from './mock-store';

const mockIndexHtml = `<!DOCTYPE html>
<html lang="en">
<head><title>Test</title></head>
<body>
<script>window.remotion_publicPath = "./";</script>
<script>
	window.siteVersion = '11';
	window.remotion_version = '${VERSION}';
</script>
</body>
</html>`;

const getRealDirFiles = (dir: string, rootDir: string): MockFile[] => {
	return readdirSync(dir, {withFileTypes: true}).flatMap((entry) => {
		const absolutePath = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			return getRealDirFiles(absolutePath, rootDir);
		}

		return [
			{
				name: path.relative(rootDir, absolutePath).split(path.sep).join('/'),
				content: readFileSync(absolutePath, 'utf8'),
			},
		];
	});
};

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

	if (existsSync(dir)) {
		return getRealDirFiles(dir, dir);
	}

	throw new Error('could not get dir for ' + dir);
};

export const mockUploadDir: typeof original = async (input) => {
	const files = getDirFiles(input.localDir).filter((file) =>
		input.toUpload.includes(file.name),
	);
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
