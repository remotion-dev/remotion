import type {
	OnAudioSample,
	OnVideoSample,
} from './boxes/iso-base-media/mdat/mdat';
import type {OnTrackEntrySegment} from './boxes/webm/segments';
import type {GetTracks} from './boxes/webm/segments/track-entry';

export type ParserContext = {
	onAudioSample: OnAudioSample | null;
	onVideoSample: OnVideoSample | null;
	canSkipVideoData: boolean;
	onTrackEntrySegment: OnTrackEntrySegment;
	getTracks: GetTracks;
};
