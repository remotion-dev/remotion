import {Video} from '@remotion/media';
import {
	AbsoluteFill,
	Easing,
	Sequence,
	interpolate,
	useCurrentFrame,
} from 'remotion';
import {assetUrl} from './assets';

const VisualModeDemo: React.FC = () => {
	const frame = useCurrentFrame();

	return (
		<AbsoluteFill
			style={{
				backgroundColor: '#141414',
				justifyContent: 'center',
				alignItems: 'center',
				overflow: 'hidden',
			}}
		>
			<Video
				name="Visual mode zoom demo"
				src={assetUrl('visual-mode-demo.mov')}
				muted
				trimBefore={60}
				playbackRate={3}
				style={{
					height: '100%',
					objectFit: 'contain',
					transformOrigin: 'bottom left',
					scale: interpolate(frame, [0, 30], [1, 1.5], {
						easing: Easing.spring({damping: 200}),
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					}),
				}}
			/>
		</AbsoluteFill>
	);
};

export const Scene10: React.FC = () => {
	return (
		<AbsoluteFill>
			<Video
				name="Presenter video"
				src={assetUrl('whats10.mov')}
				trimBefore={55}
				trimAfter={476}
			/>
			<Sequence
				name="Visual mode zoom"
				from={30}
				durationInFrames={150}
				premountFor={30}
			>
				<VisualModeDemo />
			</Sequence>
			<Sequence
				name="Visual mode editing"
				from={180}
				durationInFrames={150}
				premountFor={30}
			>
				<AbsoluteFill
					style={{
						backgroundColor: '#141414',
						justifyContent: 'center',
						alignItems: 'center',
					}}
				>
					<Video
						name="Visual mode editing demo"
						src={assetUrl('visual-mode-demo-2.mov')}
						muted
						trimBefore={30}
						playbackRate={2}
						style={{
							height: '70%',
							objectFit: 'contain',
						}}
					/>
				</AbsoluteFill>
			</Sequence>
			<Sequence
				name="Visual mode demo"
				from={330}
				durationInFrames={90}
				premountFor={30}
			>
				<AbsoluteFill
					style={{
						backgroundColor: '#181818',
						justifyContent: 'center',
						alignItems: 'center',
					}}
				>
					<Video
						name="Visual mode final demo"
						src={assetUrl('visual-mode-demo-3.mov')}
						muted
						trimBefore={150}
						playbackRate={2}
						style={{
							height: '80%',
							objectFit: 'contain',
						}}
					/>
				</AbsoluteFill>
			</Sequence>
		</AbsoluteFill>
	);
};
