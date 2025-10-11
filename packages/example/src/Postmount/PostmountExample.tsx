import React from 'react';
import {AbsoluteFill, Html5Video, Series, staticFile} from 'remotion';

export const PostmountExample: React.FC = () => {
	return (
		<AbsoluteFill>
			<Series>
				{/* First video with both premount and postmount */}
				<Series.Sequence
					durationInFrames={100}
					premountFor={20}
					postmountFor={30}
				>
					<Html5Video pauseWhenBuffering src={staticFile('framer.webm')} />
				</Series.Sequence>

				{/* Second video with just postmount to keep it in memory */}
				<Series.Sequence durationInFrames={150} postmountFor={50}>
					<Html5Video
						pauseWhenBuffering
						src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
					/>
				</Series.Sequence>

				{/* Third video with both to enable smooth transitions */}
				<Series.Sequence
					durationInFrames={100}
					premountFor={25}
					postmountFor={25}
				>
					<Html5Video pauseWhenBuffering src={staticFile('framer.webm')} />
				</Series.Sequence>
			</Series>
		</AbsoluteFill>
	);
};

export const PostmountWithStyles: React.FC = () => {
	return (
		<AbsoluteFill>
			<Series>
				<Series.Sequence
					durationInFrames={100}
					premountFor={20}
					postmountFor={30}
					styleWhilePremounted={{
						opacity: 0,
						transform: 'scale(0.8)',
					}}
					styleWhilePostmounted={{
						opacity: 0,
						transform: 'scale(1.2)',
					}}
				>
					<AbsoluteFill
						style={{
							background: 'blue',
							color: 'white',
							fontSize: 50,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
						}}
					>
						<div>Scene 1</div>
					</AbsoluteFill>
				</Series.Sequence>

				<Series.Sequence
					durationInFrames={100}
					premountFor={20}
					postmountFor={30}
				>
					<AbsoluteFill
						style={{
							background: 'green',
							color: 'white',
							fontSize: 50,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
						}}
					>
						<div>Scene 2</div>
					</AbsoluteFill>
				</Series.Sequence>
			</Series>
		</AbsoluteFill>
	);
};
