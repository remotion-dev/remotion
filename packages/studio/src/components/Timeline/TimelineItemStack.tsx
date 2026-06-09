import React, {useMemo} from 'react';
import type {OriginalPosition} from '../../error-overlay/react-overlay/utils/get-source-map';
import {VERY_LIGHT_TEXT} from '../../helpers/colors';
import {getOriginalSourceAttribution} from './TimelineStack/source-attribution';

export const TimelineItemStack: React.FC<{
	readonly originalLocation: OriginalPosition | null;
}> = ({originalLocation}) => {
	const style = useMemo((): React.CSSProperties => {
		return {
			fontSize: 12,
			color: VERY_LIGHT_TEXT,
			display: 'flex',
			flexDirection: 'row',
			alignItems: 'center',
			whiteSpace: 'nowrap',
			textOverflow: 'ellipsis',
			overflow: 'hidden',
			flexShrink: 100000,
			userSelect: 'none',
			WebkitUserSelect: 'none',
		};
	}, []);

	if (!originalLocation) {
		return null;
	}

	return (
		<div style={style}>{getOriginalSourceAttribution(originalLocation)}</div>
	);
};
