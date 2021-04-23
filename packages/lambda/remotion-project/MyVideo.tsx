import {interpolate, useCurrentFrame, Video} from 'remotion';

export const MyVideo: React.FC = () => {
	const frame = useCurrentFrame();
	return (
		<Video
			style={{
				opacity: interpolate(frame, [0, 500], [1, 0], {
					extrapolateRight: 'clamp',
				}),
			}}
			src="https://test-videos.co.uk/vids/bigbuckbunny/webm/vp8/1080/Big_Buck_Bunny_1080_10s_2MB.webm"
		/>
	);
};
