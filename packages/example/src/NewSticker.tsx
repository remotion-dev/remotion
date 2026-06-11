import {Arrow, Star} from '@remotion/shapes';
import {visualControl} from '@remotion/studio';
import {zColor} from '@remotion/zod-types';
import React from 'react';
import {Interactive, useCurrentFrame} from 'remotion';

const NewSticker: React.FC = () => {
	const frame = useCurrentFrame();
	return (
		<Interactive.Div
			style={{
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				backgroundColor: visualControl('color', '#fff9bd', zColor()),
				position: 'absolute',
				width: '100%',
				height: '100%',
				translate: '0.2px 0px',
			}}
		>
			<Star
				points={20}
				innerRadius={174}
				outerRadius={207}
				fill={'#f2be0a'}
				style={{
					scale: 0.72867,
					translate: '-1px -0.7px',
				}}
			/>
			<Arrow
				length={274}
				headWidth={112}
				headLength={66}
				shaftWidth={47}
				direction="right"
				cornerRadius={0}
				fill={'#e76862'}
				style={{
					position: 'absolute',
					scale: 0.855948,
					translate: '-360.6px 1.6px',
					transformOrigin: '182.03% 56.08%',
					rotate: '257.417256deg',
				}}
			/>
		</Interactive.Div>
	);
};

export default NewSticker;
