import {Series, Video, AbsoluteFill} from 'remotion';

export const VideoautoplayDemo = () => {
	return (
		<AbsoluteFill
			style={{
				backgroundColor: 'red',
			}}
		>
			<Series>
				<Series.Sequence name="Video 1" key={'video-1'} durationInFrames={450}>
					<Video
						src="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4"
						volume={0.8}
						startFrom={0}
						endAt={450}
						style={{
							height: '100%',
							width: '100%',
							backgroundColor: '#000',
						}}
					/>
				</Series.Sequence>
				<Series.Sequence
					name={`Video 2`}
					key={`video-2`}
					durationInFrames={1800}
				>
					<Video
						src={
							'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4'
						}
						volume={1}
						startFrom={0}
						endAt={1800}
						style={{
							height: '100%',
							width: '100%',
							backgroundColor: '#000',
						}}
					/>
				</Series.Sequence>
				<Series.Sequence name="Video 3" key={'video-3'} durationInFrames={450}>
					<Video
						src="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
						volume={0.8}
						startFrom={0}
						endAt={450}
						style={{
							height: '100%',
							width: '100%',
							backgroundColor: '#000',
						}}
					/>
				</Series.Sequence>
			</Series>
		</AbsoluteFill>
	);
};
