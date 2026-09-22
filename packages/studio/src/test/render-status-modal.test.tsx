import {afterEach, expect, test} from 'bun:test';
import {cleanup, render, screen} from '@testing-library/react';
import {RenderStatusModal} from '../components/RenderModal/RenderStatusModal';
import {RenderQueueContext} from '../components/RenderQueue/context';

afterEach(cleanup);

test('shows the error message when the browser stack does not include it', () => {
	const message = 'fileHandle.createWritable is not a function.';
	const stack = '@[http://localhost:3002/bundle.js:354143:51]';

	render(
		<RenderQueueContext.Provider
			value={
				{
					jobs: [
						{
							id: 'render-job',
							type: 'client-still',
							status: 'failed',
							compositionId: 'composition',
							error: {message, stack},
						},
					],
					removeClientJob: () => undefined,
					cancelClientJob: () => undefined,
				} as never
			}
		>
			<RenderStatusModal jobId="render-job" />
		</RenderQueueContext.Provider>,
	);

	const dialog = screen.getByRole('dialog');
	expect(dialog.textContent).toContain(message);
	expect(dialog.textContent).toContain(stack);
});
