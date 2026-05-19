// Repro: @remotion/media Video inside Series.Sequence with trim windows and premount.
import {Video} from '@remotion/media';
import React from 'react';
import {Series} from 'remotion';
import type {PlayRangesMediaVideoProps} from './PlayRangesMediaVideo-calculate-metadata';

export const PLAY_RANGES_MEDIA_VIDEO_URL_DEFAULT =
	'https://d6d4ismr40iw.cloudfront.net/content-lab/filestack/custom_assets/1f132751-d675-6630-83ca-a3750ed5f908/1f132751-d677-6d40-9a71-d233250ae390/preview.mp4';

export const PlayRangesMediaVideo: React.FC<PlayRangesMediaVideoProps> = ({
	url,
	playRanges,
}) => {
	return (
		<div
			style={{
				height: '100%',
				width: '100%',
				display: 'flex',
				flexDirection: 'column',
			}}
		>
			<Series>
				{playRanges.map((section, i) => (
					<Series.Sequence
						key={i}
						durationInFrames={section.trimAfter - section.trimBefore}
						premountFor={30}
					>
						<div
							style={{
								display: 'flex',
								flexDirection: 'column',
								height: '100%',
								width: '100%',
							}}
						>
							{JSON.stringify(section)}
							<Video
								style={{
									height: '90%',
									width: '100%',
									backgroundColor: 'pink',
								}}
								src={url}
								trimBefore={section.trimBefore}
								trimAfter={section.trimAfter}
							/>
						</div>
					</Series.Sequence>
				))}
			</Series>
		</div>
	);
};
