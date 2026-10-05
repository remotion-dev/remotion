import {execFile} from 'node:child_process';
import {promisify} from 'node:util';

const execFilePromise = promisify(execFile);

type RunningProcess = {
	executable: string | null;
	commandLine: string | null;
};

let processSnapshot: {
	promise: Promise<readonly RunningProcess[] | null>;
	expiresAt: number;
} | null = null;

export const isAppRunning = ({
	processes,
	executablePath,
	commands,
	platform,
}: {
	processes: readonly RunningProcess[];
	executablePath: string;
	commands: readonly string[];
	platform: NodeJS.Platform;
}) => {
	if (platform === 'darwin') {
		const applicationPath = executablePath.split('/Contents/')[0];
		if (applicationPath.endsWith('.app')) {
			return processes.some(({executable}) =>
				executable?.startsWith(`${applicationPath}/Contents/MacOS/`),
			);
		}
	}

	const escapedCommands = commands.map((command) =>
		command.replace(/\.(exe|cmd)$/i, '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
	);
	const escapedPath = executablePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	const executablePattern = new RegExp(
		`^"?(?:${escapedPath}|(?:[^"\\s]*[/\\\\])?(?:${escapedCommands.join('|')})(?:\\.(?:exe|cmd|js))?)"?(?=\\s|$)`,
		platform === 'win32' ? 'i' : '',
	);
	return processes.some(({executable, commandLine}) => {
		// Node-based CLIs put the script after the interpreter path.
		const withoutNode = (commandLine ?? '').replace(
			/^(?:"[^"\r\n]*[/\\]node(?:\.exe)?"|(?:[^\s"]*[/\\])?node(?:\.exe)?)\s+/i,
			'',
		);
		return (
			executablePattern.test(executable ?? '') ||
			executablePattern.test(withoutNode)
		);
	});
};

export const getRunningProcesses = (): Promise<
	readonly RunningProcess[] | null
> => {
	if (processSnapshot !== null && processSnapshot.expiresAt > Date.now()) {
		return processSnapshot.promise;
	}

	const snapshot = {
		expiresAt: Infinity,
		promise: (async (): Promise<readonly RunningProcess[] | null> => {
			try {
				if (process.platform === 'win32') {
					const {stdout} = await execFilePromise(
						'powershell.exe',
						[
							'-NoProfile',
							'-NonInteractive',
							'-Command',
							'ConvertTo-Json -Compress -InputObject @(Get-CimInstance Win32_Process | Select-Object ExecutablePath, CommandLine)',
						],
						{timeout: 5000},
					);
					const processes: {
						ExecutablePath: string | null;
						CommandLine: string | null;
					}[] = JSON.parse(stdout);
					return processes.map(({ExecutablePath, CommandLine}) => ({
						executable: ExecutablePath,
						commandLine: CommandLine,
					}));
				}

				if (process.platform === 'darwin') {
					const {stdout} = await execFilePromise('ps', ['-ax', '-o', 'comm='], {
						timeout: 5000,
					});
					return stdout
						.split('\n')
						.filter(Boolean)
						.map((line) => ({
							executable: line.trim(),
							commandLine: null,
						}));
				}

				if (process.platform === 'linux') {
					// AIX format descriptors separate the name and arguments with a tab,
					// preserving spaces in either field while querying ps only once.
					const {stdout} = await execFilePromise(
						'ps',
						['-axww', '--no-headers', '-o', '%c\t%a'],
						{timeout: 5000},
					);
					return stdout
						.split('\n')
						.filter(Boolean)
						.map((line) => {
							const separator = line.indexOf('\t');
							return {
								executable: line.slice(0, separator).trim(),
								commandLine: line.slice(separator + 1).trim(),
							};
						});
				}
			} catch {
				return null;
			}

			return null;
		})(),
	};
	processSnapshot = snapshot;
	// Share the in-flight query and its result across nearby editor and agent
	// requests, but refresh it when Studio is revisited later.
	snapshot.promise.then(() => {
		snapshot.expiresAt = Date.now() + 1000;
	});
	return snapshot.promise;
};
