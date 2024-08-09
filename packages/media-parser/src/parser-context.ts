import type {
	OnAudioSample,
	OnVideoSample,
} from './boxes/iso-base-media/mdat/mdat';

export type ParserContext = {
	onAudioSample: OnAudioSample | null;
	onVideoSample: OnVideoSample | null;
	canSkipVideoData: boolean;
};
