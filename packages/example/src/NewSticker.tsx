import {Star, Arrow} from '@remotion/shapes';
import React from 'react';
import {AbsoluteFill, Interactive} from 'remotion';

const NewSticker: React.FC = () => {
	return (
		<AbsoluteFill
			style={{
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				backgroundColor: '#F5F5F5',
			}}
		>
			<Interactive.Div name="<Star>">
				<Star
					points={26}
					innerRadius={175}
					outerRadius={207}
					cornerRadius={0}
					fill={'#0F84F3'}
					showInTimeline={false}
				/>
			</Interactive.Div>
			<Arrow
				length={300}
				headWidth={185}
				headLength={120}
				shaftWidth={80}
				direction="right"
				cornerRadius={0}
				fill={'#829bb6'}
				style={{
					position: 'absolute',
					translate: '-383.4px -0.3px',
				}}
			/>
		</AbsoluteFill>
	);
};

export default NewSticker;
