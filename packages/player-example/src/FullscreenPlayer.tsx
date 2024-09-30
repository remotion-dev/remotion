import {Player} from '@remotion/player';
import React from 'react';
import {AbsoluteFill} from 'remotion';

const MyComp: React.FC = () => {
	return <AbsoluteFill style={{backgroundColor: 'black'}} />;
};

export const FullscreenPlayer = () => {
	const compositionWidth = 300;
	const compositionHeight = 200;

	return (
		<div
			style={{
				width: '100vw',
				height: '100vh',
				backgroundColor: 'gray',
				// Any container with "position: relative" will work
				position: 'relative',
			}}
		>
			<div
				style={{
					position: 'absolute',
					top: 0,
					left: 0,
					right: 0,
					bottom: 0,
					margin: 'auto',
					aspectRatio: `${compositionWidth} / ${compositionHeight}`,
					maxHeight: '100%',
					maxWidth: '100%',
				}}
			>
				<Player
					controls
					component={MyComp}
					compositionWidth={compositionWidth}
					compositionHeight={compositionHeight}
					durationInFrames={200}
					fps={30}
					style={{
						width: '100%',
					}}
				/>
			</div>
		</div>
	);
};
