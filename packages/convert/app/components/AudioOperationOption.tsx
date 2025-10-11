import type {MediaParserAudioCodec} from '@remotion/media-parser';
import type {AudioOperation} from '@remotion/webcodecs';
import {renderHumanReadableAudioCodec} from '~/lib/render-codec-label';

export const AudioOperationOption: React.FC<{
	readonly operation: AudioOperation;
	readonly currentAudioCodec: MediaParserAudioCodec;
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
