import {VideoOperation} from '@remotion/webcodecs';
import {renderVideoCodecLabel} from '@remotion/webcodecs/src/codec-id';

export const VideoOperationOption: React.FC<{
	readonly operation: VideoOperation;
}> = ({operation}) => {
	if (operation.type === 'reencode') {
		return renderVideoCodecLabel(operation.videoCodec);
	}

	if (operation.type === 'copy') {
		return 'Copy without re-encoding';
	}

	if (operation.type === 'drop') {
		return 'Drop video track';
	}

	throw new Error('Unknown operation type');
};
