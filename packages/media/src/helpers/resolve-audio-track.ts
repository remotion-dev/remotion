import type {InputAudioTrack, InputVideoTrack} from 'mediabunny';

// Resolves which audio track to use given the user's `audioStreamIndex` prop:
// - When the user explicitly picks a stream, honor that index.
// - When unset and a video track is present, pair it with the matching audio
//   track (preserves multi-track behavior introduced in #7094).
// - When unset and the file is audio-only, fall back to the first audio track
//   so that audio-only files (e.g. .m4a) keep working (regression fix for #7210).
// - If the automatic choice cannot decode, try a decodable alternative. Keep
//   the original choice when none can decode so callers still report the error.
export const resolveAudioTrack = async ({
	videoTrack,
	audioTracks,
	audioStreamIndex,
}: {
	videoTrack: InputVideoTrack | null;
	audioTracks: InputAudioTrack[];
	audioStreamIndex: number | null;
}): Promise<InputAudioTrack | null> => {
	if (audioStreamIndex !== null) {
		return audioTracks[audioStreamIndex] ?? null;
	}

	if (videoTrack) {
		const primary = await videoTrack.getPrimaryPairableAudioTrack();
		if (!primary || (await primary.canDecode())) {
			return primary;
		}

		return (
			(await videoTrack.getPrimaryPairableAudioTrack({
				filter: (track) => track.canDecode(),
			})) ?? primary
		);
	}

	for (const track of audioTracks) {
		if (await track.canDecode()) {
			return track;
		}
	}

	return audioTracks[0] ?? null;
};
