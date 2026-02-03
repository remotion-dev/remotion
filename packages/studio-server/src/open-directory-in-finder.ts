import {spawn} from 'node:child_process';
import {platform} from 'node:os';
import path from 'node:path';
import {NoReactInternals} from 'remotion/no-react';

export const openDirectoryInFinder = (
	dirToOpen: string,
	allowedDirectory: string,
) => {
	const resolved = path.resolve(allowedDirectory, dirToOpen);

	const relativeToProcessCwd = path.relative(allowedDirectory, resolved);
	if (relativeToProcessCwd.startsWith('..')) {
		throw new Error(`Not allowed to open ${relativeToProcessCwd}`);
	}

	if (platform() === 'win32') {
		const proc = spawn('explorer.exe', ['/select,', resolved]);

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

	const command = platform() === 'darwin' ? 'open' : 'xdg-open';

	const p = spawn(
		command,
		[platform() === 'darwin' ? '-R' : null, dirToOpen].filter(
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
