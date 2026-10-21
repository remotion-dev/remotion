import {AbsoluteFill, Solid} from 'remotion';
import {TransitionsRecordingComposition} from '../../TransitionsRecordingComposition';

export const ExploreRemotionTransitions = () => {
	return (
		<>
			<Solid
				name="Matching background"
				width={1080}
				height={1080}
				color="#19191b"
				style={{position: 'absolute'}}
			/>
			<AbsoluteFill
				name="Transition preview close-up"
				style={{
					width: 1080,
					height: 564,
					left: 0,
					top: 258,
					rotate: '0 1 -0.1 18deg',
					transformOrigin: 'center',
				}}
			>
				<AbsoluteFill
					name="Capture framing"
					style={{
						width: 1918,
						height: 1440,
						left: -840,
						top: -631,
						scale: 0.902,
						transformOrigin: 'top left',
						translate: '504.6px 257.1px',
					}}
				>
					<TransitionsRecordingComposition />
				</AbsoluteFill>
			</AbsoluteFill>
		</>
	);
};
