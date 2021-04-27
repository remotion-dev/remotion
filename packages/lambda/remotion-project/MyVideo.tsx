import {AbsoluteFill, Sequence, useCurrentFrame, Video} from 'remotion';
import video from './video.webm';

export const MyVideo: React.FC = () => {
	const frame = useCurrentFrame();
	return (
		<div>
			{new Array(100)
				.fill(1)
				.map((_, k) => k)
				.map((k) => {
					return (
						<Sequence key={k} from={k * 300} durationInFrames={300}>
							<Video
								style={{
									transform: `scale(${(Math.sin(frame / 30) + 1) / 2})`,
								}}
								src={video}
							/>
						</Sequence>
					);
				})}
			<AbsoluteFill
				style={{
					justifyContent: 'center',
					alignItems: 'center',
					display: 'flex',
				}}
			>
				<div style={{color: 'white', fontSize: 400}}>{frame}</div>
			</AbsoluteFill>
		</div>
	);
};
