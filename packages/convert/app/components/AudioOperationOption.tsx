import {AudioOperation} from '@remotion/webcodecs';
import {renderAudioCodecLabel} from '@remotion/webcodecs/src/codec-id';

export const AudioOperationOption: React.FC<{
	readonly operation: AudioOperation;
}> = ({operation}) => {
	if (operation.type === 'reencode') {
		return renderAudioCodecLabel(operation.audioCodec);
	}

	if (operation.type === 'copy') {
		return 'Copy without re-encoding';
	}

	if (operation.type === 'drop') {
		return 'Drop audio track';
	}

	throw new Error('Unknown operation type');
};
