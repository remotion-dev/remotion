import {Player} from '@remotion/player';
import {createRoot} from 'react-dom/client';
import {expect, test, vi} from 'vitest';
import {AudioScheduler} from '../index';
import {MediaPlayer} from '../media-player';

const waitFor = async (predicate: () => boolean) => {
	const started = Date.now();
	while (Date.now() - started < 10_000) {
		if (predicate()) {
			return;
		}

		await new Promise((resolve) => setTimeout(resolve, 50));
	}

	throw new Error('Timed out while waiting for AudioScheduler preview.');
};

test('keeps silent scheduler entries in the real buffering lifecycle', async () => {
	const container = document.createElement('div');
	document.body.appendChild(container);
	const testWindow = window as Window & {
		process?: {env?: {NODE_ENV?: string}};
	};
	const originalProcess = testWindow.process;
	// Vitest sets NODE_ENV to "test", which makes Remotion select its render
	// path. This test mounts the component in <Player>, so exercise preview mode.
	testWindow.process = {env: {NODE_ENV: 'development'}};

	const initializeSpy = vi.spyOn(MediaPlayer.prototype, 'initialize');
	const disposeSpy = vi.spyOn(MediaPlayer.prototype, 'dispose');
	const root = createRoot(container);

	root.render(
		<Player
			acknowledgeRemotionLicense
			component={() => (
				<AudioScheduler
					schedule={[
						{
							id: 'silent-entry',
							src: '/voice-note.m4a',
							startTimeInSeconds: 0,
							durationInSeconds: 1,
							sourceStartTimeInSeconds: 0,
							volume: 0,
						},
					]}
				/>
			)}
			compositionHeight={100}
			compositionWidth={100}
			durationInFrames={30}
			fps={30}
			inputProps={{}}
		/>,
	);

	try {
		await waitFor(() => initializeSpy.mock.calls.length === 1);

		const initializeCall = initializeSpy.mock.calls[0];
		expect(initializeCall?.[1]).toBe(false);
		expect(initializeCall?.[2]).toBe(1);
		await initializeSpy.mock.results[0]?.value;
	} finally {
		root.unmount();
		await waitFor(() => disposeSpy.mock.calls.length === 1);
		await disposeSpy.mock.results[0]?.value;
		initializeSpy.mockRestore();
		disposeSpy.mockRestore();
		if (originalProcess) {
			testWindow.process = originalProcess;
		} else {
			delete testWindow.process;
		}
		container.remove();
	}
});
