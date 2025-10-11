import {StudioInternals} from '@remotion/studio';
import {
	AbsoluteFill,
	OffthreadVideo,
	staticFile,
	useCurrentFrame,
} from 'remotion';
import {calculateMetadataFn} from './OffthreadRemoteVideo';

const fps = 30;

const src = staticFile('bigbuckbunny.mp4') + '#t=lol';

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

export const LoopedOffthreadRemoteVideo = StudioInternals.createComposition({
	component: () => {
		return <LoopedOffthreadVideo durationInFrames={100} />;
	},
	id: 'LoopedOffthreadRemoteVideo',
	calculateMetadata: calculateMetadataFn,
	fps,
});
