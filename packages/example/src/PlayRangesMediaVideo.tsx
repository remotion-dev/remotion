// Repro: @remotion/media Video inside Series.Sequence with trim windows and premount.
import {Video} from '@remotion/media';
import React from 'react';
import {CalculateMetadataFunction, Series} from 'remotion';

export const PLAY_RANGES_MEDIA_VIDEO_URL_DEFAULT =
	'https://d6d4ismr40iw.cloudfront.net/content-lab/filestack/custom_assets/1f132751-d675-6630-83ca-a3750ed5f908/1f132751-d677-6d40-9a71-d233250ae390/preview.mp4';

const fps = 24;

export type PlayRangeSection = {
	trimBefore: number;
	trimAfter: number;
};

export const PLAY_RANGES_MEDIA_DEFAULT: PlayRangeSection[] = [
	{trimBefore: 0.5 * fps, trimAfter: 1 * fps},
	{trimBefore: 1.5 * fps, trimAfter: 2 * fps},
	{trimBefore: 2.5 * fps, trimAfter: 3 * fps},
	{trimBefore: 3.5 * fps, trimAfter: 4 * fps},
	{trimBefore: 4.5 * fps, trimAfter: 5 * fps},
	{trimBefore: 5.5 * fps, trimAfter: 6 * fps},
	{trimBefore: 6.5 * fps, trimAfter: 7 * fps},
	{trimBefore: 7.5 * fps, trimAfter: 8 * fps},
];

export const PLAY_RANGES_MEDIA_ZIP_DEFAULT: PlayRangeSection[] = [
	{trimBefore: 0 * fps, trimAfter: 4 * fps},
	{trimBefore: 4.5 * fps, trimAfter: 5 * fps},
	{trimBefore: 5.5 * fps, trimAfter: 6 * fps},
	{trimBefore: 6.5 * fps, trimAfter: 7 * fps},
	{trimBefore: 7.5 * fps, trimAfter: 8 * fps},
];

export type PlayRangesMediaVideoProps = {
	url: string;
	playRanges: PlayRangeSection[];
};

export const calculateMetadataPlayRangesMedia: CalculateMetadataFunction<
	PlayRangesMediaVideoProps
> = ({props}) => {
	const durationInFrames = props.playRanges.reduce(
		(acc, s) => acc + (s.trimAfter - s.trimBefore),
		0,
	);

	return {
		fps,
		durationInFrames,
	};
};

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
