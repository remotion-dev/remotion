import {spawn} from 'child_process';
import {platform} from 'os';

export const openDirectoryInFinder = (dirToOpen: string) => {
	const command =
		platform() === 'darwin'
			? 'open'
			: platform() === 'linux'
			? 'xdg-open'
			: 'explorer';

	// TODO: What if file was deleted in the meanwhile?

	// TODO: '-R' only works on macOS
	const p = spawn(command, ['-R', dirToOpen]);

	return new Promise<void>((resolve, reject) => {
		p.on('exit', (code) => {
			if (code === 0) {
				resolve();
			} else {
				reject(new Error(`Exited with code ${code}`));
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
