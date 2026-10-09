import {Video} from '@remotion/media';
import React from 'react';
import {Interactive, Series, useVideoConfig} from 'remotion';

const OffWeGoInner: React.FC = () => {
	const {fps} = useVideoConfig();

	return (
		<>
			<Series>
				<Series.Sequence
					name="Skiing away"
					trimBefore={486}
					durationInFrames={108}
					premountFor={fps}
				>
					<Video
						name="IMG_0458"
						src={
							'https://remotion.media/jonnys-videos/roller-skis-new/footage/IMG_0458.mp4'
						}
						volume={1.5}
						premountFor={fps}
						objectFit="cover"
						style={{width: '100%', height: '100%'}}
					/>
				</Series.Sequence>
			</Series>
		</>
	);
};

export const OffWeGo = Interactive.withSchema({
	Component: OffWeGoInner,
	componentName: 'OffWeGo',
	schema: {},
	wrapInSequence: true,
	layout: 'absolute-fill',
});
