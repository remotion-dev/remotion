import {test} from 'vitest';
import {startCompositor} from '../compositor/compositor';

test(
	'Compositor should process messages in the right order',
	async () => {
		const compositor = startCompositor({
			type: 'StartLongRunningProcess',
			params: {},
		});

		for (let i = 0; i < 10; i++) {
			compositor.executeCommand({
				type: 'Echo',
				params: {message: `Hello ${i}`},
			});
			await new Promise<void>((resolve) => {
				setTimeout(() => resolve(), 10);
			});
		}

		compositor.finishCommands();
		await compositor.waitForDone();
	},
	{timeout: 5000}
);
