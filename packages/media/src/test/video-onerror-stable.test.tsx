import {Player} from '@remotion/player';
import React, {useEffect, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {expect, test, vi} from 'vitest';
import {Audio} from '../audio/audio';
import {MediaPlayer} from '../media-player';
import {callOnErrorAndResolve} from '../on-error';
import {Video} from '../video/video';

const waitFor = async (predicate: () => boolean) => {
	const started = Date.now();
	while (Date.now() - started < 10000) {
		if (predicate()) {
			return;
		}

		await new Promise((resolve) => setTimeout(resolve, 100));
	}

	throw new Error('Timed out waiting for condition');
};

test.each([
	['video', 'callback'],
	['audio', 'disallow'],
	['video', 'disallow'],
] as const)(
	'surfaces terminal %s failures with %s policy through the preview error boundary',
	async (tagType, policy) => {
		const container = document.createElement('div');
		document.body.appendChild(container);
		const root = createRoot(container);
		let player: MediaPlayer | null = null;
		const {initialize} = MediaPlayer.prototype;
		const initSpy = vi
			.spyOn(MediaPlayer.prototype, 'initialize')
			.mockImplementation(function (this: MediaPlayer, ...args) {
				return initialize.apply(this, args).then((result) => {
					if (result.type === 'success') {
						player = this;
					}

					return result;
				});
			});
		const error = new Error('Terminal preview read failure');
		const Composition = () =>
			tagType === 'audio' ? (
				<Audio src="/voice-note.m4a" disallowFallbackToHtml5Audio />
			) : (
				<Video
					src="/bigbuckbunny.mp4"
					onError={policy === 'callback' ? () => 'fail' : undefined}
					disallowFallbackToOffthreadVideo={policy === 'disallow'}
				/>
			);
		root.render(
			<Player
				acknowledgeRemotionLicense
				component={Composition}
				compositionHeight={720}
				compositionWidth={1280}
				durationInFrames={100}
				fps={30}
				inputProps={{}}
				errorFallback={({error: caught}) => <div>{caught.message}</div>}
			/>,
		);
		try {
			await waitFor(() => player !== null);
			// Exercise the callback owned by the preview, not the seek catch.
			// eslint-disable-next-line dot-notation
			player!['reportTerminalError'](error);
			await waitFor(
				() => container.textContent?.includes(error.message) === true,
			);
		} finally {
			root.unmount();
			container.remove();
			initSpy.mockRestore();
		}
	},
);

test('does not reinitialize MediaPlayer when onError or maxCanvasSinkFrameSize identity changes', async () => {
	const container = document.createElement('div');
	document.body.appendChild(container);

	const initSpy = vi.spyOn(MediaPlayer.prototype, 'initialize');
	const root = createRoot(container);
	let committedRerenders = 0;
	let lastFrameSize = '';
	let setMaxWidth: (maxWidth: number) => void = () => {};

	const VideoComposition: React.FC = () => {
		const [rerenders, setRerenders] = useState(0);
		const [maxWidth, setMaxWidthState] = useState(333);
		setMaxWidth = setMaxWidthState;

		useEffect(() => {
			const interval = window.setInterval(() => {
				setRerenders((current) => {
					if (current >= 4) {
						window.clearInterval(interval);
						return current;
					}

					return current + 1;
				});
			}, 50);

			return () => window.clearInterval(interval);
		}, []);

		useEffect(() => {
			committedRerenders = rerenders;
		}, [rerenders]);

		return (
			<Video
				src="/bigbuckbunny.mp4"
				onError={() => {}}
				maxCanvasSinkFrameSize={{width: maxWidth}}
				onVideoFrame={(frame) => {
					const {width, height} = frame as HTMLCanvasElement;
					lastFrameSize = `${width}x${height}`;
				}}
			/>
		);
	};

	root.render(
		<Player
			acknowledgeRemotionLicense
			component={VideoComposition}
			compositionHeight={720}
			compositionWidth={1280}
			durationInFrames={100}
			fps={30}
			initiallyMuted
			inputProps={{}}
		/>,
	);

	try {
		await waitFor(() => {
			const renderedCanvas = container.querySelector('canvas');
			return (
				renderedCanvas?.width === 1280 &&
				renderedCanvas.height === 720 &&
				committedRerenders >= 4 &&
				lastFrameSize !== ''
			);
		});

		expect(initSpy.mock.calls.length).toBe(1);

		// The frames are smaller, the canvas keeps the size of the video and the
		// frame is scaled up to its edges.
		expect(lastFrameSize).toBe('333x187');
		const canvas = container.querySelector('canvas')!;
		expect(canvas.getContext('2d')!.getImageData(1279, 719, 1, 1).data[3]).toBe(
			255,
		);

		// New numbers take effect. Frames are never upscaled.
		setMaxWidth(4000);
		await waitFor(() => lastFrameSize === '1280x720');
		expect(initSpy.mock.calls.length).toBe(2);
	} finally {
		root.unmount();
		container.remove();
		initSpy.mockRestore();
	}
});

test.each(['video', 'audio'] as const)(
	'awaits a rejected %s recovery callback and reports it once',
	async (tagType) => {
		const container = document.createElement('div');
		document.body.appendChild(container);
		const root = createRoot(container);
		let entered = false;
		let release: () => void = () => {};
		const pending = new Promise<void>((resolve) => {
			release = resolve;
		});
		const replacement = new Error('Application recovery failed');
		let caught: Error | null = null;
		let calls = 0;
		const onError = async () => {
			calls++;
			entered = true;
			await pending;
			throw replacement;
		};

		const Composition = () =>
			tagType === 'video' ? (
				<Video src="data:application/octet-stream,invalid" onError={onError} />
			) : (
				<Audio src="data:application/octet-stream,invalid" onError={onError} />
			);
		root.render(
			<Player
				acknowledgeRemotionLicense
				component={Composition}
				compositionHeight={16}
				compositionWidth={16}
				durationInFrames={30}
				fps={30}
				inputProps={{}}
				errorFallback={({error}) => {
					caught = error;
					return null;
				}}
			/>,
		);
		try {
			await waitFor(() => entered);
			expect(caught).toBe(null);
			release();
			await waitFor(() => caught !== null);
			expect(caught).toBe(replacement);
			expect(calls).toBe(1);
		} finally {
			release();
			root.unmount();
			container.remove();
		}
	},
);

// PR #12290 review: explicit failure keeps browser-render context, while a
// handler's rejected replacement Error keeps its identity and custom fields.
test('browser failure decisions distinguish the asset error from handler rejection', async () => {
	const assetError = new Error('Unknown container format');
	const browserError = new Error(
		'Cannot render video: Unknown container format',
	);
	const options = {
		error: assetError,
		clientSideError: browserError,
		disallowFallback: false,
		isClientSideRendering: true,
	};
	expect(
		await callOnErrorAndResolve({...options, onError: () => 'fail'}),
	).toEqual(['fail', browserError]);
	expect(browserError.cause).toBe(assetError);
	const replacement = Object.assign(new Error('Replacement failed'), {
		assetId: 'asset-1',
	});
	const [action, error] = await callOnErrorAndResolve({
		...options,
		onError: () => Promise.reject(replacement),
	});
	expect(action).toBe('fail');
	expect(error).toBe(replacement);
	expect(error).toHaveProperty('assetId', 'asset-1');
});
