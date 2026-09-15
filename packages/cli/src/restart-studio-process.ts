import {spawn} from 'node:child_process';

export const restartStudioProcess = ({
	command,
	args,
}: {
	command: string;
	args: string[];
}) => {
	return new Promise<void>((resolve, reject) => {
		const child = spawn(command, args, {
			stdio: 'inherit',
		});

		child.once('error', reject);
		child.once('close', (code, signal) => {
			if (signal !== null) {
				reject(
					new Error(`Restarted Studio process exited with signal ${signal}.`),
				);
				return;
			}

			if (code !== 0) {
				reject(new Error(`Restarted Studio process exited with code ${code}.`));
				return;
			}

			resolve();
		});
	});
};
