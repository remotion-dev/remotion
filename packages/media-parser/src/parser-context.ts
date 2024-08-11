import type {
	OnAudioSample,
	OnVideoSample,
} from './boxes/iso-base-media/mdat/mdat';
import type {OnSimpleBlock} from './boxes/webm/segments/track-entry';

export type ParserContext = {
	onAudioSample: OnAudioSample | null;
	onVideoSample: OnVideoSample | null;
	onSimpleBlock: OnSimpleBlock;
	canSkipVideoData: boolean;
};
