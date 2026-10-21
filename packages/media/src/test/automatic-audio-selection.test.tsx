import {Player} from '@remotion/player';
import {ALL_FORMATS, BlobSource, Input} from 'mediabunny';
import {createRoot} from 'react-dom/client';
import {expect, test, vi} from 'vitest';
import {page} from 'vitest/browser';
import {Video} from '../video/video';

// Synthetic equivalent of #12433: genuinely encoded ALAC (unsupported by
// Mediabunny) followed by AAC, without modifying codec tags. Recreate with:
// ffmpeg -f lavfi -i 'color=c=red:s=64x64:r=30:d=1' \
//   -f lavfi -i 'sine=frequency=220:sample_rate=48000:duration=1' \
//   -f lavfi -i 'sine=frequency=880:sample_rate=48000:duration=1' \
//   -map 0:v -map 1:a -map 2:a -c:v libx264 -pix_fmt yuv420p \
//   -c:a:0 alac -c:a:1 aac -b:a:1 64k -ac 2 \
//   -disposition:a:0 default -disposition:a:1 0 -movflags +faststart fixture.mov
const fixture =
	'https://remotion.media/media-tests/unsupported-primary-alac-aac-v1.mov';

test('Video renders and plays a decodable alternative to an unsupported default audio track', async () => {
	const response = await fetch(fixture);
	expect(response.ok).toBe(true);
	const blob = await response.blob();
	const input = new Input({source: new BlobSource(blob), formats: ALL_FORMATS});
	const src = URL.createObjectURL(blob);
	const container = document.createElement('div');
	document.body.appendChild(container);
	const root = createRoot(container);
	// Observe actual Web Audio playback without replacing the implementation.
	const starts = vi.spyOn(AudioBufferSourceNode.prototype, 'start');
	const Composition = () => (
		<Video src={src} disallowFallbackToOffthreadVideo />
	);

	try {
		const tracks = await input.getAudioTracks();
		expect(await Promise.all(tracks.map((track) => track.canDecode()))).toEqual(
			[false, true],
		);
		expect(
			await (await input.getPrimaryVideoTrack())!.getPrimaryPairableAudioTrack(),
		).toBe(tracks[0]);

		root.render(
			<Player
				acknowledgeRemotionLicense
				component={Composition}
				inputProps={{}}
				compositionWidth={64}
				compositionHeight={64}
				durationInFrames={30}
				fps={30}
				style={{width: 320}}
				controls
			/>,
		);
		await vi.waitFor(() => {
			const canvas = container.querySelector('canvas');
			expect(canvas?.width).toBe(64);
			const pixel = canvas!.getContext('2d')!.getImageData(32, 32, 1, 1).data;
			expect(pixel[0]).toBeGreaterThan(240);
			expect(pixel[1]).toBeLessThan(50);
			expect(pixel[2]).toBeLessThan(50);
		});
		await page.getByRole('button', {name: 'Play video'}).click();
		await vi.waitFor(() => {
			const buffers = (starts.mock.contexts as AudioBufferSourceNode[])
				.map((node) => node.buffer)
				.filter((buffer): buffer is AudioBuffer => buffer !== null);
			const audible = buffers.find((buffer) =>
				buffer.getChannelData(0).some((sample) => Math.abs(sample) > 0.01),
			);
			expect(audible).toBeDefined();
			const samples = audible!.getChannelData(0);
			const crossings: number[] = [];
			for (let i = 1; i < samples.length; i++) {
				if (samples[i - 1] <= 0.02 && samples[i] > 0.02) {
					crossings.push(i);
				}
			}

			// Measure between crossings to exclude decoder priming/padded silence.
			const frequency =
				((crossings.length - 1) * audible!.sampleRate) /
				(crossings[crossings.length - 1] - crossings[0]);
			expect(frequency).toBeGreaterThan(800);
			expect(frequency).toBeLessThan(960);
		});
	} finally {
		root.unmount();
		container.remove();
		starts.mockRestore();
		input.dispose();
		URL.revokeObjectURL(src);
	}
});
