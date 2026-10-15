import {Audio, Video} from '@remotion/media';
import React from 'react';
import {Interactive, Series} from 'remotion';

const RideMontageInner: React.FC = () => {
	return (
		<>
			<Series>
				<Series.Sequence
					name="Under the trees"
					trimBefore={99}
					durationInFrames={145}
					playbackRate={1.25}
				>
					<Video
						name="IMG_0466"
						src={
							'https://remotion.media/jonnys-videos/roller-skis-new/footage/IMG_0466.mp4'
						}
						volume={0.4}
						objectFit="cover"
						style={{width: '100%', height: '100%'}}
					/>
				</Series.Sequence>
				<Series.Sequence
					name="Pass-by"
					trimBefore={1422}
					durationInFrames={105}
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
			<Audio
				name="Whoosh"
				src="https://remotion.media/whoosh.wav"
				from={0}
				volume={0.5}
			/>
		</>
	);
};

export const RideMontage = Interactive.create({
	Component: RideMontageInner,
	layout: 'absolute-fill',
});
