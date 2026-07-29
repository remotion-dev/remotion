import React, {useMemo} from 'react';
import {Interactive} from 'remotion';
import type {Item} from './item';

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
		<Interactive.Div
			from={item.from}
			durationInFrames={item.durationInFrames}
			style={style}
		/>
	);
};
