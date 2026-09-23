import {afterEach, expect, spyOn, test} from 'bun:test';
import {cleanup, fireEvent, render, screen} from '@testing-library/react';
import React, {useState} from 'react';
import type {DelayRenderScope} from '../delay-render.js';
import type {RemotionEnvironment} from '../remotion-environment-context.js';
import {RemotionEnvironmentContext} from '../remotion-environment-context.js';
import {DelayRenderContextType} from '../use-delay-render.js';
import {Html5Video} from '../video/index.js';
import {MediaPlaybackError} from '../video/MediaPlaybackError.js';
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

const src = 'https://example.com/h264.mp4';

const VideoWithFallback: React.FC<{
	readonly errors: Error[];
}> = ({errors}) => {
	const [failed, setFailed] = useState(false);

	if (failed) {
		return <div>Fallback</div>;
	}

	return (
		<Html5Video
			src={src}
			onError={(err) => {
				errors.push(err);
				setFailed(true);
			}}
		/>
	);
};

test('<Html5Video> calls onError during rendering and a fallback lets the render continue', () => {
	// Rendering components skip delayRender() when NODE_ENV is "test"
	const originalNodeEnv = window.process.env.NODE_ENV;
	window.process.env.NODE_ENV = 'production';
	const originalVideoEnabled = window.remotion_videoEnabled;
	window.remotion_videoEnabled = true;
	const consoleError = spyOn(console, 'error').mockImplementation(() => {});

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

		// The frame is blocked until the video has loaded
		expect(scope.remotion_renderReady).toBe(false);

		const video = container.querySelector('video') as HTMLVideoElement;
		Object.defineProperty(video, 'error', {
			configurable: true,
			value: {
				code: 4,
				message:
					'DEMUXER_ERROR_NO_SUPPORTED_STREAMS: FFmpegDemuxer: no supported streams',
			},
		});
		fireEvent.error(video);

		expect(errors).toHaveLength(1);
		expect(errors[0]).toBeInstanceOf(MediaPlaybackError);
		expect(errors[0].message).toBe(
			'Code 4: DEMUXER_ERROR_NO_SUPPORTED_STREAMS: FFmpegDemuxer: no supported streams',
		);
		expect((errors[0] as MediaPlaybackError).src).toBe(src);

		// Swapping in a fallback releases the video's delayRender() handles
		expect(screen.getByText('Fallback')).toBeTruthy();
		expect(container.querySelector('video')).toBeNull();
		expect(scope.remotion_delayRenderHandles).toEqual([]);
		expect(scope.remotion_delayRenderTimeouts).toEqual({});
		expect(scope.remotion_renderReady).toBe(true);
	} finally {
		cleanup();
		consoleError.mockRestore();
		window.remotion_videoEnabled = originalVideoEnabled;
		window.process.env.NODE_ENV = originalNodeEnv;
	}
});
