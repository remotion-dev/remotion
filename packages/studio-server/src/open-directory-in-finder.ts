import childProcess from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import {NoReactInternals} from 'remotion/no-react';

export const openDirectoryInFinder = (
	dirToOpen: string,
	allowedDirectory: string,
) => {
	const resolved = path.resolve(allowedDirectory, dirToOpen);

	const relativeToAllowedDirectory = path.relative(allowedDirectory, resolved);
	if (
		relativeToAllowedDirectory === '..' ||
		relativeToAllowedDirectory.startsWith(`..${path.sep}`) ||
		path.isAbsolute(relativeToAllowedDirectory)
	) {
		throw new Error(`Not allowed to open ${relativeToAllowedDirectory}`);
	}

	if (os.platform() === 'win32') {
		const proc = childProcess.spawn('explorer.exe', ['/select,', resolved]);

		return new Promise<void>((resolve, reject) => {
			proc.on('exit', (code) => {
				// explorer.exe returns 1 even on success
				if (code === 0 || code === 1) {
					resolve();
				} else {
					reject(new Error(`explorer.exe exited with code ${code}`));
				}
			});
			proc.on('error', (err) => {
				proc.kill();
				reject(err);
			});
		});
	}

	const command = os.platform() === 'darwin' ? 'open' : 'xdg-open';

	const p = childProcess.spawn(
		command,
		[os.platform() === 'darwin' ? '-R' : null, resolved].filter(
			NoReactInternals.truthy,
		),
	);

	const stderrChunks: Uint8Array[] = [];
	p.stderr.on('data', (d) => stderrChunks.push(d));

	return new Promise<void>((resolve, reject) => {
		p.on('exit', (code) => {
			if (code === 0) {
				resolve();
			} else {
				const message = Buffer.concat(
					stderrChunks.map((buf) => Uint8Array.from(buf)),
				).toString('utf8');
				reject(new Error(message));
			}
		});
		p.on('error', (err) => {
			p.kill();
			if (err) {
				reject(err);
			}
		});
	});
};
