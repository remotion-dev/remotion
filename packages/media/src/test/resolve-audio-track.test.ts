import type {
	InputAudioTrack,
	InputTrackQuery,
	InputVideoTrack,
} from 'mediabunny';
import {expect, test, vi} from 'vitest';
import {resolveAudioTrack} from '../helpers/resolve-audio-track';

const audioTrack = (decodable: boolean) =>
	({
		canDecode: vi.fn(() => Promise.resolve(decodable)),
	}) as unknown as InputAudioTrack;

const videoTrack = (pairable: InputAudioTrack[]) =>
	({
		getPrimaryPairableAudioTrack: vi.fn(
			async (query?: InputTrackQuery<InputAudioTrack>) => {
				for (const track of pairable) {
					if (!query?.filter || (await query.filter(track))) {
						return track;
					}
				}

				return null;
			},
		),
	}) as unknown as InputVideoTrack;

test('falls back from unsupported default APAC to a decodable paired audio track', async () => {
	const apac = audioTrack(false);
	const aac = audioTrack(true);
	expect(
		await resolveAudioTrack({
			videoTrack: videoTrack([apac, aac]),
			audioTracks: [apac, aac],
			audioStreamIndex: null,
		}),
	).toBe(aac);
});

test('keeps the supported default without probing alternatives', async () => {
	const primary = audioTrack(true);
	const alternative = audioTrack(true);
	const video = videoTrack([primary, alternative]);
	expect(
		await resolveAudioTrack({
			videoTrack: video,
			audioTracks: [primary, alternative],
			audioStreamIndex: null,
		}),
	).toBe(primary);
	expect(video.getPrimaryPairableAudioTrack).toHaveBeenCalledTimes(1);
	expect(alternative.canDecode).not.toHaveBeenCalled();
});

test('does not replace an explicitly selected unsupported track', async () => {
	const apac = audioTrack(false);
	const aac = audioTrack(true);
	const video = videoTrack([apac, aac]);
	expect(
		await resolveAudioTrack({
			videoTrack: video,
			audioTracks: [apac, aac],
			audioStreamIndex: 0,
		}),
	).toBe(apac);
	expect(video.getPrimaryPairableAudioTrack).not.toHaveBeenCalled();
	expect(apac.canDecode).not.toHaveBeenCalled();
});

test('does not fall back to audio that cannot pair with the video', async () => {
	const unsupported = audioTrack(false);
	const unrelated = audioTrack(true);
	expect(
		await resolveAudioTrack({
			videoTrack: videoTrack([unsupported]),
			audioTracks: [unsupported, unrelated],
			audioStreamIndex: null,
		}),
	).toBe(unsupported);
	expect(unrelated.canDecode).not.toHaveBeenCalled();
});

test('keeps the original unsupported track so callers can report failure', async () => {
	const unsupported = audioTrack(false);
	expect(
		await resolveAudioTrack({
			videoTrack: videoTrack([unsupported]),
			audioTracks: [unsupported],
			audioStreamIndex: null,
		}),
	).toBe(unsupported);
});

test('finds a decodable alternative for an audio-only file', async () => {
	const unsupported = audioTrack(false);
	const aac = audioTrack(true);
	expect(
		await resolveAudioTrack({
			videoTrack: null,
			audioTracks: [unsupported, aac],
			audioStreamIndex: null,
		}),
	).toBe(aac);
});

test('returns null when no audio is present', async () => {
	expect(
		await resolveAudioTrack({
			videoTrack: videoTrack([]),
			audioTracks: [],
			audioStreamIndex: null,
		}),
	).toBeNull();
	expect(
		await resolveAudioTrack({
			videoTrack: null,
			audioTracks: [],
			audioStreamIndex: null,
		}),
	).toBeNull();
});
