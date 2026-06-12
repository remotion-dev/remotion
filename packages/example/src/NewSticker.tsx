import {Star} from '@remotion/shapes';
import {visualControl} from '@remotion/studio';
import {zColor} from '@remotion/zod-types';
import React from 'react';
import {AbsoluteFill, Interactive, useCurrentFrame} from 'remotion';

const NewSticker: React.FC = () => {
	const frame = useCurrentFrame();
	return (
		<AbsoluteFill
			style={{
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				backgroundColor: visualControl('color', '#fff9bd', zColor()),
				position: 'absolute',
				width: '100%',
				height: '100%',
			}}
		>
			<Interactive.Div
				style={{
					position: 'relative',
					rotate: '-181.046832deg',
				}}
			>
				<Star
					points={20}
					innerRadius={174}
					outerRadius={207}
					fill={'#f2be0a'}
					cornerRadius={33}
					showInTimeline={false}
				/>
				<AbsoluteFill
					style={{
						justifyContent: 'center',
						alignItems: 'center',
						fontSize: 110,
						fontWeight: 'bolder',
						fontFamily: 'GT Planar',
						letterSpacing: '-0.02em',
						color: visualControl('orange', '#fcff79', zColor()),
					}}
				>
					New!
				</AbsoluteFill>
			</Interactive.Div>
		</AbsoluteFill>
	);
};

export default NewSticker;
