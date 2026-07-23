import {expect, test} from 'bun:test';
import {
	formatFileLocation,
	formatLocationForAgents,
} from '../helpers/format-file-location';

test('Should format file locations relative to the project root', () => {
	expect(
		formatFileLocation({
			location: {
				source: '/Users/example/video/src/Root.tsx',
				line: 42,
			},
			root: '/Users/example/video',
		}),
	).toBe('src/Root.tsx:42');
});

test('Should remove leading dot slash from relative file locations', () => {
	expect(
		formatFileLocation({
			location: {
				source: '/Users/example/video/./src/Root.tsx',
				line: 42,
			},
			root: '/Users/example/video',
		}),
	).toBe('src/Root.tsx:42');
});

test('Should format Windows file locations relative to the project root', () => {
	expect(
		formatFileLocation({
			location: {
				source: 'C:\\Users\\example\\video\\src\\Root.tsx',
				line: 42,
			},
			root: 'c:\\Users\\example\\video\\',
		}),
	).toBe('src/Root.tsx:42');
});

test('Should keep absolute file locations outside the project root', () => {
	expect(
		formatFileLocation({
			location: {
				source: '/Users/example/other/Root.tsx',
				line: 42,
			},
			root: '/Users/example/video',
		}),
	).toBe('/Users/example/other/Root.tsx:42');
});

test('Should not format missing file locations', () => {
	expect(
		formatFileLocation({
			location: {
				source: null,
				line: 42,
			},
			root: '/Users/example/video',
		}),
	).toBe(null);
	expect(
		formatFileLocation({
			location: {
				source: '/Users/example/video/src/Root.tsx',
				line: null,
			},
			root: '/Users/example/video',
		}),
	).toBe(null);
});

test('Should format composition locations for agents', () => {
	expect(
		formatLocationForAgents({
			location: {
				source: '/Users/example/video/src/Root.tsx',
				line: 399,
			},
			name: 'keyframed-props-test',
			root: '/Users/example/video',
		}),
	).toBe('keyframed-props-test in src/Root.tsx:399');
});

test('Should format component locations for agents', () => {
	expect(
		formatLocationForAgents({
			location: {
				source: '/Users/example/video/src/KeyframesPropsTest.tsx',
				line: 67,
			},
			name: '<AnimatedImage>',
			root: '/Users/example/video',
		}),
	).toBe('<AnimatedImage> in src/KeyframesPropsTest.tsx:67');
});
