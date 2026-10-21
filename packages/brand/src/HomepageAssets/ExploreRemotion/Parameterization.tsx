import {radialProgressiveBlur} from '@remotion/effects/radial-progressive-blur';
import {AbsoluteFill, HtmlInCanvas, Sequence} from 'remotion';
import {ParameterizationRecordingComposition} from '../../ParameterizationRecordingComposition';

export const ExploreRemotionParameterization = () => {
	return (
		<HtmlInCanvas
			width={1080}
			height={1080}
			effects={[
				radialProgressiveBlur({
					height: 1.661,
					rotation: 56.3,
					width: 1.429,
					start: 0.277,
					endBlur: 23,
					center: [0.245, 0.618],
				}),
			]}
		>
			<AbsoluteFill
				style={{
					backgroundColor: '#1f2428',
					overflow: 'hidden',
					scale: 1.685,
					translate: '350px 30px',
				}}
			>
				<AbsoluteFill
					name="Number drag close-up"
					style={{
						width: 1100,
						height: 700,
						left: 0,
						top: 150,
						overflow: 'hidden',
						rotate: '0.123143 -0.99049 0.061367 29.36985deg',
						scale: 1.2,
						translate: '0px 20px',
					}}
				>
					<AbsoluteFill
						style={{
							width: 2032,
							height: 1440,
							transform: 'translate(-745px, -500px)',
						}}
					>
						<Sequence from={-390} layout="none" name="Drag duration">
							<ParameterizationRecordingComposition />
						</Sequence>
					</AbsoluteFill>
				</AbsoluteFill>
			</AbsoluteFill>
		</HtmlInCanvas>
	);
};
