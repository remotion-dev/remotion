import {Video} from '@remotion/media';
import {
	AbsoluteFill,
	Sequence,
	interpolate,
	spring,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {assetUrl} from './assets';
import {SILENCES} from './Composition';

const FILE = 'whats10.mov';

const VisualModeDemo: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	const zoomProgress = spring({
		frame,
		fps,
		config: {damping: 200},
		durationInFrames: 30,
	});
	const scale = interpolate(zoomProgress, [0, 1], [1, 1.5]);

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
				src={assetUrl('visual-mode-demo.mov')}
				muted
				trimBefore={Math.floor(2 * fps)}
				playbackRate={3}
				style={{
					height: '100%',
					objectFit: 'contain',
					transformOrigin: 'bottom left',
					transform: `scale(${scale})`,
				}}
			/>
		</AbsoluteFill>
	);
};

export const Scene10: React.FC = () => {
	const {fps} = useVideoConfig();
	const silence = SILENCES[FILE];
	const trimBefore = Math.floor(silence.leadingEnd * fps);
	const trimAfter = Math.ceil(silence.trailingStart * fps);

	return (
		<AbsoluteFill>
			<Video
				src={assetUrl(FILE)}
				trimBefore={trimBefore}
				trimAfter={trimAfter}
			/>
			<Sequence
				from={30}
				durationInFrames={Math.round(5 * fps)}
				premountFor={30}
			>
				<VisualModeDemo />
			</Sequence>
			<Sequence
				from={30 + Math.round(5 * fps)}
				durationInFrames={Math.round(5 * fps)}
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
						src={assetUrl('visual-mode-demo-2.mov')}
						muted
						trimBefore={Math.floor(fps)}
						playbackRate={2}
						style={{
							height: '70%',
							objectFit: 'contain',
						}}
					/>
				</AbsoluteFill>
			</Sequence>
			<Sequence
				from={30 + Math.round(10 * fps)}
				durationInFrames={Math.round(3 * fps)}
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
						src={assetUrl('visual-mode-demo-3.mov')}
						muted
						trimBefore={Math.floor(5 * fps)}
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
