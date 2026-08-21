import {expect, test} from 'bun:test';
import {spawnSync} from 'child_process';
import {mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync} from 'fs';
import {tmpdir} from 'os';
import path from 'path';

test('upload-element-preview only overwrites the exact hosted preview URLs', () => {
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
			`export const elementDefinitions = {
	fixture: {
		slug: 'test/example',
		preview: {
			posterUrl: process.env.TEST_POSTER_URL,
			videoUrl: process.env.TEST_VIDEO_URL,
		},
	},
};
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
		expect(helpResult.stdout).toContain('[--overwrite]');
		expect(helpResult.stdout).toContain(
			'only when the definition uses its exact https://remotion.media/elements/... URLs',
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

		const protectedHostedResult = runUpload({
			args: ['--element=test/example', '--source=render'],
			posterUrl: expectedHostedPosterUrl,
			videoUrl: expectedHostedVideoUrl,
		});
		expect(protectedHostedResult.status).toBe(1);
		expect(protectedHostedResult.stderr).toContain(
			'must use its exact local review URLs',
		);

		const overwriteResult = runUpload({
			args: ['--element=test/example', '--source=render', '--overwrite'],
			posterUrl: expectedHostedPosterUrl,
			videoUrl: expectedHostedVideoUrl,
		});
		expect(overwriteResult.status).toBe(1);
		expect(overwriteResult.stderr).toContain(
			'Uploading requires AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY',
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
		]) {
			const rejectedOverwriteResult = runUpload({
				args: ['--element=test/example', '--source=render', '--overwrite'],
				posterUrl: rejectedUrls.posterUrl,
				videoUrl: rejectedUrls.videoUrl,
			});
			expect(rejectedOverwriteResult.status).toBe(1);
			expect(rejectedOverwriteResult.stderr).toContain(
				'cannot be overwritten because its preview URLs do not exactly match',
			);
		}
	} finally {
		rmSync(temporaryDirectory, {force: true, recursive: true});
	}
});
