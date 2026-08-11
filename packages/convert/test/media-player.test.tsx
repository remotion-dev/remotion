import {afterEach, expect, mock, test} from 'bun:test';
import {cleanup, fireEvent, render} from '@testing-library/react';
import {useState} from 'react';

mock.module('@remotion/media', () => ({
	Audio: () => null,
	Video: () => null,
}));

const {
	getDurationInFrames,
	getPlayerDimensions,
	getPlayerFps,
	getVideoPreviewStyle,
	VideoPlayer,
} = await import('../app/components/MediaPlayer');

afterEach(() => cleanup());

const TrimmingPlayer = () => {
	const [trimInFrame, setTrimInFrame] = useState<number | null>(null);
	const [trimOutFrame, setTrimOutFrame] = useState<number | null>(null);

	return (
		<VideoPlayer
			src={{type: 'url', url: 'https://example.com/video.mp4'}}
			waveform={[]}
			isAudio={false}
			crop={false}
			trim
			trimInFrame={trimInFrame}
			trimOutFrame={trimOutFrame}
			setTrimInFrame={setTrimInFrame}
			setTrimOutFrame={setTrimOutFrame}
			unclampedRect={{left: 0, top: 0, width: 1920, height: 1080}}
			setUnclampedRect={() => undefined}
			dimensions={{width: 1920, height: 1080}}
			durationInSeconds={10}
			fps={30}
			rotation={0}
			mirrorHorizontal={false}
			mirrorVertical={false}
			cursorData={null}
			showCursor={false}
			cursorScale={1}
			onPlaybackTimeChange={() => undefined}
		/>
	);
};

test('uses exported video geometry without changing player timing', () => {
	const landscape = {width: 1920, height: 1080};

	expect(
		getPlayerDimensions({
			dimensions: landscape,
			isAudio: false,
			rotation: 0,
		}),
	).toEqual(landscape);
	expect(
		getPlayerDimensions({
			dimensions: landscape,
			isAudio: false,
			rotation: 90,
		}),
	).toEqual({width: 1080, height: 1920});
	expect(
		getPlayerDimensions({
			dimensions: landscape,
			isAudio: false,
			rotation: 180,
		}),
	).toEqual(landscape);

	expect(
		getDurationInFrames({
			durationInSeconds: 2.5,
			fps: 30,
		}),
	).toBe(75);

	expect(
		getVideoPreviewStyle({
			width: 1080,
			height: 1920,
			rotation: 90,
			mirrorHorizontal: true,
			mirrorVertical: false,
		}),
	).toMatchObject({
		width: 1920,
		height: 1080,
		transform: 'translate(-50%, -50%) scale(-1, 1) rotate(90deg)',
	});
});

test('uses the probed FPS in the player', () => {
	expect(getPlayerFps(1.54)).toBe(1.54);
	expect(getPlayerFps(120)).toBe(120);
	expect(getPlayerFps(null)).toBe(30);
});

test('pauses playback when trimming', () => {
	const rendered = render(<TrimmingPlayer />);

	fireEvent.click(rendered.getByRole('button', {name: 'Play video'}));
	expect(rendered.getByRole('button', {name: 'Pause video'})).not.toBeNull();

	fireEvent.click(
		rendered.getByRole('button', {
			name: 'Move trim start forward by 1 frame',
		}),
	);
	expect(rendered.getByRole('button', {name: 'Play video'})).not.toBeNull();
});
