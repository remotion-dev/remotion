import {afterEach, expect, test} from 'bun:test';
import {useMemo, useState} from 'react';
import {AnimatedImage, Html5Audio, Html5Video, Internals} from 'remotion';
import {Player} from '../Player.js';
import {act, cleanup, render} from './test-utils.js';

afterEach(() => {
	cleanup();
	window.origin = 'http://localhost:3000';
});

test('Player resolves media sources when its origin is opaque', () => {
	window.origin = 'null';
	let playerError: Error | null = null;
	let setAudioSource: ((src: string) => void) | null = null;
	const MediaComposition = () => {
		const [audioSource, setAudioSourceState] = useState(
			'https://example.com/audio.mp3',
		);
		const sequenceManagerContext = useMemo(
			() => ({
				registerSequence: () => undefined,
				unregisterSequence: () => undefined,
				updateSequence: null,
				sequences: [],
			}),
			[],
		);
		setAudioSource = setAudioSourceState;

		return (
			<Internals.SequenceManager.Provider value={sequenceManagerContext}>
				<Html5Video src="/video.mp4" />
				<Html5Audio src={audioSource} />
				<AnimatedImage
					src="https://example.com/image.gif"
					onError={() => undefined}
				/>
			</Internals.SequenceManager.Provider>
		);
	};

	const view = render(
		<Player
			acknowledgeRemotionLicense
			component={MediaComposition}
			durationInFrames={100}
			compositionWidth={1920}
			compositionHeight={1080}
			fps={30}
			errorFallback={({error}) => {
				playerError = error;
				return null;
			}}
		/>,
	);

	expect(playerError).toBeNull();
	expect(view.container.querySelector('video')).toBeInstanceOf(
		HTMLVideoElement,
	);
	expect(
		[...view.container.querySelectorAll('audio')].some(
			(audio) => audio.src === 'https://example.com/audio.mp3',
		),
	).toBe(true);
	expect(view.container.querySelector('canvas')).toBeInstanceOf(
		HTMLCanvasElement,
	);

	act(() => setAudioSource?.('https://example.com/updated-audio.mp3'));
	expect(
		[...view.container.querySelectorAll('audio')].some(
			(audio) => audio.src === 'https://example.com/updated-audio.mp3',
		),
	).toBe(true);
});
