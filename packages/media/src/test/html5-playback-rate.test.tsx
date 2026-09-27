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
				.poll(() => container.querySelector('video')?.readyState, {
					timeout: 10_000,
				})
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
			).toBe('0.25,0.5,1.25,2.5');
			playerRef.current!.seekTo(11);
			await expect.poll(() => shortVideoRef.current?.volume).toBe(0.5);
			playerRef.current!.seekTo(30);

			// Loading a new resource resets playbackRate to defaultPlaybackRate.
			video.src = `/bigbuckbunny.mp4?reload=${index}`;
			video.load();
			await expect.poll(() => video.readyState, {timeout: 10_000}).toBe(4);
			expect(video.playbackRate).toBeCloseTo(0.9 * globalRate);
		}
	} finally {
		root.unmount();
		container.remove();
	}
}, 30_000);

test('seeks trimmed HTML5 loops across fractional boundaries under nested sequence rates', async () => {
	const container = document.createElement('div');
	document.body.appendChild(container);
	const root = createRoot(container);
	const playerRef = React.createRef<PlayerRef>();
	const videoRef = React.createRef<HTMLVideoElement>();
	const audioRef = React.createRef<HTMLAudioElement>();
	let registered: TSequence[] = [];

	const ObserveSequences: React.FC = () => {
		registered = React.useContext(Internals.SequenceManager).sequences;
		return null;
	};

	const volume = (frame: number) => 0.2 + frame / 2000;
	const Composition: React.FC<{
		readonly mediaRate: number;
		readonly useThreeLevels: boolean;
	}> = ({mediaRate, useThreeLevels}) => {
		const media = (
			<>
				<Html5Video
					ref={videoRef}
					src="/bigbuckbunny.mp4"
					trimBefore={useThreeLevels ? 197 : 12}
					trimAfter={useThreeLevels ? 268 : 22}
					playbackRate={mediaRate}
					volume={volume}
					loopVolumeCurveBehavior="repeat"
					loop
				/>
				<Html5Audio
					ref={audioRef}
					src="/bigbuckbunny.mp4?loop-audio"
					trimBefore={useThreeLevels ? 197 : 12}
					trimAfter={useThreeLevels ? 268 : 22}
					playbackRate={mediaRate}
					volume={volume}
					loopVolumeCurveBehavior="extend"
					loop
				/>
			</>
		);
		const nested = useThreeLevels ? (
			<Sequence
				from={12}
				trimBefore={7}
				playbackRate={2}
				durationInFrames={180}
			>
				<Sequence
					from={11}
					trimBefore={5}
					playbackRate={0.5}
					durationInFrames={340}
				>
					<Sequence
						from={9}
						trimBefore={13}
						playbackRate={3.1}
						durationInFrames={150}
					>
						<Sequence from={17} durationInFrames={420}>
							{media}
						</Sequence>
					</Sequence>
				</Sequence>
			</Sequence>
		) : (
			<Sequence from={7} playbackRate={2.5} trimBefore={8}>
				<Sequence from={8} playbackRate={0.8} trimBefore={10}>
					{media}
				</Sequence>
			</Sequence>
		);
		return (
			<Internals.SequenceManagerProvider>
				<Internals.SequenceRegistrationContext.Provider value>
					{nested}
					<ObserveSequences />
				</Internals.SequenceRegistrationContext.Provider>
			</Internals.SequenceManagerProvider>
		);
	};

	try {
		for (const mediaRate of [0.6, 0.7, 1.1, 0.75]) {
			const useThreeLevels = mediaRate === 0.75;
			root.render(
				<Player
					key={mediaRate}
					ref={playerRef}
					initialFrame={useThreeLevels ? 50 : 7}
					acknowledgeRemotionLicense
					component={Composition}
					compositionHeight={720}
					compositionWidth={1280}
					durationInFrames={500}
					fps={30}
					initiallyMuted
					inputProps={{mediaRate, useThreeLevels}}
				/>,
			);
			await expect
				.poll(() => videoRef.current?.readyState, {timeout: 10_000})
				.toBe(4);
			await expect
				.poll(() => audioRef.current?.readyState, {timeout: 10_000})
				.toBe(4);

			const frames = useThreeLevels
				? [50, 49, 50, 20, 21, 48, 49, 50, 51, 65, 66, 20, 50]
				: [7, 26, 27, 28, 51, 52, 53, 126, 127, 128, 377, 376, 27, 7];
			for (const frame of frames) {
				playerRef.current!.seekTo(frame);
				const localFrame = useThreeLevels
					? (((frame - 12) * 2 + 7 - 11) * 0.5 + 5 - 9) * 3.1 + 13 - 17
					: (frame - 7) * 2 + 10;
				const elapsedSourceFrames = localFrame * mediaRate;
				const expectedTime = useThreeLevels
					? (197 + (elapsedSourceFrames % 71)) / 30
					: (12 + (elapsedSourceFrames % 10)) / 30;
				await expect
					.poll(() => videoRef.current?.currentTime, {
						message: `Video at frame ${frame}, media rate ${mediaRate}`,
					})
					.toBeCloseTo(expectedTime, 5);
				await expect
					.poll(() => audioRef.current?.currentTime, {
						message: `Audio at frame ${frame}, media rate ${mediaRate}`,
					})
					.toBeCloseTo(expectedTime, 5);
				const effectiveRate = (useThreeLevels ? 3.1 : 2) * mediaRate;
				expect(videoRef.current!.playbackRate).toBeCloseTo(effectiveRate);
				expect(audioRef.current!.playbackRate).toBeCloseTo(effectiveRate);
				for (const type of ['video', 'audio'] as const) {
					const layer = registered.find((sequence) => sequence.type === type);
					expect(layer && 'volume' in layer && typeof layer.volume).toBe(
						'string',
					);
					const samples = String(layer && 'volume' in layer ? layer.volume : '')
						.split(',')
						.map(Number);
					expect(samples).toHaveLength(useThreeLevels ? 47 : 493);
					expect(
						samples[frame - (useThreeLevels ? 20 : 7)],
						`${type} timeline volume at frame ${frame}, media rate ${mediaRate}`,
					).toBeCloseTo(
						type === 'video'
							? videoRef.current!.volume
							: audioRef.current!.volume,
						8,
					);
				}
			}

			if (useThreeLevels) {
				playerRef.current!.seekTo(67);
				await expect.poll(() => videoRef.current).toBeNull();
				await expect.poll(() => audioRef.current).toBeNull();
			}
		}
	} finally {
		root.unmount();
		container.remove();
	}
}, 30_000);
