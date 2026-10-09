import {expect, test} from 'bun:test';
import {mkdir, mkdtemp, rm, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {getFileSource} from '../helpers/get-file-source';

test('Should not allow to read files outside of the project', () => {
	expect(() => getFileSource(process.cwd(), '/etc/passwd')).toThrow(
		/Not allowed to open/,
	);
	expect(() => getFileSource(process.cwd(), '.env')).toThrow(
		/Not allowed to open/,
	);
});

test('Should read the file inside the project, not the one next to it, when the cwd differs from the project root', async () => {
	const parent = await mkdtemp(path.join(tmpdir(), 'remotion-source-'));
	const projectRoot = path.join(parent, 'project');
	await mkdir(projectRoot, {recursive: true});
	// The same file name exists inside and outside the project, so a mismatch
	// between the validated path and the read path becomes observable.
	await writeFile(path.join(projectRoot, 'secret.ts'), 'inside');
	await writeFile(path.join(parent, 'secret.ts'), 'outside');

	const cwd = process.cwd();
	process.chdir(parent);
	try {
		expect(await getFileSource(projectRoot, 'secret.ts')).toBe('inside');
	} finally {
		process.chdir(cwd);
		await rm(parent, {force: true, recursive: true});
	}
});
