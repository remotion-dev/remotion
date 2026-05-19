import React, {useMemo} from 'react';
import {TIMELINE_INDENT} from './timeline-indent';

export const Padder: React.FC<{
	readonly depth: number;
}> = ({depth}) => {
	const style = useMemo(
		(): React.CSSProperties => ({
			width: TIMELINE_INDENT * depth,
			flexShrink: 0,
		}),
		[depth],
	);

	return <div style={style} />;
};
