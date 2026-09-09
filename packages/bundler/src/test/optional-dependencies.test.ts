import {expect, test} from 'bun:test';
import {AllowOptionalDependenciesPlugin} from '../optional-dependencies';

const missingOptionalPackageError = (packageName: string, issuer: string) => {
	return Object.assign(
		new Error(`Can't resolve '${packageName}' in '/project'`),
		{module: {resource: issuer}},
	);
};

test('allows Studio to omit its optional AI capabilities', () => {
	const plugin = new AllowOptionalDependenciesPlugin();
	for (const packageName of [
		'@remotion/whisper-webgpu',
		'@remotion/video-matting',
	]) {
		expect(
			plugin.filter(
				missingOptionalPackageError(
					packageName,
					'/project/node_modules/@remotion/studio/dist/esm/chunk.js',
				),
			),
		).toBe(false);
	}
});

test('does not hide missing optional AI package imports in user code', () => {
	const plugin = new AllowOptionalDependenciesPlugin();
	for (const packageName of [
		'@remotion/whisper-webgpu',
		'@remotion/video-matting',
	]) {
		expect(
			plugin.filter(
				missingOptionalPackageError(packageName, '/project/src/Video.tsx'),
			),
		).toBe(true);
	}
});
