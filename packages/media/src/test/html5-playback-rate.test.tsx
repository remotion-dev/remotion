import {Player, type PlayerRef} from '@remotion/player';
import React from 'react';
import {createRoot} from 'react-dom/client';
import {
	Html5Audio,
	Html5Video,
	Internals,
	Sequence,
	type TSequence,
} from 'remotion';
import {expect, test} from 'vitest';

test('preserves the Player media playback rate across source changes and reloads', async () => {
	const container = document.createElement('div');
	document.body.appendChild(container);
	const root = createRoot(container);
	const playerRef = React.createRef<PlayerRef>();
	const audioRef = React.createRef<HTMLAudioElement>();
	const shortVideoRef = React.createRef<HTMLVideoElement>();
	let registered: TSequence[] = [];
	const ObserveSequences: React.FC = () => {
		registered = React.useContext(Internals.SequenceManager).sequences;
		return null;
	};

	const volume = (frame: number) => 0.2 + frame / 200;
	const Composition: React.FC<{readonly src: string}> = ({src}) => (
		<Internals.SequenceManagerProvider>
			<Internals.SequenceRegistrationContext.Provider value>
				<Sequence from={10} playbackRate={2} trimBefore={10}>
					<Sequence from={8} playbackRate={0.75}>
						<Html5Video
							src={src}
							playbackRate={0.6}
							trimBefore={12}
							volume={volume}
						/>
						<Html5Audio
							ref={audioRef}
							volume={volume}
							src={src}
							playbackRate={0.6}
							trimBefore={12}
						/>
					</Sequence>
				</Sequence>
				<Sequence from={10} durationInFrames={2} playbackRate={0.5}>
					<Html5Video
						ref={shortVideoRef}
						src={`${src}&short=true`}
						name="Fractional duration"
						volume={(frame) => 0.25 + frame ** 2}
					/>
				</Sequence>
				<ObserveSequences />
			</Internals.SequenceRegistrationContext.Provider>
		</Internals.SequenceManagerProvider>
	);

	try {
		for (const [index, globalRate] of [1, 0.5].entries()) {
			root.render(
				<Player
					ref={playerRef}
					initialFrame={30}
					acknowledgeRemotionLicense
					component={Composition}
					compositionHeight={720}
					compositionWidth={1280}
					durationInFrames={100}
					fps={30}
					initiallyMuted
					playbackRate={globalRate}
					inputProps={{src: `/bigbuckbunny.mp4?source=${index}`}}
				/>,
			);
			await expect
				.poll(() => container.querySelector('video')?.readyState)
				.toBe(4);
			const video = container.querySelector('video')!;
			await expect.poll(() => video.playbackRate).toBeCloseTo(0.9 * globalRate);

			await expect
				.poll(() => audioRef.current?.playbackRate)
				.toBeCloseTo(0.9 * globalRate);
			await expect.poll(() => video.currentTime).toBeCloseTo(1.03);
			await expect.poll(() => audioRef.current?.currentTime).toBeCloseTo(1.03);
			const media = registered.filter(
				(sequence) => sequence.type === 'audio' || sequence.type === 'video',
			);
			expect(media).toHaveLength(2);
			for (const sequence of media) {
				expect(typeof sequence.volume).toBe('string');
				expect(Number(String(sequence.volume).split(',')[20])).toBeCloseTo(
					video.volume,
				);
			}

			expect(video.volume).toBeCloseTo(0.35);
			expect(audioRef.current!.volume).toBeCloseTo(0.35);
			playerRef.current!.seekTo(40);
			await expect.poll(() => video.currentTime).toBeCloseTo(1.33);
			await expect.poll(() => audioRef.current?.currentTime).toBeCloseTo(1.33);
			for (const sequence of media) {
				expect(Number(String(sequence.volume).split(',')[30])).toBeCloseTo(
					video.volume,
				);
			}

			expect(video.volume).toBeCloseTo(0.425);
			expect(audioRef.current!.volume).toBeCloseTo(0.425);
			playerRef.current!.seekTo(10);
			await expect.poll(() => video.currentTime).toBeCloseTo(0.43);
			await expect.poll(() => audioRef.current?.currentTime).toBeCloseTo(0.43);
			for (const sequence of media) {
				expect(Number(String(sequence.volume).split(',')[0])).toBeCloseTo(
					video.volume,
				);
			}

			expect(video.volume).toBeCloseTo(0.2);
			expect(audioRef.current!.volume).toBeCloseTo(0.2);
			await expect.poll(() => shortVideoRef.current?.volume).toBe(0.25);
			const shortSequence = registered.find(
				(sequence) =>
					sequence.type === 'video' && sequence.src.includes('short=true'),
			);
			expect(
				shortSequence && 'volume' in shortSequence
					? shortSequence.volume
					: null,
			).toBe('0.25,0.5');
			playerRef.current!.seekTo(11);
			await expect.poll(() => shortVideoRef.current?.volume).toBe(0.5);
			playerRef.current!.seekTo(30);

			// Loading a new resource resets playbackRate to defaultPlaybackRate.
			video.src = `/bigbuckbunny.mp4?reload=${index}`;
			video.load();
			await expect.poll(() => video.readyState).toBe(4);
			expect(video.playbackRate).toBeCloseTo(0.9 * globalRate);
		}
	} finally {
		root.unmount();
		container.remove();
	}
});
