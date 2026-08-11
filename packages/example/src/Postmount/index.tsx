import React from 'react';
import {AbsoluteFill, Html5Video, Sequence, staticFile} from 'remotion';

/**
 * Example demonstrating postmountFor feature
 *
 * postmountFor keeps a sequence mounted for X frames after its duration ends,
 * improving performance when scrubbing backwards in the timeline.
 */
export const PostmountDemoComposition: React.FC = () => {
	return (
		<AbsoluteFill>
			{/* Video that stays mounted 40 frames after it ends */}
			<Sequence from={50} durationInFrames={100} postmountFor={40}>
				<Html5Video pauseWhenBuffering src={staticFile('framer.webm')} />
			</Sequence>

			{/* Overlapping sequences with both premount and postmount */}
			<Sequence
				from={120}
				durationInFrames={80}
				premountFor={30}
				postmountFor={30}
			>
				<AbsoluteFill style={{background: 'rgba(255, 0, 0, 0.5)'}}>
					<Html5Video
						pauseWhenBuffering
						src="https://remotion.media/BigBuckBunny.mp4"
					/>
				</AbsoluteFill>
			</Sequence>

			{/* Another sequence that benefits from the previous one's postmount */}
			<Sequence
				from={200}
				durationInFrames={100}
				premountFor={20}
				postmountFor={50}
			>
				<AbsoluteFill style={{background: 'rgba(0, 0, 255, 0.5)'}}>
					<Html5Video pauseWhenBuffering src={staticFile('framer.webm')} />
				</AbsoluteFill>
			</Sequence>
		</AbsoluteFill>
	);
};

/**
 * Example showing how postmountFor works with custom styles
 */
export const PostmountWithCustomStyles: React.FC = () => {
	return (
		<AbsoluteFill>
			<Sequence
				from={30}
				durationInFrames={60}
				premountFor={20}
				postmountFor={30}
				style={{
					border: '2px solid blue',
				}}
				styleWhilePremounted={{
					opacity: 0,
					transform: 'translateX(-100px)',
				}}
				styleWhilePostmounted={{
					opacity: 0,
					transform: 'translateX(100px)',
				}}
			>
				<AbsoluteFill
					style={{
						background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						fontSize: 60,
						color: 'white',
						fontFamily: 'Arial, sans-serif',
					}}
				>
					<div>Mounted Content</div>
				</AbsoluteFill>
			</Sequence>

			{/* Visual indicator showing mount status */}
			<Sequence durationInFrames={140}>
				<div
					style={{
						position: 'absolute',
						top: 20,
						left: 20,
						fontSize: 20,
						color: 'black',
						background: 'white',
						padding: 10,
					}}
				>
					Frame timeline:
					<br />
					0-10: Not mounted
					<br />
					10-30: Premounting (invisible)
					<br />
					30-90: Visible & active
					<br />
					90-120: Postmounting (invisible)
					<br />
					120+: Not mounted
				</div>
			</Sequence>
		</AbsoluteFill>
	);
};
