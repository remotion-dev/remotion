import {AbsoluteFill, Sequence, useCurrentFrame, Video} from 'remotion';

export const MyVideo: React.FC = () => {
	const frame = useCurrentFrame();
	return (
		<div>
			<Video
				style={{
					transform: `scale(${(Math.sin(frame / 30) + 1) / 2})`,
				}}
				src="https://test-videos.co.uk/vids/bigbuckbunny/webm/vp8/1080/Big_Buck_Bunny_1080_10s_2MB.webm"
			/>
			<Sequence from={300} durationInFrames={300}>
				<Video
					style={{
						transform: `scale(${(Math.sin(frame / 30) + 1) / 2})`,
					}}
					src="https://test-videos.co.uk/vids/bigbuckbunny/webm/vp8/1080/Big_Buck_Bunny_1080_10s_2MB.webm"
				/>
			</Sequence>
			<Sequence from={600} durationInFrames={300}>
				<Video
					style={{
						transform: `scale(${(Math.sin(frame / 30) + 1) / 2})`,
					}}
					src="https://test-videos.co.uk/vids/bigbuckbunny/webm/vp8/1080/Big_Buck_Bunny_1080_10s_2MB.webm"
				/>
			</Sequence>
			<Sequence from={900} durationInFrames={300}>
				<Video
					style={{
						transform: `scale(${(Math.sin(frame / 30) + 1) / 2})`,
					}}
					src="https://test-videos.co.uk/vids/bigbuckbunny/webm/vp8/1080/Big_Buck_Bunny_1080_10s_2MB.webm"
				/>
			</Sequence>
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
