import fs from 'node:fs';
import path from 'node:path';
import {expect, test} from 'vitest';

// Test for https://github.com/remotion-dev/remotion/issues/1243
test('Should not have disableRemotePlayback props in the <VideoForPreview> component type definition', () => {
	const file = path.resolve(
		process.cwd(),
		'dist',
		'esm',
		'video',
		'VideoForPreview.d.ts',
	);
	const read = fs.readFileSync(file, 'utf-8');
	expect(read).not.toContain('disableRemotePlayback');
	expect(read).toContain('volume-prop');
});

test('Should not have disableRemotePlayback props in the <VideoForPreview> component type definition', () => {
	const file = path.resolve(
		process.cwd(),
		'dist',
		'esm',
		'video',
		'VideoForPreview.d.ts',
	);
	const read = fs.readFileSync(file, 'utf-8');
	expect(read).not.toContain('disableRemotePlayback');
	expect(read).toContain('volume-prop');
});

test('Should not have disableRemotePlayback props in the <AudioForDevelopment> component type definition', () => {
	const file = path.resolve(
		process.cwd(),
		'dist',
		'esm',
		'audio',
		'AudioForDevelopment.d.ts',
	);
	const read = fs.readFileSync(file, 'utf-8');
	expect(read).not.toContain('aria-disabled');
	expect(read).toContain('volume-prop');
});

test('Should not have disableRemotePlayback props in the <AudioForRendering> component type definition', () => {
	const file = path.resolve(
		process.cwd(),
		'dist',
		'esm',
		'audio',
		'AudioForRendering.d.ts',
	);
	const read = fs.readFileSync(file, 'utf-8');
	expect(read).not.toContain('aria-disabled');
	expect(read).toContain('volume-prop');
});
