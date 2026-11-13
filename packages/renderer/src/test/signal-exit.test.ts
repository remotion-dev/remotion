import {afterEach, expect, test} from 'bun:test';
import type {ChildProcess} from 'node:child_process';
import {spawn} from 'node:child_process';
import {join} from 'node:path';
import {ensureBrowser} from '../ensure-browser';

const workerPath = join(__dirname, 'fixtures', 'signal-worker.cjs');
const children: ChildProcess[] = [];
const chromePids: number[] = [];

const pidExists = (pid: number) => {
	try {
		process.kill(pid, 0);
		return true;
	} catch {
		return false;
	}
};

const waitForPidToExit = async (pid: number) => {
	const deadline = Date.now() + 5000;
	while (pidExists(pid) && Date.now() < deadline) {
		await new Promise((resolve) => setTimeout(resolve, 20));
	}

	return !pidExists(pid);
};

afterEach(() => {
	for (const child of children.splice(0)) {
		if (child.exitCode === null && child.signalCode === null) {
			child.kill('SIGKILL');
		}
	}

	for (const pid of chromePids.splice(0)) {
		if (pidExists(pid)) {
			process.kill(pid, 'SIGKILL');
		}
	}
});

const signalWorker = async ({
	mode,
	signal,
}: {
	mode: 'no-listener' | 'once' | 'prepend-once';
	signal: 'SIGTERM' | 'SIGHUP';
}) => {
	await ensureBrowser();
	const child = spawn('node', [workerPath, mode, signal], {
		stdio: ['ignore', 'pipe', 'inherit'],
	});
	children.push(child);

	const exited = new Promise<{
		code: number | null;
		signal: NodeJS.Signals | 'timeout' | null;
	}>((resolve) => {
		child.on('exit', (code, exitSignal) => resolve({code, signal: exitSignal}));
	});

	let stdout = '';
	const chromePid = await new Promise<number>((resolve, reject) => {
		child.stdout!.on('data', (chunk) => {
			stdout += chunk;
			const match = stdout.match(/^ready (\d+)$/m);
			if (match) {
				resolve(Number(match[1]));
			}
		});
		exited.then(() => reject(new Error(`Worker exited early: ${stdout}`)));
	});
	chromePids.push(chromePid);
	expect(pidExists(chromePid)).toBe(true);

	const start = Date.now();
	child.kill(signal);
	const result = await Promise.race([
		exited,
		new Promise<{code: null; signal: 'timeout'}>((resolve) => {
			setTimeout(() => resolve({code: null, signal: 'timeout'}), 15_000);
		}),
	]);

	return {
		...result,
		duration: Date.now() - start,
		chromeExited: await waitForPidToExit(chromePid),
		stdout,
	};
};

const isWindows = process.platform === 'win32';

for (const signal of ['SIGTERM', 'SIGHUP'] as const) {
	test.skipIf(isWindows)(
		`${signal} terminates a Node.js process that opened a browser`,
		async () => {
			const result = await signalWorker({mode: 'no-listener', signal});

			expect(result.signal).toBe(signal);
			expect(result.duration).toBeLessThan(10_000);
			expect(result.chromeExited).toBe(true);
		},
		30_000,
	);
}

for (const mode of ['once', 'prepend-once'] as const) {
	test.skipIf(isWindows)(
		`SIGTERM lets a process.${mode === 'once' ? 'once' : 'prependOnceListener'}() listener finish and pick the exit code`,
		async () => {
			const result = await signalWorker({mode, signal: 'SIGTERM'});

			expect(result).toMatchObject({code: 42, signal: null});
			expect(result.stdout).toContain('browser closed\n');
			expect(result.chromeExited).toBe(true);
		},
		30_000,
	);
}
