import React, {useMemo} from 'react';
import {Sequence} from 'remotion';
import type {Item} from './item';

export const REMOTION_TIMELINE_NON_EMPTY_SPACE =
	'_remotion_timeline_non_empty_space';

const container: React.CSSProperties = {
	display: 'contents',
};

export const Layer: React.FC<{
	item: Item;
}> = ({item}) => {
	const style: React.CSSProperties = useMemo(() => {
		return {
			backgroundColor: item.color,
			position: 'absolute',
			left: item.left,
			top: item.top,
			width: item.width,
			height: item.height,
		};
	}, [item.color, item.height, item.left, item.top, item.width]);

	return (
		<Sequence
			key={item.id}
			from={item.from}
			durationInFrames={item.durationInFrames}
			className={REMOTION_TIMELINE_NON_EMPTY_SPACE}
			style={container}
		>
			<div style={style} />
		</Sequence>
	);
};
