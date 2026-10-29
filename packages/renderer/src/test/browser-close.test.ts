import {afterEach, expect, test} from 'bun:test';
import {
	existsSync,
	mkdirSync,
	mkdtempSync,
	readFileSync,
	rmSync,
} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {HeadlessBrowser} from '../browser/Browser';
import type {BrowserRunner} from '../browser/BrowserRunner';
import {makeBrowserRunner} from '../browser/BrowserRunner';

const workers: {runner: BrowserRunner; directory: string}[] = [];

const startBrowser = async (mode: string) => {
	const directory = mkdtempSync(join(tmpdir(), 'remotion-browser-close-'));
	const profile = join(directory, 'profile');
	mkdirSync(profile);
	const runner = await makeBrowserRunner({
		executablePath: process.execPath,
		processArguments: [
			join(__dirname, 'fixtures', 'browser-close-worker.ts'),
			mode,
			directory,
		],
		userDataDir: profile,
		logLevel: 'error',
		indent: false,
		timeout: 5000,
	});
	workers.push({runner, directory});
	const pid = Number(readFileSync(join(directory, 'pid'), 'utf8'));
	return {runner, directory, profile, pid};
};

const pidExists = (pid: number) => {
	try {
		process.kill(pid, 0);
		return true;
	} catch {
		return false;
	}
};

afterEach(async () => {
	for (const {runner, directory} of workers.splice(0)) {
		try {
			await runner.closeProcess();
		} finally {
			runner.connection.dispose();
			rmSync(directory, {recursive: true, force: true});
		}
	}
});

for (const mode of ['graceful', 'no-response', 'disconnect']) {
	test(`lets the browser finish its own cleanup before resolving (${mode})`, async () => {
		const {runner, directory, profile, pid} = await startBrowser(mode);
		await runner.closeProcess();

		expect(existsSync(join(directory, 'closed'))).toBe(true);
		expect(readFileSync(join(directory, 'closed'), 'utf8')).toBe(
			'profile-present',
		);
		expect(readFileSync(join(directory, 'requests'), 'utf8')).toBe(
			'Browser.close\n',
		);
		expect(pidExists(pid)).toBe(false);
		expect(existsSync(profile)).toBe(false);
		expect(runner.listeners).toHaveLength(0);
	});
}

for (const mode of ['hang', 'reject']) {
	test(`force-kills an unresponsive browser and still cleans up (${mode})`, async () => {
		const {runner, directory, profile, pid} = await startBrowser(mode);
		const start = Date.now();
		await runner.closeProcess();

		expect(Date.now() - start).toBeGreaterThanOrEqual(1500);
		expect(Date.now() - start).toBeLessThan(5000);
		expect(readFileSync(join(directory, 'requests'), 'utf8')).toBe(
			'Browser.close\n',
		);
		expect(existsSync(join(directory, 'closed'))).toBe(false);
		expect(pidExists(pid)).toBe(false);
		expect(existsSync(profile)).toBe(false);
		expect(runner.listeners).toHaveLength(0);
	});
}

test('cleans up after the browser has already exited', async () => {
	const {runner, profile, pid} = await startBrowser('graceful');
	await runner.connection.send('Browser.close').catch(() => undefined);
	for (let attempt = 0; attempt < 500 && pidExists(pid); attempt++) {
		await new Promise((resolve) => setTimeout(resolve, 10));
	}

	expect(pidExists(pid)).toBe(false);
	await runner.closeProcess();
	expect(existsSync(profile)).toBe(false);
	expect(runner.listeners).toHaveLength(0);
});

test('can close a browser whose CDP connection is already disposed', async () => {
	const {runner, profile, pid} = await startBrowser('hang');
	runner.connection.dispose();
	await runner.closeProcess();

	expect(pidExists(pid)).toBe(false);
	expect(existsSync(profile)).toBe(false);
	expect(runner.listeners).toHaveLength(0);
});

test('concurrent runner shutdown requests share the same cleanup', async () => {
	const {runner, directory, profile, pid} = await startBrowser('graceful');
	await Promise.all([
		runner.closeProcess(),
		runner.closeProcess(),
		runner.closeProcess(),
	]);
	await runner.closeProcess();

	expect(readFileSync(join(directory, 'requests'), 'utf8')).toBe(
		'Browser.close\n',
	);
	expect(pidExists(pid)).toBe(false);
	expect(existsSync(profile)).toBe(false);
	expect(runner.listeners).toHaveLength(0);
});

test('keeps synchronous force-kill cleanup for Node process exit', async () => {
	const previous = process.listeners('exit');
	const {runner, directory, profile, pid} = await startBrowser('hang');
	const onExit = process.listeners('exit').find((listener) => {
		return !previous.includes(listener);
	});
	if (!onExit) {
		throw new Error('The browser exit listener was not registered');
	}

	// Invoke only this runner's exit handler, without exiting the test process.
	onExit(0);
	await runner.closeProcess();

	expect(existsSync(join(directory, 'requests'))).toBe(false);
	expect(pidExists(pid)).toBe(false);
	expect(existsSync(profile)).toBe(false);
	expect(runner.listeners).toHaveLength(0);
});

for (const silent of [false, true]) {
	test(`concurrent and repeated browser.close() calls finish only once (silent: ${silent})`, async () => {
		const {runner, directory, profile, pid} = await startBrowser('graceful');
		const browser = new HeadlessBrowser({
			connection: runner.connection,
			runner,
			defaultViewport: {width: 100, height: 100, deviceScaleFactor: 1},
		});
		let closed = 0;
		let closedSilent = 0;
		browser.on('closed', () => closed++);
		browser.on('closed-silent', () => closedSilent++);
		await Promise.all([
			browser.close({silent}),
			browser.close({silent}),
			browser.close({silent}),
		]);
		await browser.close({silent});

		expect(closed).toBe(silent ? 0 : 1);
		expect(closedSilent).toBe(silent ? 1 : 0);
		expect(readFileSync(join(directory, 'requests'), 'utf8')).toBe(
			'Browser.close\n',
		);
		expect(pidExists(pid)).toBe(false);
		expect(existsSync(profile)).toBe(false);
		expect(runner.listeners).toHaveLength(0);
	});
}
