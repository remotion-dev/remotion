import {interpolateColors, useCurrentFrame} from 'remotion';

const AudioTesting: React.FC = () => {
	const frame = useCurrentFrame();

	return (
		<div>
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
		</div>
	);
};

export default AudioTesting;
