import {Star} from '@remotion/shapes';
import React from 'react';
import {AbsoluteFill, Interactive} from 'remotion';

const NewSticker: React.FC = () => {
	return (
		<AbsoluteFill
			style={{
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				backgroundColor: '#fff9bd',
				position: 'absolute',
				width: '100%',
				height: '100%',
			}}
		>
			<Interactive.Div
				style={{
					position: 'relative',
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
						color: '#fcff79',
					}}
				>
					New!
				</AbsoluteFill>
			</Interactive.Div>
		</AbsoluteFill>
	);
};

export default NewSticker;
