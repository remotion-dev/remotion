import React from 'react';
import {spring, useCurrentFrame, useVideoConfig} from 'remotion';

export const TopFace: React.FC<{
	readonly delay: number;
}> = ({delay}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const progress = spring({
		fps,
		frame,
		config: {
			damping: 200,
		},
		durationInFrames: 20,
		delay: 250 + delay,
	});

	const offset = -progress * 100;

	const disappearProgress = spring({
		fps,
		frame,
		config: {
			damping: 200,
		},
		delay: 20,
		durationInFrames: 20,
	});

	return (
		<div className="w-full h-full overflow-x-hidden">
			<div
				style={{
					fontFamily: 'GT Planar',
					color: 'white',
					fontSize: 36,
					top: -80,
					position: 'absolute',
					overflow: 'hidden',
				}}
			/>
			<div
				style={{fontFamily: 'GT Planar', fontWeight: 'bold'}}
				className="w-full h-full flex items-center text-white text-4xl overflow-hidden relative"
			>
				<div
					style={{
						height: '100%',
						position: 'absolute',
						display: 'flex',
						alignItems: 'center',
						top: offset + '%',
					}}
				>
					<div
						style={{
							display: 'flex',
							justifyContent: 'center',
							alignItems: 'center',
							height: '100%',
							background: '#0B84F3',
							paddingLeft: 30,
							paddingRight: 30,
							marginRight: disappearProgress * 20 + 20,
							marginLeft: disappearProgress * -140,
						}}
					>
						New
					</div>
					downloadAndParseMedia()
				</div>
				<div
					style={{
						height: '100%',
						top: offset + 100 + '%',
						position: 'absolute',
						display: 'flex',
						alignItems: 'center',
						paddingLeft: 36,
					}}
				>
					Saved to /tmp/videos/out.mp4
				</div>
			</div>
		</div>
	);
};
