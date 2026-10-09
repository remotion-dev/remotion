import {ALL_FORMATS, BufferSource, Input} from 'mediabunny';
import type {ScheduleAudioNodeResult} from 'remotion';
import {expect, test, vi} from 'vitest';
import {audioIteratorManager} from '../audio-iterator-manager';
import {processNext} from '../audio/sort-by-priority';
import {makeNonceManager} from '../nonce-manager';

test.each([
	{
		globalPlaybackRate: 2,
		localPlaybackRate: 1,
		outputLatency: 0.02,
		clockLead: 0.1,
	},
	{
		globalPlaybackRate: 2,
		localPlaybackRate: 2,
		outputLatency: 0.02,
		clockLead: 0.1,
	},
	{
		globalPlaybackRate: 0.5,
		localPlaybackRate: 1,
		outputLatency: 0.02,
		clockLead: 0.1,
	},
	{
		globalPlaybackRate: 1,
		localPlaybackRate: 1,
		outputLatency: 0,
		clockLead: 0.3,
	},
	{
		globalPlaybackRate: 2,
		localPlaybackRate: 0.5,
		outputLatency: 0,
		clockLead: 0.3,
	},
])(
	'preserves queued audio at Player rate $globalPlaybackRate, media rate $localPlaybackRate, output latency $outputLatency',
	async ({globalPlaybackRate, localPlaybackRate, outputLatency, clockLead}) => {
		// Two seconds of silent 8 kHz mono PCM, kept entirely in memory.
		const wav = new Uint8Array(44 + 2 * 8000 * 2);
		const header = new DataView(wav.buffer);
		const encoder = new TextEncoder();
		wav.set(encoder.encode('RIFF'), 0);
		wav.set(encoder.encode('WAVEfmt '), 8);
		wav.set(encoder.encode('data'), 36);
		header.setUint32(4, wav.length - 8, true);
		header.setUint32(16, 16, true);
		header.setUint16(20, 1, true);
		header.setUint16(22, 1, true);
		header.setUint32(24, 8000, true);
		header.setUint32(28, 16000, true);
		header.setUint16(32, 2, true);
		header.setUint16(34, 16, true);
		header.setUint32(40, wav.length - 44, true);
		const input = new Input({
			source: new BufferSource(wav),
			formats: ALL_FORMATS,
		});
		const audioTrack = await input.getPrimaryAudioTrack();
		if (!audioTrack) {
			throw new Error('Expected a PCM audio track');
		}

		const gainNode = {
			gain: {value: 1},
			connect: () => undefined,
		} as unknown as GainNode;
		const audioContext = {
			currentTime: clockLead,
			baseLatency: 0.005,
			outputLatency,
			createGain: () => gainNode,
		} as unknown as AudioContext;
		const scheduleAudioNode = (): ScheduleAudioNodeResult => ({
			type: 'started',
			scheduledTime: 0,
		});
		const manager = audioIteratorManager({
			audioTrack,
			delayPlaybackHandleIfNotPremounting: () => ({
				unblock: () => undefined,
				[Symbol.dispose]: () => undefined,
			}),
			sharedAudioContext: {
				audioContext,
				gainNode,
				audioSyncAnchor: {value: 0},
				scheduleAudioNode,
				unscheduleAudioNode: () => undefined,
			},
			getSequenceEndTimestamp: () => 2,
			getSequenceDurationInSeconds: () => 2,
			getMediaEndTimestamp: () => 2,
			getStartTime: () => 0,
			initialMuted: false,
			initialVolume: 1,
			toneFrequency: 1,
			drawDebugOverlay: () => undefined,
			onError: (error) => {
				throw error;
			},
		});
		const playbackRate = globalPlaybackRate * localPlaybackRate;
		const nonceManager = makeNonceManager();
		const seek = (time: number) => {
			manager.seek({
				newTime: time,
				unloopedNewTime: time / localPlaybackRate,
				nonce: nonceManager.createAsyncOperation(),
				playbackRate,
				localPlaybackRate,
				scheduleAudioNode,
				// Keep decoding outside the scheduling horizon. Seed the queued
				// node below to exercise seek dedup without a decoder or browser.
				getTargetTime: () => 3,
				logLevel: 'error',
				loop: false,
				trimBefore: undefined,
				trimAfter: undefined,
				sequenceOffset: 0,
				sequenceDurationInFrames: 60,
				fps: 30,
				getAudioContextCurrentTimeMockedInTest: () => audioContext.currentTime,
			});
		};

		vi.useFakeTimers();
		try {
			seek(1);
			const iterator = manager.getAudioBufferIterator();
			if (!iterator) {
				throw new Error('Expected an audio iterator');
			}

			const stop = vi.fn();
			iterator.addQueuedAudioNode({
				node: {stop} as unknown as AudioBufferSourceNode,
				timestamp: 1 + clockLead * playbackRate,
				buffer: {duration: 0.5} as AudioBuffer,
				sourceDurationInSeconds: 0.5,
				scheduledTime: audioContext.currentTime,
				playbackRate,
				scheduledAtAnchor: 0,
			});

			seek(0.99);
			expect(manager.getAudioIteratorsCreated()).toBe(1);
			expect(stop).not.toHaveBeenCalled();

			// A seek outside the allowance must still replace the schedule.
			// At 0.5x, 0.95 also catches an incorrectly unscaled allowance.
			seek(playbackRate === 0.5 ? 0.95 : 0.25);
			expect(manager.getAudioIteratorsCreated()).toBe(2);
			expect(stop).toHaveBeenCalledOnce();
		} finally {
			manager.destroyIterator();
			processNext();
			vi.useRealTimers();
			input.dispose();
		}
	},
);
