import {expect, test} from 'bun:test';
import {AllowOptionalDependenciesPlugin} from '../optional-dependencies';

const missingWhisperError = (issuer: string) => {
	return Object.assign(
		new Error("Can't resolve '@remotion/whisper-webgpu' in '/project'"),
		{module: {resource: issuer}},
	);
};

test('allows Studio to omit its optional Whisper WebGPU capability', () => {
	const plugin = new AllowOptionalDependenciesPlugin();
	expect(
		plugin.filter(
			missingWhisperError(
				'/project/node_modules/@remotion/studio/dist/esm/chunk.js',
			),
		),
	).toBe(false);
});

test('does not hide missing Whisper WebGPU imports in user code', () => {
	const plugin = new AllowOptionalDependenciesPlugin();
	expect(plugin.filter(missingWhisperError('/project/src/Video.tsx'))).toBe(
		true,
	);
});
