import {
	AbsoluteFill,
	Composition,
	OffthreadVideo,
	useCurrentFrame,
} from 'remotion';
import {calculateMetadataFn} from './OffthreadRemoteVideo';

const fps = 30;

const src = 'https://remotion.media/bigbuckbunny.mp4#t=lol';

export const LoopedOffthreadVideo: React.FC<{
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

const Component = () => {
	return <LoopedOffthreadVideo durationInFrames={100} />;
};

export const LoopedOffthreadRemoteVideo = () => {
	return (
		<Composition
			component={Component}
			id="LoopedOffthreadRemoteVideo"
			calculateMetadata={calculateMetadataFn}
			fps={fps}
		/>
	);
};
