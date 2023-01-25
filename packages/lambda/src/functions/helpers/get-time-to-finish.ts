import type {RenderMetadata} from '../../defaults';

export const getTimeToFinish = ({
	renderMetadata,
	lastModified,
}: {
	renderMetadata: RenderMetadata | null;
	lastModified: number | null;
}) => {
	if (!lastModified) {
		return null;
	}

	if (!renderMetadata) {
		return null;
	}

	return Math.max(0, lastModified - renderMetadata.startedDate);
};
