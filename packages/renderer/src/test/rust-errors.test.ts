import {expect, test} from 'vitest';
import {startLongRunningCompositor} from '../compositor/compositor';

test('Should get Rust errors in a good way', async () => {
	const compositor = startLongRunningCompositor();

	try {
		await compositor.executeCommand('ExtractFrame', {
			input: 'invlaid',
			time: 1,
			transparent: false,
		});
	} catch (err) {
		expect((err as Error).message).toContain(
			'Compositor error: No such file or directory'
		);
		expect((err as Error).message).toContain('opened_video::open_stream');
	}
});

test.todo('Non-long running tasks should also be handled properly');
test.todo('Handle panics');
