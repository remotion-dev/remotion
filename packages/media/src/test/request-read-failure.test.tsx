import {Player, type PlayerRef} from '@remotion/player';
import React, {useState} from 'react';
import {createRoot} from 'react-dom/client';
import {expect, test, vi} from 'vitest';
import {Audio} from '../audio/audio';
import {makeSinks} from '../video-extraction/get-frames-since-keyframe';

const failRequest = (scheme: string, status: number) => {
	const src =
		scheme === 'blob'
			? URL.createObjectURL(new Blob([new Uint8Array(1024)]))
			: `${scheme}://example.invalid/${crypto.randomUUID()}`;
	let requests = 0;
	const error = new TypeError('network error');
	const originalFetch = globalThis.fetch;
	const fetchSpy = vi
		.spyOn(globalThis, 'fetch')
		.mockImplementation((url, init) => {
			if (String(url) !== src) {
				return originalFetch(url, init);
			}

			requests++;
			if (status === 0) return Promise.reject(error);
			return Promise.resolve(
				new Response(
					new ReadableStream({
						start(controller) {
							controller.error(error);
						},
					}),
					{
						status,
						headers: {
							'Content-Length': '1024',
							...(status === 206 ? {'Content-Range': 'bytes 0-1023/1024'} : {}),
						},
					},
				),
			);
		});

	return {
		src,
		error,
		requests: () => requests,
		cleanup: () => {
			fetchSpy.mockRestore();
			URL.revokeObjectURL(src);
		},
	};
};

test.each([
	['blob', 206],
	['http', 206],
	['https', 200],
	['https', 0],
] as const)(
	'surfaces persistent %s request failures (%i) through Audio onError and permits reopening a readable source',
	async (scheme, status) => {
		const {src, error, cleanup, requests} = failRequest(scheme, status);
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
			await expect
				.poll(() => onError.mock.calls.length, {timeout: 3000})
				.toBe(1);
			await expect
				.poll(() => player.current?.getCurrentFrame(), {timeout: 10000})
				.toBeGreaterThan(15);
			expect(onError).toHaveBeenCalledExactlyOnceWith(error);
			expect(requests()).toBe(3);
		} finally {
			root.unmount();
			container.remove();
			cleanup();
		}
	},
);

test.each([
	['blob', 206],
	['http', 200],
	['https', 206],
	['https', 0],
] as const)(
	'surfaces persistent %s request failures (%i) to the render-frame input',
	async (scheme, status) => {
		const {src, error, cleanup, requests} = failRequest(scheme, status);
		const sinks = makeSinks(src, 'error', undefined);
		let deadline: ReturnType<typeof setTimeout> | null = null;

		try {
			const result = await Promise.race([
				sinks.promise,
				new Promise<never>((_, reject) => {
					deadline = setTimeout(
						() => reject(new Error('Failed request remained pending')),
						3000,
					);
				}),
			]);
			expect(result.formatDetectionError).toBe(error);
			expect(requests()).toBe(3);
			await expect(result.getDuration()).rejects.toBe(error);
		} finally {
			if (deadline !== null) clearTimeout(deadline);
			sinks.dispose();
			cleanup();
		}
	},
);
