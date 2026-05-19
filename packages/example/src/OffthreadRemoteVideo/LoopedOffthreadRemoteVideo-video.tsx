import {
	AbsoluteFill,
	OffthreadVideo,
	staticFile,
	useCurrentFrame,
} from 'remotion';

const src = staticFile('bigbuckbunny.mp4') + '#t=lol';

const LoopedOffthreadVideo: React.FC<{
	durationInFrames: number;
	muted?: boolean;
}> = ({durationInFrames}) => {
	const frame = useCurrentFrame();
	if (durationInFrames <= 0) {
		throw new Error('durationInFrames must be greater than 0');
	}

	return (
		<AbsoluteFill style={{backgroundColor: 'green'}}>
			<OffthreadVideo muted transparent={frame % 2 === 0} src={src} />
		</AbsoluteFill>
	);
};

export const LoopedOffthreadRemoteVideoComponent = () => {
	return <LoopedOffthreadVideo durationInFrames={100} />;
};
