import {Player} from '@remotion/player';
import React from 'react';
import {createRoot} from 'react-dom/client';
import {expect, test, vi} from 'vitest';
import {Audio} from '../audio/audio';
import {Video} from '../video/video';

vi.mock('../audio/audio-for-preview', () => ({
	AudioForPreview: ({style}: {readonly style: React.CSSProperties | null}) => (
		<div data-testid="premounted-audio" style={style ?? undefined} />
	),
}));

const waitFor = async (predicate: () => boolean) => {
	const started = Date.now();
	while (Date.now() - started < 10000) {
		if (predicate()) {
			return;
		}

		await new Promise((resolve) => setTimeout(resolve, 10));
	}

	throw new Error('Timed out waiting for condition');
};

test('premounts a Video and hides its canvas', async () => {
	const container = document.createElement('div');
	document.body.appendChild(container);

	const Composition: React.FC = () => {
		return (
			<Video
				data-testid="premounted-video"
				durationInFrames={20}
				from={10}
				premountFor={10}
				src="/bigbuckbunny.mp4"
				style={{opacity: 0.5}}
			/>
		);
	};

	const root = createRoot(container);
	root.render(
		<Player
			acknowledgeRemotionLicense
			component={Composition}
			compositionHeight={720}
			compositionWidth={1280}
			durationInFrames={100}
			fps={30}
			initiallyMuted
			inputProps={{}}
		/>,
	);

	try {
		await waitFor(
			() =>
				container.querySelector('[data-testid="premounted-video"]') !== null,
		);
		const canvas = container.querySelector('[data-testid="premounted-video"]');
		expect(canvas).toBeInstanceOf(HTMLCanvasElement);
		expect(canvas?.getAttribute('style')).toContain('display: none');
		expect(canvas?.getAttribute('style')).toContain('pointer-events: none');
		await waitFor(
			() =>
				canvas instanceof HTMLCanvasElement &&
				canvas.width > 0 &&
				canvas.height > 0,
		);
	} finally {
		root.unmount();
		container.remove();
	}
});

test('styleWhilePremounted overrides the default Video premount style', async () => {
	const container = document.createElement('div');
	document.body.appendChild(container);

	const Composition: React.FC = () => {
		return (
			<Video
				data-testid="premounted-video"
				from={10}
				premountFor={10}
				src="/bigbuckbunny.mp4"
				styleWhilePremounted={{display: 'block', opacity: 0.25}}
			/>
		);
	};

	const root = createRoot(container);
	root.render(
		<Player
			acknowledgeRemotionLicense
			component={Composition}
			compositionHeight={720}
			compositionWidth={1280}
			durationInFrames={100}
			fps={30}
			initiallyMuted
			inputProps={{}}
		/>,
	);

	try {
		await waitFor(
			() =>
				container.querySelector('[data-testid="premounted-video"]') !== null,
		);
		const canvas = container.querySelector('[data-testid="premounted-video"]');
		expect(canvas?.getAttribute('style')).toContain('opacity: 0.25');
		expect(canvas?.getAttribute('style')).toContain('display: block');
	} finally {
		root.unmount();
		container.remove();
	}
});

test('premounts Audio and hides its fallback element', async () => {
	const container = document.createElement('div');
	document.body.appendChild(container);

	const Composition: React.FC = () => (
		<Audio durationInFrames={20} from={10} premountFor={10} src="/audio.mp3" />
	);

	const root = createRoot(container);
	root.render(
		<Player
			acknowledgeRemotionLicense
			component={Composition}
			compositionHeight={720}
			compositionWidth={1280}
			durationInFrames={100}
			fps={30}
			initiallyMuted
			inputProps={{}}
		/>,
	);

	try {
		await waitFor(
			() =>
				container.querySelector('[data-testid="premounted-audio"]') !== null,
		);
		const audio = container.querySelector('[data-testid="premounted-audio"]');
		expect(audio?.getAttribute('style')).toContain('display: none');
		expect(audio?.getAttribute('style')).toContain('pointer-events: none');
	} finally {
		root.unmount();
		container.remove();
	}
});
