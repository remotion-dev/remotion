import {Video} from '@remotion/media';
import React from 'react';
import {Interactive, interpolate, Sequence, useCurrentFrame} from 'remotion';
import {EndCardTitle} from '../elements/EndCardTitle';

const EndCardInner: React.FC = () => {
	const frame = useCurrentFrame();

	return (
		<>
			<Sequence name="Last frame" freeze={3328}>
				<Video
					name="IMG_0475"
					src={
						'https://remotion.media/jonnys-videos/roller-skis/footage/IMG_0475.MOV'
					}
					muted
					objectFit="cover"
					style={{
						width: '100%',
						height: '100%',
						filter: 'blur(16px) brightness(0.45)',
						scale: interpolate(frame, [0, 120], [1.1, 1.18], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						}),
					}}
				/>
			</Sequence>
			<EndCardTitle
				name="Next time: Brakes"
				heading="Next time:"
				title="Brakes."
			/>
		</>
	);
};

export const EndCard = Interactive.create({
	Component: EndCardInner,
	layout: 'absolute-fill',
});
