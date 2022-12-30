import {
	interpolateColors,
	Satori,
	spring,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

const AudioTesting: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	const spr = spring({
		fps,
		frame,
	});

	return (
		<div>
			<Satori>
				<div
					style={{
						justifyContent: 'center',
						alignItems: 'center',
						height: '100%',
						width: '100%',
						display: 'flex',
					}}
				>
					<div
						style={{
							backgroundColor: interpolateColors(
								frame,
								[0, 30, 60, 90, 120],
								['blue', 'red', 'yellow', 'green', 'pink']
							),
							height: 200,
							width: 200,
							borderRadius: 100,
						}}
					/>
				</div>
			</Satori>
		</div>
	);
};

export default AudioTesting;
