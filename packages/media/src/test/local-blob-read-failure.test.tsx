import {Player, type PlayerRef} from '@remotion/player';
import React, {useState} from 'react';
import {createRoot} from 'react-dom/client';
import {expect, test, vi} from 'vitest';
import {Audio} from '../audio/audio';
import {makeSinks} from '../video-extraction/get-frames-since-keyframe';

const failBlobBody = () => {
	const src = URL.createObjectURL(new Blob([new Uint8Array(1024)]));
	const error = new TypeError('network error');
	const originalFetch = globalThis.fetch;
	const fetchSpy = vi
		.spyOn(globalThis, 'fetch')
		.mockImplementation((url, init) => {
			if (String(url) !== src) {
				return originalFetch(url, init);
			}

			return Promise.resolve(
				new Response(
					new ReadableStream({
						start(controller) {
							controller.error(error);
						},
					}),
					{
						status: 206,
						headers: {
							'Content-Length': '1024',
							'Content-Range': 'bytes 0-1023/1024',
						},
					},
				),
			);
		});

	return {
		src,
		error,
		cleanup: () => {
			fetchSpy.mockRestore();
			URL.revokeObjectURL(src);
		},
	};
};

test('surfaces a failed local body read through Audio onError and permits reopening a readable source', async () => {
	const {src, error, cleanup} = failBlobBody();
	const container = document.createElement('div');
	document.body.appendChild(container);
	const root = createRoot(container);
	const player = React.createRef<PlayerRef>();
	const onError = vi.fn();
	const Composition = () => {
		const [currentSrc, setSrc] = useState(src);
		return (
			<Audio
				key={currentSrc}
				src={currentSrc}
				onError={(failure) => {
					onError(failure);
					setSrc('/voice-note.m4a');
					return 'fallback';
				}}
			/>
		);
	};

	try {
		root.render(
			<Player
				ref={player}
				acknowledgeRemotionLicense
				component={Composition}
				compositionWidth={320}
				compositionHeight={180}
				durationInFrames={150}
				fps={30}
				autoPlay
			/>,
		);
		await expect.poll(() => onError.mock.calls.length, {timeout: 3000}).toBe(1);
		await expect
			.poll(() => player.current?.getCurrentFrame(), {timeout: 10000})
			.toBeGreaterThan(15);
		expect(onError).toHaveBeenCalledExactlyOnceWith(error);
	} finally {
		root.unmount();
		container.remove();
		cleanup();
	}
});

test('surfaces a failed local body read to the render-frame input', async () => {
	const {src, error, cleanup} = failBlobBody();
	const sinks = makeSinks(src, 'error', undefined);
	let deadline: ReturnType<typeof setTimeout> | null = null;

	try {
		const result = await Promise.race([
			sinks.promise,
			new Promise<never>((_, reject) => {
				deadline = setTimeout(
					() => reject(new Error('Local read remained pending')),
					3000,
				);
			}),
		]);
		expect(result.formatDetectionError).toBe(error);
		await expect(result.getDuration()).rejects.toBe(error);
	} finally {
		if (deadline !== null) clearTimeout(deadline);
		sinks.dispose();
		cleanup();
	}
});
