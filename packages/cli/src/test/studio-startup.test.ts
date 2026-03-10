import {beforeAll, expect, mock, test} from 'bun:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const startStudioMock = mock();

mock.module('@remotion/studio-server', () => ({
	StudioServerInternals: {
		getMaxTimelineTracks: () => null,
		setMaxTimelineTracks: () => undefined,
		startStudio: startStudioMock,
		installFileWatcher: () => ({unwatch: () => undefined}),
		waitForLiveEventsListener: () =>
			Promise.resolve({
				sendEventToClient: () => undefined,
			}),
	},
}));

let startStudioCommand: typeof import('../studio').startStudioCommand;
let parseCommandLineArguments: typeof import('../parsed-cli').parseCommandLineArguments;

beforeAll(async () => {
	({startStudioCommand} = await import('../studio'));
	({parseCommandLineArguments} = await import('../parsed-cli'));
});

test('startStudioCommand wires render queue methods for a functional Studio', async () => {
	startStudioMock.mockResolvedValue({
		type: 'already-running',
		port: 3000,
	});

	const tmp = fs.mkdtempSync(
		path.join(os.tmpdir(), 'remotion-studio-startup-'),
	);
	fs.mkdirSync(path.join(tmp, 'src'));
	fs.writeFileSync(path.join(tmp, 'src', 'index.ts'), 'export {};');

	try {
		await startStudioCommand(tmp, ['src/index.ts'], 'info', {
			commandLine: parseCommandLineArguments(['--no-open']),
			exitBehavior: 'throw',
		});

		expect(startStudioMock).toHaveBeenCalledTimes(1);
		const [options] = startStudioMock.mock.calls[0] as [
			Parameters<typeof startStudioMock>[0],
		];

		expect(options.getRenderQueue()).toEqual([]);
		expect(() => options.queueMethods.cancelJob('missing')).not.toThrow();
		expect(() => options.queueMethods.removeJob('missing')).not.toThrow();
	} finally {
		fs.rmSync(tmp, {recursive: true, force: true});
		startStudioMock.mockReset();
	}
});
