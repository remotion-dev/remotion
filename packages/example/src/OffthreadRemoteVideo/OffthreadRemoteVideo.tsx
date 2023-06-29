import {useAnimations} from '@react-three/drei';
import {METHODS} from 'http';
import {
	AbsoluteFill,
	Freeze,
	interpolate,
	OffthreadVideo,
	staticFile,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

export const OffthreadRemoteVideo: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const time = frame / fps;
	return (
		<AbsoluteFill>
			<Freeze frame={Math.round(3.34 * fps)}>
				<OffthreadVideo src={staticFile('framermp4withoutfileextension')} />
			</Freeze>
			<AbsoluteFill>
				<h1 style={{backgroundColor: 'red', marginTop: 100}}>{time * 6000}</h1>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
