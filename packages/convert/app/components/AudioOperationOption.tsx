import type {MediaParserAudioCodec} from '@remotion/media-parser';
import type {AudioOperation, ConvertMediaAudioCodec} from '@remotion/webcodecs';
import type {InputAudioTrack} from 'mediabunny';
import {renderHumanReadableAudioCodec} from '~/lib/render-codec-label';

export const AudioOperationOption: React.FC<{
	readonly operation: AudioOperation;
	readonly currentAudioCodec:
		| InputAudioTrack['codec']
		| MediaParserAudioCodec
		| ConvertMediaAudioCodec;
}> = ({operation, currentAudioCodec}) => {
	if (operation.type === 'reencode') {
		return renderHumanReadableAudioCodec(operation.audioCodec);
	}

	if (operation.type === 'copy') {
		return `Copy ${renderHumanReadableAudioCodec(currentAudioCodec)} without re-encoding`;
	}

	if (operation.type === 'drop') {
		return 'Drop audio track';
	}

	throw new Error('Unknown operation type');
};
