import {mix} from 'polished';
import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import styled from 'styled-components';

const Container = styled.div`
	background-color: white;
	flex: 1;
`;

const Label = styled.div`
	font-size: 260px;
	color: black;
	font-weight: 700;
	font-family: 'SF Pro Text';
	text-align: center;
	transform: scaleX(1);
	line-height: 1em;
`;

const StaggerType: React.FC = () => {
	const types = 4;
	const frame = useCurrentFrame();
	const videoConfig = useVideoConfig();
	return (
		<Container
			style={{
				flex: 1,
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
			}}
		>
			<div>
				{new Array(types)
					.fill(true)
					.map((_, i) => {
						return i;
					})
					.map((i) => {
						const ratio = i / types;
						const isSecondHalf = frame > videoConfig.durationInFrames / 2;
						const opacity = frame / (videoConfig.durationInFrames / 2) > ratio;
						const stroking = (() => {
							if (!isSecondHalf) {
								return i % 2 === 0;
							}
							return Math.ceil(frame / 10) % 2 === i % 2;
						})();
						const color = mix(ratio, '#fff', '#000');
						return (
							<Label
								key={i}
								style={{
									...(stroking
										? {}
										: {
												WebkitTextStrokeColor: color,
												WebkitTextStrokeWidth: 8,
												WebkitTextFillColor: 'white',
										  }),
									opacity: Number(opacity),
									width: 2000,
									marginLeft: -(2000 - videoConfig.width) / 2,
									marginTop: -20,
								}}
							>
								beta
							</Label>
						);
					})}
			</div>
		</Container>
	);
};

export default StaggerType;
