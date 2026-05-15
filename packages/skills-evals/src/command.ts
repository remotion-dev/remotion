export type CommandResult = {
	aborted: boolean;
	command: string[];
	cwd: string;
	exitCode: number;
	stdout: string;
	stderr: string;
	timedOut: boolean;
	durationMs: number;
};

export type CommandOutput = {
	chunk: string;
	stream: 'stderr' | 'stdout';
};

const collectStream = async ({
	onOutput,
	redactOutput,
	stream,
	streamName,
}: {
	onOutput?: (output: CommandOutput) => void;
	redactOutput: (value: string) => string;
	stream: ReadableStream<Uint8Array>;
	streamName: CommandOutput['stream'];
}) => {
	const reader = stream.getReader();
	const decoder = new TextDecoder();
	let output = '';

	while (true) {
		const {done, value} = await reader.read();

		if (done) {
			break;
		}

		const chunk = decoder.decode(value, {stream: true});
		const redactedChunk = redactOutput(chunk);
		output += chunk;
		onOutput?.({chunk: redactedChunk, stream: streamName});
	}

	const finalChunk = decoder.decode();
	if (finalChunk) {
		const redactedChunk = redactOutput(finalChunk);
		output += finalChunk;
		onOutput?.({chunk: redactedChunk, stream: streamName});
	}

	return redactOutput(output);
};

const sensitiveEnvKey = /(token|key|secret|password|credential|auth|cookie)/i;

const createCommandEnv = (env: Record<string, string | undefined> = {}) => ({
	...process.env,
	...env,
});

const createOutputRedactor = (env: Record<string, string | undefined>) => {
	const sensitiveValues = Object.entries(env)
		.filter(
			([key, value]) => sensitiveEnvKey.test(key) && value && value.length > 7,
		)
		.map(([, value]) => value as string)
		.sort((a, b) => b.length - a.length);

	return (value: string) => {
		let redacted = value;

		for (const sensitiveValue of sensitiveValues) {
			redacted = redacted.split(sensitiveValue).join('[redacted]');
		}

		return redacted;
	};
};

export const runCommand = async ({
	command,
	cwd,
	env,
	onOutput,
	signal,
	timeoutMs,
}: {
	command: string[];
	cwd: string;
	env?: Record<string, string | undefined>;
	onOutput?: (output: CommandOutput) => void;
	signal?: AbortSignal;
	timeoutMs?: number;
}): Promise<CommandResult> => {
	const startedAt = Date.now();
	const commandEnv = createCommandEnv(env);
	const redactOutput = createOutputRedactor(commandEnv);
	const subprocess = Bun.spawn(command, {
		cwd,
		detached: process.platform !== 'win32',
		env: commandEnv,
		stdout: 'pipe',
		stderr: 'pipe',
	});
	let aborted = false;
	let timedOut = false;
	let forceKillTimeout: ReturnType<typeof setTimeout> | null = null;
	const killSubprocess = (killSignal: 'SIGKILL' | 'SIGTERM') => {
		try {
			if (process.platform !== 'win32') {
				process.kill(-subprocess.pid, killSignal);
				return;
			}
		} catch {
			// Fall back to killing the direct child if the process group is gone.
		}

		subprocess.kill(killSignal);
	};

	const terminateSubprocess = () => {
		killSubprocess('SIGTERM');
		forceKillTimeout = setTimeout(() => {
			killSubprocess('SIGKILL');
		}, 2000);
	};

	const onAbort = () => {
		aborted = true;
		terminateSubprocess();
	};

	if (signal?.aborted) {
		onAbort();
	} else {
		signal?.addEventListener('abort', onAbort, {once: true});
	}

	const timeout = timeoutMs
		? setTimeout(() => {
				timedOut = true;
				terminateSubprocess();
			}, timeoutMs)
		: null;

	const [stdout, stderr, exitCode] = await Promise.all([
		collectStream({
			onOutput,
			redactOutput,
			stream: subprocess.stdout,
			streamName: 'stdout',
		}),
		collectStream({
			onOutput,
			redactOutput,
			stream: subprocess.stderr,
			streamName: 'stderr',
		}),
		subprocess.exited,
	]);

	if (timeout) {
		clearTimeout(timeout);
	}

	if (forceKillTimeout) {
		clearTimeout(forceKillTimeout);
	}

	signal?.removeEventListener('abort', onAbort);

	return {
		aborted,
		command,
		cwd,
		exitCode,
		stdout,
		stderr,
		timedOut,
		durationMs: Date.now() - startedAt,
	};
};

export const commandToString = (command: string[]) =>
	command
		.map((part) => (/\s/.test(part) ? JSON.stringify(part) : part))
		.join(' ');
