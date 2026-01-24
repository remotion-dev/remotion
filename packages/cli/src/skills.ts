import {spawn} from 'node:child_process';

export const skillsCommand = async (args: string[]) => {
	const subcommand = args[0]; // add | update
	const restArgs = args.slice(1);

	if (!subcommand || !['add', 'update'].includes(subcommand)) {
		throw new Error(
			`Unknown skills command: ${subcommand ?? 'none'}. Supported: add, update`,
		);
	}

	const command = process.platform === 'win32' ? 'npm.cmd' : 'npm';
	const fullArgs = ['exec', 'skills', subcommand, 'remotion-dev/skills', ...restArgs];

	const child = spawn(command, fullArgs, {
		stdio: 'inherit',
		shell: true,
	});

	return new Promise<void>((resolve, reject) => {
		child.on('exit', (code) => {
			if (code === 0) {
				resolve();
			} else {
				// Don't log here because npx/skills should have already logged its own errors
				process.exit(code ?? 1);
			}
		});

		child.on('error', (err) => {
			reject(err);
		});
	});
};
