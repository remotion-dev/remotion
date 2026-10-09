import {Audio, Video} from '@remotion/media';
import React from 'react';
import {
	AbsoluteFill,
	Interactive,
	Series,
	useVideoConfig,
	type InteractiveTransformProps,
} from 'remotion';

const RideMontageInner: React.FC<InteractiveTransformProps> = ({style}) => {
	const {fps} = useVideoConfig();

	return (
		<AbsoluteFill style={{backgroundColor: 'black', ...style}}>
			<Series>
				<Series.Sequence
					name="Under the trees"
					trimBefore={99}
					durationInFrames={145}
					playbackRate={1.25}
					premountFor={fps}
				>
					<Video
						name="IMG_0466"
						src={
							'https://remotion.media/jonnys-videos/roller-skis-new/footage/IMG_0466.mp4'
						}
						volume={0.4}
						premountFor={fps}
						objectFit="cover"
						style={{width: '100%', height: '100%'}}
					/>
				</Series.Sequence>
				<Series.Sequence
					name="Pass-by"
					trimBefore={1422}
					durationInFrames={105}
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
			<Audio
				name="Whoosh"
				src="https://remotion.media/whoosh.wav"
				from={0}
				volume={0.5}
				premountFor={fps}
			/>
		</AbsoluteFill>
	);
};

export const RideMontage = Interactive.withSchema({
	Component: RideMontageInner,
	componentName: '<RideMontage>',
	schema: {},
	wrapInSequence: true,
});
