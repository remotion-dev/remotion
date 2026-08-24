import {useGsapTimeline} from '@remotion/gsap';
import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';

const OverlapLayer: React.FC<{color: string; direction: number}> = ({
	color,
	direction,
}) => {
	const scope = useGsapTimeline<HTMLDivElement>(({timeline, selector}) => {
		timeline.fromTo(
			selector('[data-layer]'),
			{x: direction * 130, opacity: 0, scale: 0.6},
			{x: 0, opacity: 0.82, scale: 1, duration: 1, ease: 'power3.out'},
		);
	});

	return (
		<AbsoluteFill
			ref={scope}
			style={{alignItems: 'center', justifyContent: 'center'}}
		>
			<div
				data-layer
				style={{
					width: 150,
					height: 90,
					borderRadius: 28,
					background: color,
					mixBlendMode: 'screen',
				}}
			/>
		</AbsoluteFill>
	);
};

const OverlapFixture: React.FC = () => (
	<AbsoluteFill style={{background: '#05060B'}}>
		<Sequence from={10} durationInFrames={55} premountFor={10}>
			<OverlapLayer color="#7C5CFF" direction={-1} />
		</Sequence>
		<Sequence from={30} durationInFrames={55} premountFor={10}>
			<OverlapLayer color="#FF5F8F" direction={1} />
		</Sequence>
	</AbsoluteFill>
);

export default OverlapFixture;
