import {Video} from '@remotion/media';
import {TransitionSeries} from '@remotion/transitions';
import React from 'react';
import {Interactive} from 'remotion';

const OffWeGoInner: React.FC = () => {
	return (
		<>
			<TransitionSeries name="Off we go shots">
				<TransitionSeries.Sequence
					name="Skiing away"
					trimBefore={486}
					durationInFrames={108}
				>
					<Video
						name="IMG_0458"
						src={
							'https://remotion.media/jonnys-videos/roller-skis-new/footage/IMG_0458.mp4'
						}
						volume={1.5}
						objectFit="cover"
						style={{width: '100%', height: '100%'}}
					/>
				</TransitionSeries.Sequence>
			</TransitionSeries>
		</>
	);
};

export const OffWeGo = Interactive.create({
	Component: OffWeGoInner,
	layout: 'absolute-fill',
});
