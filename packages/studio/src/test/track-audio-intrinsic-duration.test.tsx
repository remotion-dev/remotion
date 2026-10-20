import {expect, test} from 'bun:test';
import {Audio} from '@remotion/media';
import {Player, PlayerInternals} from '@remotion/player';
import {CanvasInternals} from '@remotion/sdk';
import {act, cleanup, render, waitFor} from '@testing-library/react';
import {useMemo, useState} from 'react';
import {Internals, Track, type TSequence} from 'remotion';
import {TimelineTrackOverlapValidation} from '../components/Timeline/TimelineTrackOverlapValidation';
import {getRuntimeErrors} from '../error-overlay/runtime-error-store';
import {getCachedMediaMetadata} from '../helpers/use-media-metadata';

test('Track validates intrinsic audio durations after shared metadata resolves', async () => {
	const originalFetch = globalThis.fetch;
	const originalIsPlayer = Object.getOwnPropertyDescriptor(
		window,
		'remotion_isPlayer',
	);
	const src = 'https://example.com/track-audio-integration.wav';
	// Real 0.2-second PCM WAV; metadata parsing is not mocked.
	const wav = Buffer.alloc(44 + 1600 * 2);
	wav.write('RIFF', 0);
	wav.writeUInt32LE(wav.length - 8, 4);
	wav.write('WAVEfmt ', 8);
	wav.writeUInt32LE(16, 16);
	wav.writeUInt16LE(1, 20);
	wav.writeUInt16LE(1, 22);
	wav.writeUInt32LE(8000, 24);
	wav.writeUInt32LE(16000, 28);
	wav.writeUInt16LE(2, 32);
	wav.writeUInt16LE(16, 34);
	wav.write('data', 36);
	wav.writeUInt32LE(wav.length - 44, 40);
	let releaseMetadata: () => void = () => undefined;
	const pendingMetadata = new Promise<void>((resolve) => {
		releaseMetadata = resolve;
	});
	let requests = 0;
	globalThis.fetch = (async (input, init) => {
		if (String(input) !== src) {
			return originalFetch(input, init);
		}

		requests++;
		await pendingMetadata;
		const range = new Headers(init?.headers).get('Range');
		const match = range?.match(/^bytes=(\d+)-(\d*)$/);
		const start = match ? Number(match[1]) : 0;
		const end = match?.[2]
			? Math.min(Number(match[2]), wav.length - 1)
			: wav.length - 1;
		return new Response(new Uint8Array(wav.subarray(start, end + 1)).buffer, {
			status: match ? 206 : 200,
			headers: {
				'Content-Type': 'audio/wav',
				'Accept-Ranges': 'bytes',
				'Content-Length': String(end - start + 1),
				...(match
					? {'Content-Range': `bytes ${start}-${end}/${wav.length}`}
					: {}),
			},
		});
	}) as typeof fetch;

	const Composition = ({secondFrom}: {readonly secondFrom: number}) => (
		<Internals.EnableInteractivityProvider>
			<Track name="Sound effects">
				<Audio name="First sound" src={src} />
				<Audio name="Second sound" src={src} from={secondFrom} />
			</Track>
		</Internals.EnableInteractivityProvider>
	);
	const calculate = CanvasInternals.createTimelineCalculator();
	let registered: TSequence[] = [];
	const Harness = ({secondFrom}: {readonly secondFrom: number}) => {
		const [sequences, setSequences] = useState<TSequence[]>([]);
		registered = sequences;
		const timeline = useMemo(
			() => calculate({sequences, overrideIdsToNodePaths: {}}).tracks,
			[sequences],
		);
		return (
			<>
				<PlayerInternals.TimelineSequenceObserverContext.Provider
					value={setSequences}
				>
					<Player
						acknowledgeRemotionLicense
						component={Composition}
						inputProps={{secondFrom}}
						durationInFrames={90}
						fps={30}
						compositionWidth={320}
						compositionHeight={180}
						initiallyMuted
						numberOfSharedAudioTags={0}
					/>
				</PlayerInternals.TimelineSequenceObserverContext.Provider>
				<TimelineTrackOverlapValidation
					timeline={timeline}
					durationInFrames={90}
					fps={30}
				/>
			</>
		);
	};

	try {
		const rendered = render(<Harness secondFrom={30} />);
		await waitFor(() => {
			expect(
				registered.filter((sequence) => sequence.type === 'audio'),
			).toHaveLength(2);
			expect(requests).toBeGreaterThan(0);
		});
		expect(getRuntimeErrors()).toEqual([]);
		act(() => releaseMetadata());
		await waitFor(() => {
			expect(getCachedMediaMetadata(src)?.duration).toBe(0.2);
		});
		expect(getRuntimeErrors()).toEqual([]);

		rendered.rerender(<Harness secondFrom={3} />);
		await waitFor(() => {
			expect(getRuntimeErrors().map(({error}) => error.message)).toEqual([
				expect.stringContaining(
					'"First sound" (frames 0–6) and "Second sound" (frames 3–9) overlap by 3 frames',
				),
			]);
		});
		rendered.rerender(<Harness secondFrom={30} />);
		await waitFor(() => expect(getRuntimeErrors()).toEqual([]));
	} finally {
		releaseMetadata();
		cleanup();
		globalThis.fetch = originalFetch;
		if (originalIsPlayer) {
			Object.defineProperty(window, 'remotion_isPlayer', originalIsPlayer);
		} else {
			Reflect.deleteProperty(window, 'remotion_isPlayer');
		}
	}
});
