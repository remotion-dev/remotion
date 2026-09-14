import {expect, test} from 'bun:test';
import {spawnSync} from 'child_process';
import {mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync} from 'fs';
import {tmpdir} from 'os';
import path from 'path';

test('upload-element-preview creates unique versions without overwriting', () => {
	const temporaryDirectory = mkdtempSync(
		path.join(tmpdir(), 'remotion-upload-element-preview-'),
	);

	try {
		const uploaderPath = path.join(
			__dirname,
			'..',
			'..',
			'upload-element-preview.ts',
		);
		const uploaderSource = readFileSync(uploaderPath, 'utf8');
		const runnerSource = uploaderSource.replace(
			"from './src/components/Elements/element-definitions';",
			"from './element-definitions';",
		);
		expect(runnerSource).not.toBe(uploaderSource);

		const runnerPath = path.join(
			temporaryDirectory,
			'upload-element-preview.ts',
		);
		writeFileSync(runnerPath, runnerSource);
		writeFileSync(
			path.join(temporaryDirectory, 'element-definitions.ts'),
			`export const elementDefinitions = [
	{
		slug: 'test/example',
		preview: {
			posterUrl: process.env.TEST_POSTER_URL,
			videoUrl: process.env.TEST_VIDEO_URL,
		},
	},
];
`,
		);

		const previewDirectory = path.join(
			temporaryDirectory,
			'.element-previews',
			'test',
			'example',
		);
		mkdirSync(previewDirectory, {recursive: true});
		writeFileSync(
			path.join(previewDirectory, 'preview.png'),
			Uint8Array.from([
				0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0,
			]),
		);
		writeFileSync(
			path.join(previewDirectory, 'preview.mp4'),
			Uint8Array.from([0, 0, 0, 8, 0x66, 0x74, 0x79, 0x70, 0, 0, 0, 0]),
		);

		const expectedLocalPosterUrl = '/elements/test-example-preview.png';
		const expectedLocalVideoUrl = '/elements/test-example-preview.mp4';
		const expectedHostedPosterUrl =
			'https://remotion.media/elements/test-example-preview.png';
		const expectedHostedVideoUrl =
			'https://remotion.media/elements/test-example-preview.mp4';
		const versionedHostedPosterUrl =
			'https://remotion.media/elements/test-example-preview-23ebc740-62e6-4ad5-987a-77f22c27cd42.png';
		const versionedHostedVideoUrl =
			'https://remotion.media/elements/test-example-preview-23ebc740-62e6-4ad5-987a-77f22c27cd42.mp4';
		const runUpload = ({
			args,
			posterUrl,
			videoUrl,
		}: {
			args: string[];
			posterUrl: string;
			videoUrl: string;
		}) =>
			spawnSync(process.execPath, [runnerPath, ...args], {
				cwd: temporaryDirectory,
				encoding: 'utf8',
				env: {
					...process.env,
					AWS_ACCESS_KEY_ID: '',
					TEST_POSTER_URL: posterUrl,
					TEST_VIDEO_URL: videoUrl,
				},
			});

		const helpResult = runUpload({
			args: ['--help'],
			posterUrl: expectedHostedPosterUrl,
			videoUrl: expectedHostedVideoUrl,
		});
		expect(helpResult.status).toBe(0);
		expect(helpResult.stdout).not.toContain('--overwrite');
		expect(helpResult.stdout).toContain(
			'Each upload gets a unique URL so previews from concurrent branches cannot overwrite each other.',
		);

		const localReviewResult = runUpload({
			args: ['--element=test/example', '--source=render'],
			posterUrl: expectedLocalPosterUrl,
			videoUrl: expectedLocalVideoUrl,
		});
		expect(localReviewResult.status).toBe(1);
		expect(localReviewResult.stderr).toContain(
			'Uploading requires AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY',
		);

		for (const hostedUrls of [
			{
				posterUrl: expectedHostedPosterUrl,
				videoUrl: expectedHostedVideoUrl,
			},
			{
				posterUrl: versionedHostedPosterUrl,
				videoUrl: versionedHostedVideoUrl,
			},
		]) {
			const hostedResult = runUpload({
				args: ['--element=test/example', '--source=render'],
				...hostedUrls,
			});
			expect(hostedResult.status).toBe(1);
			expect(hostedResult.stderr).toContain(
				'Uploading requires AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY',
			);
		}

		const overwriteResult = runUpload({
			args: ['--element=test/example', '--source=render', '--overwrite'],
			posterUrl: expectedHostedPosterUrl,
			videoUrl: expectedHostedVideoUrl,
		});
		expect(overwriteResult.status).toBe(1);
		expect(overwriteResult.stderr).toContain(
			'--overwrite is no longer supported',
		);

		for (const rejectedUrls of [
			{
				posterUrl: 'https://remotion.media/elements/test-other-preview.png',
				videoUrl: expectedHostedVideoUrl,
			},
			{
				posterUrl: expectedHostedPosterUrl,
				videoUrl: 'https://remotion.media/elements/test-other-preview.mp4',
			},
			{
				posterUrl: 'https://example.com/elements/test-example-preview.png',
				videoUrl: expectedHostedVideoUrl,
			},
			{
				posterUrl: versionedHostedPosterUrl,
				videoUrl:
					'https://remotion.media/elements/test-example-preview-different.mp4',
			},
		]) {
			const rejectedResult = runUpload({
				args: ['--element=test/example', '--source=render'],
				posterUrl: rejectedUrls.posterUrl,
				videoUrl: rejectedUrls.videoUrl,
			});
			expect(rejectedResult.status).toBe(1);
			expect(rejectedResult.stderr).toContain(
				'must use either its exact local review URLs',
			);
		}
	} finally {
		rmSync(temporaryDirectory, {force: true, recursive: true});
	}
});
