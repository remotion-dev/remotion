import {afterEach, expect, spyOn, test} from 'bun:test';
import {cleanup, render, screen} from '@testing-library/react';
import React, {useState} from 'react';
import type {DelayRenderScope} from '../delay-render.js';
import type {RemotionEnvironment} from '../remotion-environment-context.js';
import {RemotionEnvironmentContext} from '../remotion-environment-context.js';
import {DelayRenderContextType} from '../use-delay-render.js';
import {OffthreadVideo} from '../video/index.js';
import {WrapSequenceContext} from './wrap-sequence-context.js';

afterEach(() => {
	cleanup();
});

const renderingEnvironment: RemotionEnvironment = {
	isClientSideRendering: false,
	isPlayer: false,
	isReadOnlyStudio: false,
	isRendering: true,
	isStudio: false,
};

const VideoWithFallback: React.FC<{
	readonly errors: Error[];
}> = ({errors}) => {
	const [failed, setFailed] = useState(false);

	if (failed) {
		return <div>Fallback</div>;
	}

	return (
		<OffthreadVideo
			src="https://example.com/broken.mp4"
			onError={(err) => {
				errors.push(err);
				setFailed(true);
			}}
		/>
	);
};

test('<OffthreadVideo> releases its delayRender() handle when onError swaps in a fallback', async () => {
	// Rendering components skip delayRender() when NODE_ENV is "test"
	const originalNodeEnv = window.process.env.NODE_ENV;
	window.process.env.NODE_ENV = 'production';
	const originalVideoEnabled = window.remotion_videoEnabled;
	window.remotion_videoEnabled = true;
	// The frame server fails to extract the frame
	const fetchSpy = spyOn(globalThis, 'fetch').mockImplementation((() =>
		Promise.resolve(
			new Response(
				JSON.stringify({error: 'Error: No video stream found in file'}),
				{status: 500},
			),
		)) as unknown as typeof fetch);

	const scope: DelayRenderScope = {
		remotion_renderReady: false,
		remotion_delayRenderTimeouts: {},
		remotion_puppeteerTimeout: 30000,
		remotion_attempt: 1,
		remotion_delayRenderHandles: [],
	};
	const errors: Error[] = [];

	try {
		const {container} = render(
			<RemotionEnvironmentContext.Provider value={renderingEnvironment}>
				<DelayRenderContextType.Provider value={scope}>
					<WrapSequenceContext>
						<VideoWithFallback errors={errors} />
					</WrapSequenceContext>
				</DelayRenderContextType.Provider>
			</RemotionEnvironmentContext.Provider>,
		);

		// The frame is blocked until the frame has been fetched
		expect(scope.remotion_delayRenderHandles).toHaveLength(1);
		expect(scope.remotion_renderReady).toBe(false);

		expect(await screen.findByText('Fallback')).toBeTruthy();
		expect(fetchSpy).toHaveBeenCalledTimes(1);
		expect(errors).toHaveLength(1);
		expect(errors[0].message).toBe('No video stream found in file');

		// Swapping in a fallback unmounted the video and released its handle
		expect(container.querySelector('img')).toBeNull();
		expect(scope.remotion_delayRenderHandles).toEqual([]);
		expect(scope.remotion_delayRenderTimeouts).toEqual({});
		expect(scope.remotion_renderReady).toBe(true);
	} finally {
		cleanup();
		for (const {timeout} of Object.values(scope.remotion_delayRenderTimeouts)) {
			clearTimeout(timeout);
		}

		fetchSpy.mockRestore();
		window.remotion_videoEnabled = originalVideoEnabled;
		window.process.env.NODE_ENV = originalNodeEnv;
	}
});
