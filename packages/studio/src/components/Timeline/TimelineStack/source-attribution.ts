import type {OriginalPosition} from '../../../error-overlay/react-overlay/utils/get-source-map';

export const getOriginalSourceAttribution = (
	originalLocation: OriginalPosition,
) => {
	return `${originalLocation.source}:${originalLocation.line}`;
};
