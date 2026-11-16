import {expect, test} from 'bun:test';
import {spawnSync} from 'node:child_process';
import {mkdtempSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {generateOpenTimelineComposition} from '../open-timeline/generate';

test('generated OTIO markup typechecks against the workspace Remotion components', () => {
	const time = (value: number) => ({
		OTIO_SCHEMA: 'RationalTime.1',
		value,
		rate: 24,
	});
	const range = (start: number, duration: number) => ({
		OTIO_SCHEMA: 'TimeRange.1',
		start_time: time(start),
		duration: time(duration),
	});
	const clip = (targetUrl: string, effects: unknown[] = []) => ({
		OTIO_SCHEMA: 'Clip.1',
		name: targetUrl,
		source_range: range(24, 48),
		effects,
		media_reference: {
			OTIO_SCHEMA: 'ExternalReference.1',
			target_url: targetUrl,
			available_range: range(0, 2400),
		},
	});
	const transition = {
		OTIO_SCHEMA: 'Transition.1',
		transition_type: 'SMPTE_Dissolve',
		in_offset: time(6),
		out_offset: time(6),
	};
	const timeline = {
		OTIO_SCHEMA: 'Timeline.1',
		tracks: {
			OTIO_SCHEMA: 'Stack.1',
			children: [
				{
					OTIO_SCHEMA: 'Track.1',
					kind: 'Video',
					children: [
						clip('video.mp4', [
							{OTIO_SCHEMA: 'LinearTimeWarp.1', time_scalar: 2},
						]),
						transition,
						clip('still.png'),
						clip('freeze.mp4', [{OTIO_SCHEMA: 'FreezeFrame.1'}]),
						{
							OTIO_SCHEMA: 'Clip.1',
							source_range: range(0, 48),
							media_reference: {
								OTIO_SCHEMA: 'ImageSequenceReference.1',
								target_url_base: 'frames',
								available_range: range(0, 48),
								name_prefix: 'frame-',
								name_suffix: '.png',
								start_frame: 1001,
								frame_step: 1,
								frame_zero_padding: 4,
								rate: 24,
							},
						},
					],
				},
				{
					OTIO_SCHEMA: 'Track.1',
					kind: 'Audio',
					children: [clip('first.wav'), transition, clip('second.wav')],
				},
			],
		},
	};
	const projectDir = mkdtempSync(path.join(tmpdir(), 'remotion-otio-types-'));
	try {
		const fileNames: string[] = [];
		for (const componentName of [
			'Video',
			'Sequence',
			'Track',
			'CanvasImage',
			'AbsoluteFill',
		]) {
			const generated = generateOpenTimelineComposition({
				timeline,
				componentName,
				fps: 30,
				width: 1920,
				height: 1080,
			});
			expect(generated.diagnostics).toEqual([]);
			expect(generated.source).not.toBeNull();
			const fileName = `generated-${componentName}.tsx`;
			writeFileSync(path.join(projectDir, fileName), generated.source!);
			fileNames.push(fileName);
		}

		writeFileSync(
			path.join(projectDir, 'tsconfig.json'),
			JSON.stringify({
				compilerOptions: {
					strict: true,
					noEmit: true,
					noUnusedLocals: true,
					skipLibCheck: true,
					types: [],
					target: 'ES2022',
					module: 'ESNext',
					moduleResolution: 'Bundler',
					jsx: 'react-jsx',
					esModuleInterop: true,
					paths: {
						react: [
							fileURLToPath(
								new URL(
									'../../../../node_modules/@types/react',
									import.meta.url,
								),
							),
						],
						'react/*': [
							fileURLToPath(
								new URL(
									'../../../../node_modules/@types/react/*',
									import.meta.url,
								),
							),
						],
						remotion: [
							fileURLToPath(
								new URL('../../../core/src/index.ts', import.meta.url),
							),
						],
						'@remotion/media': [
							fileURLToPath(
								new URL('../../../media/src/index.ts', import.meta.url),
							),
						],
					},
				},
				files: fileNames,
			}),
		);

		const tsc = spawnSync(
			'node',
			[
				fileURLToPath(
					new URL('../../node_modules/typescript/bin/tsc', import.meta.url),
				),
				'--project',
				projectDir,
				'--pretty',
				'false',
			],
			{cwd: projectDir, encoding: 'utf8'},
		);
		expect(tsc.error).toBeUndefined();
		expect(tsc.stderr).toBe('');
		// Workspace sources report unrelated diagnostics under these options,
		// so only diagnostics for the generated files are relevant.
		expect(
			tsc.stdout
				.split('\n')
				.filter((line) =>
					fileNames.some((fileName) => line.startsWith(`${fileName}(`)),
				),
		).toEqual([]);
	} finally {
		rmSync(projectDir, {recursive: true, force: true});
	}
});
