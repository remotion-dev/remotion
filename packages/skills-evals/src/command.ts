export type CommandResult = {
	command: string[];
	cwd: string;
	exitCode: number;
	stdout: string;
	stderr: string;
	durationMs: number;
};

export const runCommand = async ({
	command,
	cwd,
	env,
	timeoutMs,
}: {
	command: string[];
	cwd: string;
	env?: Record<string, string | undefined>;
	timeoutMs?: number;
}): Promise<CommandResult> => {
	const startedAt = Date.now();
	const subprocess = Bun.spawn(command, {
		cwd,
		env: {...process.env, ...env},
		stdout: 'pipe',
		stderr: 'pipe',
	});
	const timeout = timeoutMs
		? setTimeout(() => {
				subprocess.kill();
			}, timeoutMs)
		: null;

	const [stdout, stderr, exitCode] = await Promise.all([
		new Response(subprocess.stdout).text(),
		new Response(subprocess.stderr).text(),
		subprocess.exited,
	]);
	if (timeout) {
		clearTimeout(timeout);
	}

	return {
		command,
		cwd,
		exitCode,
		stdout,
		stderr,
		durationMs: Date.now() - startedAt,
	};
};

export const commandToString = (command: string[]) =>
	command
		.map((part) => (/\s/.test(part) ? JSON.stringify(part) : part))
		.join(' ');
