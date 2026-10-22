import {expect, test} from 'bun:test';
import {mkdtemp, readFile, rm} from 'fs/promises';
import {tmpdir} from 'os';
import path from 'path';

const packageRoot = path.resolve(import.meta.dir, '..');

test('builds a crawlable media catalog and discovery files', async () => {
	const temporaryDirectory = await mkdtemp(
		path.join(tmpdir(), 'remotion-media-seo-'),
	);
	const outdir = path.join(temporaryDirectory, 'dist');
	const filesDir = path.join(temporaryDirectory, 'files');

	try {
		const buildProcess = Bun.spawn({
			cmd: [process.execPath, 'run', 'build.ts', `--outdir=${outdir}`],
			cwd: packageRoot,
			env: {
				...process.env,
				AWS_ACCESS_KEY_ID: '',
				AWS_SECRET_ACCESS_KEY: '',
				REMOTION_MEDIA_FILES_DIR: filesDir,
			},
			stderr: 'pipe',
			stdout: 'ignore',
		});
		const [exitCode, stderr] = await Promise.all([
			buildProcess.exited,
			new Response(buildProcess.stderr).text(),
		]);

		if (exitCode !== 0) {
			throw new Error(`Catalog build failed:\n${stderr}`);
		}

		const [html, robots, sitemap, llms] = await Promise.all([
			readFile(path.join(filesDir, 'index.html'), 'utf8'),
			readFile(path.join(filesDir, 'robots.txt'), 'utf8'),
			readFile(path.join(filesDir, 'sitemap.xml'), 'utf8'),
			readFile(path.join(filesDir, 'llms.txt'), 'utf8'),
		]);

		expect(html).toContain('<div id="root"><main');
		expect(html).toContain('Free audio and video files for testing');
		expect(html).toContain('video.mp4');
		expect(html).toContain('name="description"');
		expect(html).toContain(
			'<link rel="canonical" href="https://remotion.media/"',
		);
		expect(html).not.toContain('<div id="root"></div>');
		expect(robots).toContain('Sitemap: https://remotion.media/sitemap.xml');
		expect(sitemap).toContain('<loc>https://remotion.media/</loc>');
		expect(llms).toContain('# remotion.media');
	} finally {
		await rm(temporaryDirectory, {recursive: true, force: true});
	}
}, 30_000);
