import {expect, test} from 'bun:test';
import {getDefaultOutLocation} from '../get-default-out-name';

test('Should return out/compositionName.ext for default case', () => {
	expect(
		getDefaultOutLocation({
			compositionName: 'HelloWorld',
			defaultExtension: 'mp4',
			type: 'asset',
			compositionDefaultOutName: null,
		}),
	).toBe('out/HelloWorld.mp4');
});

test('Should return out/compositionName for sequence type', () => {
	expect(
		getDefaultOutLocation({
			compositionName: 'HelloWorld',
			defaultExtension: 'png',
			type: 'sequence',
			compositionDefaultOutName: null,
		}),
	).toBe('out/HelloWorld');
});

test('Should use compositionDefaultOutName when provided', () => {
	expect(
		getDefaultOutLocation({
			compositionName: 'HelloWorld',
			defaultExtension: 'mp4',
			type: 'asset',
			compositionDefaultOutName: 'custom-name',
		}),
	).toBe('out/custom-name.mp4');
});

test('compositionDefaultOutName with subdirectory', () => {
	expect(
		getDefaultOutLocation({
			compositionName: 'HelloWorld',
			defaultExtension: 'mp4',
			type: 'asset',
			compositionDefaultOutName: 'renders/my-video',
		}),
	).toBe('out/renders/my-video.mp4');
});

test('compositionDefaultOutName for sequence type', () => {
	expect(
		getDefaultOutLocation({
			compositionName: 'HelloWorld',
			defaultExtension: 'png',
			type: 'sequence',
			compositionDefaultOutName: 'my-sequence',
		}),
	).toBe('out/my-sequence');
});

test('Result always starts with out/', () => {
	const cases = [
		{compositionDefaultOutName: null, compositionName: 'MyComp'},
		{compositionDefaultOutName: 'custom', compositionName: 'MyComp'},
		{
			compositionDefaultOutName: 'nested/deep/name',
			compositionName: 'MyComp',
		},
	];

	for (const {compositionDefaultOutName, compositionName} of cases) {
		const result = getDefaultOutLocation({
			compositionName,
			defaultExtension: 'mp4',
			type: 'asset',
			compositionDefaultOutName,
		});
		expect(result.startsWith('out/')).toBe(true);
	}
});

test('Stripping out/ prefix works correctly for read-only studio use case', () => {
	const defaultOut = getDefaultOutLocation({
		compositionName: 'HelloWorld',
		defaultExtension: 'mp4',
		type: 'asset',
		compositionDefaultOutName: null,
	});

	const stripped = defaultOut.replace(/^out\//, '');
	expect(stripped).toBe('HelloWorld.mp4');
});

test('Stripping out/ prefix with compositionDefaultOutName', () => {
	const defaultOut = getDefaultOutLocation({
		compositionName: 'HelloWorld',
		defaultExtension: 'mp4',
		type: 'asset',
		compositionDefaultOutName: 'renders/my-video',
	});

	const stripped = defaultOut.replace(/^out\//, '');
	expect(stripped).toBe('renders/my-video.mp4');
});

test('outputLocation with full path replaces default entirely', () => {
	expect(
		getDefaultOutLocation({
			compositionName: 'HelloWorld',
			defaultExtension: 'mp4',
			type: 'asset',
			compositionDefaultOutName: null,
			outputLocation: 'renders/video.mp4',
		}),
	).toBe('renders/video.mp4');
});

test('outputLocation as directory uses it instead of out/', () => {
	expect(
		getDefaultOutLocation({
			compositionName: 'HelloWorld',
			defaultExtension: 'mp4',
			type: 'asset',
			compositionDefaultOutName: null,
			outputLocation: 'renders',
		}),
	).toBe('renders/HelloWorld.mp4');
});

test('outputLocation as directory with trailing slash', () => {
	expect(
		getDefaultOutLocation({
			compositionName: 'HelloWorld',
			defaultExtension: 'mp4',
			type: 'asset',
			compositionDefaultOutName: null,
			outputLocation: 'renders/',
		}),
	).toBe('renders/HelloWorld.mp4');
});

test('outputLocation as directory respects compositionDefaultOutName', () => {
	expect(
		getDefaultOutLocation({
			compositionName: 'HelloWorld',
			defaultExtension: 'mp4',
			type: 'asset',
			compositionDefaultOutName: 'custom-name',
			outputLocation: 'renders',
		}),
	).toBe('renders/custom-name.mp4');
});

test('outputLocation as directory for sequence type', () => {
	expect(
		getDefaultOutLocation({
			compositionName: 'HelloWorld',
			defaultExtension: 'png',
			type: 'sequence',
			compositionDefaultOutName: null,
			outputLocation: 'renders',
		}),
	).toBe('renders/HelloWorld');
});

test('Fallback to out/ when outputLocation is null', () => {
	expect(
		getDefaultOutLocation({
			compositionName: 'HelloWorld',
			defaultExtension: 'mp4',
			type: 'asset',
			compositionDefaultOutName: null,
			outputLocation: null,
		}),
	).toBe('out/HelloWorld.mp4');
});
