import React, {useMemo} from 'react';
import {INDENT} from './TimelineListItem';

export const Padder: React.FC<{
	readonly depth: number;
}> = ({depth}) => {
	const style = useMemo(
		(): React.CSSProperties => ({
			width: INDENT * depth,
			flexShrink: 0,
		}),
		[depth],
	);

	return <div style={style} />;
};
