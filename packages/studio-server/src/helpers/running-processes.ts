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
		// Windows terminal launches put the app after the command interpreter.
		const withoutCmd = (commandLine ?? '').replace(
			/^(?:"[^"\r\n]*[/\\]cmd(?:\.exe)?"|(?:[^\s"]*[/\\])?cmd(?:\.exe)?)\s+\/[ck]\s+/i,
			'',
		);
		// Node-based CLIs put the script after the interpreter path.
		const withoutNode = withoutCmd.replace(
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
					// Use a fixed-width name column to preserve spaces in both fields.
					const executableWidth = 64;
					const {stdout} = await execFilePromise(
						'ps',
						['-e', '-ww', '-o', `comm:${executableWidth}=`, '-o', 'args='],
						{timeout: 5000},
					);
					return stdout
						.split('\n')
						.filter(Boolean)
						.map((line) => ({
							executable: line.slice(0, executableWidth).trim(),
							commandLine: line.slice(executableWidth).trim(),
						}));
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
