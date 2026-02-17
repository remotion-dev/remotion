import React from 'react';
import {AbsoluteFill} from 'remotion';

const LineHeightFixture: React.FC<{
	readonly position: number;
}> = ({position}) => {
	return (
		<div
			style={{
				fontSize: 80,
				color: 'red',
				width: 80,
				height: 80,
				justifyContent: 'center',
				alignItems: 'center',
				display: 'flex',
				fontFamily: 'Arial',
				lineHeight: 1,
				backgroundColor: 'white',
			}}
		>
			{position}
		</div>
	);
};

const Component: React.FC = () => {
	return (
		<AbsoluteFill
			style={{
				justifyContent: 'center',
				alignItems: 'center',
				backgroundColor: 'white',
			}}
		>
			<LineHeightFixture position={1} />
		</AbsoluteFill>
	);
};

export const lineHeight = {
	component: Component,
	id: 'line-height',
	width: 80,
	height: 80,
	fps: 25,
	durationInFrames: 1,
} as const;
