import type {VideoOperation} from '@remotion/webcodecs';
import type {InputVideoTrack} from 'mediabunny';
import {renderHumanReadableVideoCodec} from '~/lib/render-codec-label';

export const VideoOperationOption: React.FC<{
	readonly operation: VideoOperation;
	currentVideoCodec: InputVideoTrack['codec'] | null;
}> = ({operation, currentVideoCodec}) => {
	if (operation.type === 'reencode') {
		return renderHumanReadableVideoCodec(operation.videoCodec);
	}

	if (operation.type === 'copy') {
		if (!currentVideoCodec) {
			return `Copy without re-encoding`;
		}

		return `Copy ${renderHumanReadableVideoCodec(currentVideoCodec)} without re-encoding`;
	}

	if (operation.type === 'drop') {
		return 'Drop video track';
	}

	throw new Error('Unknown operation type');
};
