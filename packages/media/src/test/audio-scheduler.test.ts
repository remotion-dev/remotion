import {expect, test} from 'vitest';
import {getAudioScheduleEntryVolume} from '../audio-scheduler/audio-scheduler-gain';
import {
	getAudioSchedulerRenderTiming,
	getAudioSchedulerEntryMountState,
	shouldSeekAudioSchedulerEntry,
} from '../audio-scheduler/audio-scheduler-timeline';
import {normalizeAudioSchedule} from '../audio-scheduler/normalize-audio-schedule';

test('normalizes audio schedule entries without changing input order', () => {
	const normalized = normalizeAudioSchedule([
		{
			id: 'second',
			src: {render: 'render-2.mp4', preview: 'preview-2.mp4'},
			startTimeInSeconds: 2.5,
			durationInSeconds: 1.25,
			sourceStartTimeInSeconds: 3.5,
		},
		{
			id: 'first',
			src: 'audio.mp4',
			startTimeInSeconds: 0.25,
			durationInSeconds: 0.5,
			sourceStartTimeInSeconds: 1.75,
			volume: 0,
			fadeInDurationInSeconds: 2,
			fadeOutDurationInSeconds: 2,
		},
	]);

	expect(normalized.map((entry) => entry.id)).toEqual(['second', 'first']);
	expect(normalized[0]).toMatchObject({
		renderSrc: 'render-2.mp4',
		previewSrc: 'preview-2.mp4',
		volume: 1,
	});
	expect(normalized[1]).toMatchObject({
		renderSrc: 'audio.mp4',
		previewSrc: 'audio.mp4',
		volume: 0,
		fadeInDurationInSeconds: 0.5,
		fadeOutDurationInSeconds: 0.5,
	});
	expect(Object.isFrozen(normalized)).toBe(true);
});

test('rejects duplicate or invalid schedule entries', () => {
	expect(() =>
		normalizeAudioSchedule([
			{
				id: 'same',
				src: 'audio.mp4',
				startTimeInSeconds: 0,
				durationInSeconds: 1,
				sourceStartTimeInSeconds: 0,
			},
			{
				id: 'same',
				src: 'audio.mp4',
				startTimeInSeconds: 1,
				durationInSeconds: 1,
				sourceStartTimeInSeconds: 1,
			},
		]),
	).toThrow(/duplicate id/);

	expect(() =>
		normalizeAudioSchedule([
			{
				id: 'invalid',
				src: 'audio.mp4',
				startTimeInSeconds: 0,
				durationInSeconds: 0,
				sourceStartTimeInSeconds: 0,
			},
		]),
	).toThrow(/greater than zero/);
});

test('computes entry fades without changing the underlying media readiness', () => {
	const [entry] = normalizeAudioSchedule([
		{
			id: 'fade',
			src: 'audio.mp4',
			startTimeInSeconds: 0,
			durationInSeconds: 4,
			sourceStartTimeInSeconds: 2,
			volume: 1,
			fadeInDurationInSeconds: 1,
			fadeOutDurationInSeconds: 1,
		},
	]);

	expect(getAudioScheduleEntryVolume({entry, timeInSeconds: -0.1})).toBe(0);
	expect(getAudioScheduleEntryVolume({entry, timeInSeconds: 0})).toBe(0);
	expect(getAudioScheduleEntryVolume({entry, timeInSeconds: 0.5})).toBe(0.5);
	expect(getAudioScheduleEntryVolume({entry, timeInSeconds: 2})).toBe(1);
	expect(getAudioScheduleEntryVolume({entry, timeInSeconds: 3.5})).toBe(0.5);
	expect(getAudioScheduleEntryVolume({entry, timeInSeconds: 4})).toBe(0);
});

test('preserves fractional render timing', () => {
	const timing = getAudioSchedulerRenderTiming({
		startTimeInSeconds: 1.01,
		durationInSeconds: 0.056,
		fps: 30,
	});

	expect(timing.from).toBeCloseTo(30.3);
	expect(timing.durationInFrames).toBeCloseTo(1.68);
});

test('only blocks playback for the entry at the current timeline position', () => {
	expect(
		getAudioSchedulerEntryMountState({
			currentTimeInSeconds: -3,
			durationInSeconds: 1,
			parentIsPremounting: false,
			parentIsPostmounting: false,
		}),
	).toEqual({isPremounting: true, isPostmounting: false});

	expect(
		getAudioSchedulerEntryMountState({
			currentTimeInSeconds: 0.25,
			durationInSeconds: 1,
			parentIsPremounting: false,
			parentIsPostmounting: false,
		}),
	).toEqual({isPremounting: false, isPostmounting: false});

	expect(
		getAudioSchedulerEntryMountState({
			currentTimeInSeconds: 1,
			durationInSeconds: 1,
			parentIsPremounting: false,
			parentIsPostmounting: false,
		}),
	).toEqual({isPremounting: false, isPostmounting: true});

	expect(
		getAudioSchedulerEntryMountState({
			currentTimeInSeconds: 0,
			durationInSeconds: 1,
			parentIsPremounting: true,
			parentIsPostmounting: false,
		}),
	).toEqual({isPremounting: true, isPostmounting: false});
});

test('seeks on changed timeline frames, including the first paused scrub', () => {
	expect(
		shouldSeekAudioSchedulerEntry({
			currentFrame: 12,
			previousFrame: null,
		}),
	).toBe(false);

	expect(
		shouldSeekAudioSchedulerEntry({
			currentFrame: 12,
			previousFrame: 10,
		}),
	).toBe(true);

	expect(
		shouldSeekAudioSchedulerEntry({
			currentFrame: 12,
			previousFrame: 12,
		}),
	).toBe(false);
});
