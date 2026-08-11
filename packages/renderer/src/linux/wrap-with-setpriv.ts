import {execSync} from 'node:child_process';

let cachedSetprivPath: string | null | undefined;

/**
 * When the Node parent dies abruptly (SIGKILL, kernel OOM, etc.), child processes
 * are reparented to init and may keep running. On Linux, `setpriv(1)` uses
 * prctl(PR_SET_PDEATHSIG) so the child receives SIGKILL when its parent dies.
 *
 * @see https://github.com/remotion-dev/remotion/issues/7207
 */
export const resolveSetprivPathOnLinux = (): string | null => {
	if (cachedSetprivPath !== undefined) {
		return cachedSetprivPath;
	}

	if (process.platform !== 'linux') {
		cachedSetprivPath = null;
		return null;
	}

	try {
		const path = execSync('command -v setpriv 2>/dev/null', {
			encoding: 'utf8',
			stdio: ['ignore', 'pipe', 'ignore'],
		}).trim();
		cachedSetprivPath = path ? path : null;
	} catch {
		cachedSetprivPath = null;
	}

	return cachedSetprivPath;
};

export const wrapExecutableWithSetprivIfAvailable = ({
	executablePath,
	args,
}: {
	executablePath: string;
	args: string[];
}): {executablePath: string; args: string[]} => {
	const setpriv = resolveSetprivPathOnLinux();
	if (!setpriv) {
		return {executablePath, args};
	}

	return {
		executablePath: setpriv,
		args: ['--pdeathsig', 'SIGKILL', executablePath, ...args],
	};
};
