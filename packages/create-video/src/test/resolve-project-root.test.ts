import {expect, spyOn, test} from 'bun:test';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {resolveProjectRoot} from '../resolve-project-root';

test('CLI directory argument: exits when target folder is not empty', async () => {
	const dir = await fs.mkdtemp(
		path.join(os.tmpdir(), 'create-video-nonempty-'),
	);
	await fs.writeFile(path.join(dir, 'existing.txt'), 'x');

	const exitSpy = spyOn(process, 'exit').mockImplementation(((
		code?: number,
	) => {
		throw new Error(`EXIT:${code ?? 0}`);
	}) as typeof process.exit);

	try {
		await expect(resolveProjectRoot({directoryArgument: dir})).rejects.toThrow(
			'EXIT:1',
		);
		expect(exitSpy).toHaveBeenCalledWith(1);
	} finally {
		exitSpy.mockRestore();
		await fs.rm(dir, {recursive: true, force: true});
	}
});
