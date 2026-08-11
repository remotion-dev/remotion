import {afterEach, expect, test} from 'bun:test';
import {Player} from '@remotion/player';
import {cleanup, render, waitFor} from '@testing-library/react';
import {CanvasCaptureCursor} from '../app/components/CanvasCaptureCursor';

afterEach(() => cleanup());

test('renders the recorded cursor at its captured position in the Player', async () => {
	const customCursor = `data:image/svg+xml,${encodeURIComponent(
		'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"/>',
	)}`;
	const rendered = render(
		<Player
			acknowledgeRemotionLicense
			component={CanvasCaptureCursor}
			compositionWidth={1920}
			compositionHeight={1080}
			durationInFrames={30}
			fps={30}
			inputProps={{
				cursorScale: 0.5,
				cursorPressedScale: 0.8,
				cursorData: {
					captureMetadata: {density: 2},
					mouseMovements: [
						{
							timeInSeconds: 0,
							canvasX: 200,
							canvasY: 300,
							cursor: `url("${customCursor}") 6 7, pointer`,
						},
					],
					pointerClicks: [{timeInSeconds: 0, type: 'pointer-down'}],
				},
			}}
		/>,
	);

	await waitFor(() => {
		const cursor = rendered.container.querySelector<HTMLImageElement>('img');
		expect(cursor?.src).toBe(customCursor);
		expect(cursor?.style.scale).toBe('0.8');
		expect(cursor?.style.marginLeft).toBe('-6px');
		expect(cursor?.style.marginTop).toBe('-7px');
		expect(cursor?.parentElement?.style.left).toBe('200px');
		expect(cursor?.parentElement?.style.top).toBe('300px');
	});
});
