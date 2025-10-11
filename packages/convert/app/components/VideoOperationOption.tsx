import type {MediaParserVideoCodec} from '@remotion/media-parser';
import type {VideoOperation} from '@remotion/webcodecs';
import {renderHumanReadableVideoCodec} from '~/lib/render-codec-label';

export const VideoOperationOption: React.FC<{
	readonly operation: VideoOperation;
	currentVideoCodec: MediaParserVideoCodec | null;
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
