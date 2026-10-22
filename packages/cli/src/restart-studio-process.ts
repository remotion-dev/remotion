import {spawn} from 'node:child_process';

export const getRestartStudioProcessArgs = ({
	argv,
	execArgv,
	port,
}: {
	argv: string[];
	execArgv: string[];
	port: number;
}) => {
	const args = argv.slice(1);
	const argsWithoutPort: string[] = [];

	for (let index = 0; index < args.length; index++) {
		const arg = args[index]!;
		if (arg === '--port') {
			index++;
			continue;
		}

		if (arg.startsWith('--port=')) {
			continue;
		}

		argsWithoutPort.push(arg);
	}

	return [...execArgv, ...argsWithoutPort, `--port=${port}`];
};

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
