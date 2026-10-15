import {Video} from '@remotion/media';
import React from 'react';
import {Interactive, Series} from 'remotion';

const OffWeGoInner: React.FC = () => {
	return (
		<>
			<Series>
				<Series.Sequence
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
				</Series.Sequence>
			</Series>
		</>
	);
};

export const OffWeGo = Interactive.create({
	Component: OffWeGoInner,
	layout: 'absolute-fill',
});
