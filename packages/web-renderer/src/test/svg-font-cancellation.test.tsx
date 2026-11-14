import {NoReactInternals} from 'remotion/no-react';
import {expect, test, vi} from 'vitest';
import '../symbol-dispose';
import {renderMediaOnWeb} from '../render-media-on-web';
import {
	onlyOneMediaRenderAtATimeQueue,
	onlyOneStillRenderAtATimeQueue,
} from '../render-operations-queue';
import {renderStillOnWeb} from '../render-still-on-web';

test.for(['still', 'media'] as const)(
	'cancels public %s capture while its CSS font fetch remains pending',
	async (api) => {
		const url = new URL(
			'../../../example/public/bangers.woff2',
			import.meta.url,
		).href;
		const fontData = await (await fetch(url)).arrayBuffer();
		const family = `SVG pending ${api} capture`;
		const style = document.createElement('style');
		style.textContent = `@font-face{font-family:"${family}";src:url("${url}") format("woff2")}`;
		document.head.appendChild(style);
		let release!: (data: ArrayBuffer) => void;
		let entered!: () => void;
		const started = new Promise<void>((resolve) => {
			entered = resolve;
		});
		const held = new Promise<ArrayBuffer>((resolve) => {
			release = resolve;
		});
		const controller = new AbortController();
		const Component = () => (
			<svg width="240" height="80" className="svg-font-abort-capture">
				<text x="4" y="48" style={{fontFamily: family, fontSize: 40}}>
					Pending font
				</text>
			</svg>
		);
		let settled = false;
		let error: unknown = null;
		let render: Promise<unknown> | null = null;
		let fetchFont: ReturnType<typeof vi.spyOn> | null = null;
		try {
			const faces = await document.fonts.load(`40px "${family}"`);
			expect(faces).toHaveLength(1);
			expect(faces[0].status).toBe('loaded');
			fetchFont = vi
				.spyOn(NoReactInternals, 'fetchFontData')
				.mockImplementation(() => {
					entered();
					return held;
				});
			const options = {
				composition: {
					component: Component,
					id: `svg-pending-${api}`,
					width: 240,
					height: 80,
					fps: 30,
					durationInFrames: 1,
				},
				inputProps: {},
				licenseKey: 'free-license',
				allowHtmlInCanvas: false,
				signal: controller.signal,
			} as const;
			render = (
				api === 'still'
					? renderStillOnWeb({...options, frame: 0})
					: renderMediaOnWeb({...options, container: 'webm'})
			).then(
				() => {
					settled = true;
				},
				(reason) => {
					error = reason;
					settled = true;
				},
			);
			await started;
			expect(settled).toBe(false);
			controller.abort();
			// The request is deliberately unreleased: cancellation must settle first.
			await expect.poll(() => settled, {timeout: 1000}).toBe(true);
			expect(error).toBeInstanceOf(Error);
			expect((error as Error).message).toMatch(/cancelled/i);
			await expect(
				(api === 'still'
					? onlyOneStillRenderAtATimeQueue
					: onlyOneMediaRenderAtATimeQueue
				).ref,
			).resolves.toBeUndefined();
			expect(document.querySelector('.svg-font-abort-capture')).toBeNull();
			expect(fetchFont).toHaveBeenCalledTimes(1);
		} finally {
			release(fontData);
			await render;
			fetchFont?.mockRestore();
			style.remove();
		}
	},
);
