import {expect, test} from 'bun:test';
import path from 'node:path';
import {resolveOutputPath} from '../helpers/resolve-output-path';

const remotionRoot = '/home/user/my-project';

test('Should resolve path within out/ directory', () => {
	const result = resolveOutputPath(remotionRoot, 'out/HelloWorld.mp4');
	expect(result).toBe(path.join(remotionRoot, 'out/HelloWorld.mp4'));
});

test('Should resolve path with custom directory', () => {
	const result = resolveOutputPath(remotionRoot, 'renders/my-video.mp4');
	expect(result).toBe(path.join(remotionRoot, 'renders/my-video.mp4'));
});

test('Should resolve path without directory prefix', () => {
	const result = resolveOutputPath(remotionRoot, 'video.mp4');
	expect(result).toBe(path.join(remotionRoot, 'video.mp4'));
});

test('Should resolve nested directory paths', () => {
	const result = resolveOutputPath(
		remotionRoot,
		'out/nested/deep/video.mp4',
	);
	expect(result).toBe(
		path.join(remotionRoot, 'out/nested/deep/video.mp4'),
	);
});

test('Should reject paths that escape the project root', () => {
	expect(() => resolveOutputPath(remotionRoot, '../outside.mp4')).toThrow(
		/Not allowed to write/,
	);
});

test('Should reject paths with complex traversal', () => {
	expect(() =>
		resolveOutputPath(remotionRoot, 'out/../../outside.mp4'),
	).toThrow(/Not allowed to write/);
});

test('Should allow compositionDefaultOutName-style paths inside out/', () => {
	const result = resolveOutputPath(
		remotionRoot,
		'out/custom-comp-name.mp4',
	);
	expect(result).toBe(
		path.join(remotionRoot, 'out/custom-comp-name.mp4'),
	);
});
