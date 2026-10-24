import {expect, test} from 'bun:test';
import {fileURLToPath} from 'node:url';
import ts from 'typescript';
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
	const sources = new Map<string, string>();
	for (const componentName of [
		'Video',
		'Sequence',
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
		sources.set(
			fileURLToPath(
				new URL(`./generated-${componentName}.tsx`, import.meta.url),
			),
			generated.source!,
		);
	}

	const options: ts.CompilerOptions = {
		strict: true,
		noEmit: true,
		noUnusedLocals: true,
		skipLibCheck: true,
		types: [],
		target: ts.ScriptTarget.ES2022,
		module: ts.ModuleKind.ESNext,
		moduleResolution: ts.ModuleResolutionKind.Bundler,
		jsx: ts.JsxEmit.ReactJSX,
		esModuleInterop: true,
		paths: {
			remotion: [
				fileURLToPath(new URL('../../../core/src/index.ts', import.meta.url)),
			],
			'@remotion/media': [
				fileURLToPath(new URL('../../../media/src/index.ts', import.meta.url)),
			],
		},
	};
	const host = ts.createCompilerHost(options);
	const originalGetSourceFile = host.getSourceFile.bind(host);
	host.getSourceFile = (
		fileName,
		languageVersion,
		onError,
		shouldCreateNewSourceFile,
	) => {
		const source = sources.get(fileName);
		return source === undefined
			? originalGetSourceFile(
					fileName,
					languageVersion,
					onError,
					shouldCreateNewSourceFile,
				)
			: ts.createSourceFile(
					fileName,
					source,
					languageVersion,
					true,
					ts.ScriptKind.TSX,
				);
	};

	const program = ts.createProgram([...sources.keys()], options, host);
	const diagnostics = [...sources.keys()].flatMap((fileName) => {
		const source = program.getSourceFile(fileName)!;
		return [
			...program.getSyntacticDiagnostics(source),
			...program.getSemanticDiagnostics(source),
		];
	});
	expect(
		diagnostics.map((diagnostic) =>
			ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'),
		),
	).toEqual([]);
});
