import {Video as NewVideo} from '@remotion/media';
import {
	OffthreadVideo,
	Sequence,
	staticFile,
	useVideoConfig,
	Video,
} from 'remotion';

export const VideoTesting: React.FC<{
	codec: 'mp4' | 'webm';
	type?: 'normal' | 'offthread' | 'codec';
	trimBefore?: number;
}> = ({codec, type = 'normal', trimBefore}) => {
	const {durationInFrames} = useVideoConfig();
	const videoMp4 = staticFile('framermp4withoutfileextension');
	const videoWebm = staticFile('framer.webm');

	let Comp;
	if (type === 'codec') {
		Comp = NewVideo;
	} else if (type === 'offthread') {
		Comp = OffthreadVideo;
	} else {
		Comp = Video;
	}

	return (
		<div>
			<Sequence durationInFrames={durationInFrames}>
				<Comp
					src={codec === 'mp4' ? videoMp4 : videoWebm}
					trimBefore={trimBefore}
				/>
			</Sequence>
		</div>
	);
};

export const VideoTestingFrameAccuracy: React.FC = () => {
	const cases = [
		{codec: 'webm', type: 'normal', left: 0, top: 0},
		{codec: 'webm', type: 'offthread', left: 540, top: 0},
		{codec: 'mp4', type: 'normal', left: 0, top: 540},
		{codec: 'mp4', type: 'offthread', left: 540, top: 540},
	] as const;

	return (
		<div>
			{cases.map(({codec, type, left, top}) => (
				<div
					key={`${codec}-${type}`}
					style={{
						position: 'absolute',
						left,
						top,
						width: 540,
						height: 540,
						overflow: 'hidden',
					}}
				>
					<div
						style={{
							position: 'relative',
							width: 1080,
							height: 1080,
							transform: 'scale(0.5)',
							transformOrigin: 'top left',
						}}
					>
						<VideoTesting codec={codec} type={type} />
					</div>
				</div>
			))}
		</div>
	);
};
