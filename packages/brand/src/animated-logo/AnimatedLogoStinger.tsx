import React from 'react';
import {
	AbsoluteFill,
	Sequence,
	spring,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {TriangleEntrance} from '../TriangularEntrance';
import {AnimatedLogo} from './AnimatedLogo';

export const AnimatedLogoStringer: React.FC = () => {
	const {fps, durationInFrames} = useVideoConfig();
	const frame = useCurrentFrame();

	const springIn = spring({
		fps,
		frame,
		config: {
			damping: 200,
		},
	});

	const springOut = spring({
		fps,
		frame: frame - durationInFrames + 15,
		config: {
			damping: 200,
		},
		durationInFrames: 15,
	});

	return (
		<TriangleEntrance progress={springIn} type="in">
			<TriangleEntrance progress={springOut} type="out">
				<AbsoluteFill
					style={{
						backgroundColor: 'white',
					}}
				>
					<Sequence from={5}>
						<AnimatedLogo theme="light" />
					</Sequence>
				</AbsoluteFill>
			</TriangleEntrance>
		</TriangleEntrance>
	);
};
