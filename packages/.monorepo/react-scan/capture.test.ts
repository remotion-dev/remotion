import {expect, test} from 'bun:test';
import {mkdtemp, readdir, readFile, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';

const repositoryRoot = path.resolve(import.meta.dir, '../../..');

test('starts a capture and records the Studio React version', async () => {
	const outputRoot = await mkdtemp(
		path.join(tmpdir(), 'remotion-react-scan-capture-'),
	);
	const capture = Bun.spawn(
		[
			'bun',
			path.join(import.meta.dir, 'capture.ts'),
			'--no-studio',
			'--output-root',
			outputRoot,
			'--label',
			'test',
		],
		{
			cwd: repositoryRoot,
			stderr: 'pipe',
			stdout: 'pipe',
		},
	);

	try {
		const reader = capture.stdout.getReader();
		const decoder = new TextDecoder();
		let output = '';
		while (!output.includes('Press Ctrl+C to stop')) {
			const chunk = await reader.read();
			if (chunk.done) {
				break;
			}
			output += decoder.decode(chunk.value, {stream: true});
		}

		expect(output).toContain('Press Ctrl+C to stop');
		capture.kill('SIGINT');
		const exitCode = await capture.exited;
		const stderr = await new Response(capture.stderr).text();
		expect(stderr).toBe('');
		expect(exitCode).toBe(0);

		const entries = await readdir(outputRoot, {withFileTypes: true});
		const captureDirectory = entries.find((entry) => entry.isDirectory());
		expect(captureDirectory).toBeDefined();

		const metadata = JSON.parse(
			await readFile(
				path.join(outputRoot, captureDirectory!.name, 'metadata.json'),
				'utf8',
			),
		) as {eventCount: number; versions: {react: string}};
		const studioReactPackage = JSON.parse(
			await readFile(
				path.join(
					repositoryRoot,
					'packages',
					'example',
					'node_modules',
					'react',
					'package.json',
				),
				'utf8',
			),
		) as {version: string};

		expect(metadata.eventCount).toBe(0);
		expect(metadata.versions.react).toBe(studioReactPackage.version);
	} finally {
		capture.kill();
		await rm(outputRoot, {force: true, recursive: true});
	}
});
