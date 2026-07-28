import {afterEach, expect, test} from 'bun:test';
import type {BrowserStudioOperations} from '@remotion/studio-shared';
import {deleteStaticFile} from '../api/delete-static-file';
import {renameStaticFile} from '../api/rename-static-file';
import {writeStaticFile} from '../api/write-static-file';

const originalWindowDescriptor = Object.getOwnPropertyDescriptor(
	globalThis,
	'window',
);

afterEach(() => {
	if (originalWindowDescriptor) {
		Object.defineProperty(globalThis, 'window', originalWindowDescriptor);
		return;
	}

	Reflect.deleteProperty(globalThis, 'window');
});

test('routes static-file mutations through Browser Studio capabilities', async () => {
	const calls: string[] = [];
	const operations = {
		deleteStaticFile: ({relativePath}) => {
			calls.push(`delete:${relativePath}`);
			return Promise.resolve({success: true, existed: true});
		},
		renameStaticFile: ({oldRelativePath, newRelativePath}) => {
			calls.push(`rename:${oldRelativePath}:${newRelativePath}`);
			return Promise.resolve({success: true});
		},
		writeStaticFile: ({contents, filePath}) => {
			calls.push(`write:${filePath}:${String(contents)}`);
			return Promise.resolve();
		},
	} as BrowserStudioOperations;

	Object.defineProperty(globalThis, 'window', {
		configurable: true,
		value: {
			remotion_browserStudio: operations,
			remotion_isPlayer: false,
			remotion_isReadOnlyStudio: true,
			remotion_isStudio: true,
			remotion_staticBase: '/static-abcdef',
		},
	});

	await writeStaticFile({contents: 'contents', filePath: 'nested/file.txt'});
	expect(await deleteStaticFile('/static-abcdef/nested/file.txt')).toEqual({
		success: true,
		existed: true,
	});
	expect(
		await renameStaticFile({
			oldRelativePath: 'nested/file.txt',
			newRelativePath: 'renamed.txt',
		}),
	).toEqual({success: true});
	expect(calls).toEqual([
		'write:nested/file.txt:contents',
		'delete:nested/file.txt',
		'rename:nested/file.txt:renamed.txt',
	]);
});
