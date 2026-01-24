import {spawn} from 'node:child_process';

export const skillsCommand = async (args: string[]) => {
	const subcommand = args[0]; // add | update
	const restArgs = args.slice(1);

	if (!subcommand || !['add', 'update'].includes(subcommand)) {
		throw new Error(
			`Unknown skills command: ${subcommand ?? 'none'}. Supported: add, update`,
		);
	}

	const command = process.platform === 'win32' ? 'npx.cmd' : 'npx';
	const fullArgs = ['skills', subcommand, 'remotion-dev/skills', ...restArgs];

	const child = spawn(command, fullArgs, {
		stdio: 'inherit',
	});

	return new Promise<void>((resolve, reject) => {
		child.on('exit', (code) => {
			if (code === 0) {
				resolve();
			} else {
				reject(new Error(`The skills command failed with exit code ${code}`));
			}
		});

		child.on('error', (err) => {
			reject(err);
		});
	});
};
