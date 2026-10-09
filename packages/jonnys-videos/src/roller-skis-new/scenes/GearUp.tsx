import {Video} from '@remotion/media';
import React from 'react';
import {AbsoluteFill, Interactive, Series, useVideoConfig} from 'remotion';
import {PoppingWordCaptions} from '../elements/popping-word-captions';
import {SpeedBadge} from '../elements/SpeedBadge';
import {TitleCard} from '../elements/TitleCard';

const GearUpInner: React.FC = () => {
	const {fps} = useVideoConfig();

	return (
		<AbsoluteFill showInTimeline={false} style={{backgroundColor: 'black'}}>
			<Series>
				<Series.Sequence
					name="Strapping in (6x)"
					trimBefore={60}
					durationInFrames={528}
					playbackRate={6}
					premountFor={fps}
				>
					<Video
						name="IMG_0457"
						src={
							'https://remotion.media/jonnys-videos/roller-skis/footage/IMG_0457.MOV'
						}
						muted
						premountFor={fps}
						objectFit="cover"
						style={{width: '100%', height: '100%'}}
					/>
				</Series.Sequence>
				<Series.Sequence
					name="Damn it"
					trimBefore={591}
					durationInFrames={39}
					premountFor={fps}
				>
					<Video
						name="IMG_0457"
						src={
							'https://remotion.media/jonnys-videos/roller-skis/footage/IMG_0457.MOV'
						}
						volume={4}
						premountFor={fps}
						objectFit="cover"
						style={{width: '100%', height: '100%'}}
					/>
					<PoppingWordCaptions
						combineTokensWithinMilliseconds={null}
						name="Captions"
						premountFor={fps}
						width={1600}
						style={{position: 'absolute', bottom: 56, translate: '160px 0px'}}
						captions={[
							{
								text: ' Damn it!',
								startMs: 20180,
								endMs: 20560,
								timestampMs: 20370,
								confidence: null,
							},
						]}
					/>
				</Series.Sequence>
				<Series.Sequence
					name="Strapping in (8x)"
					trimBefore={630}
					durationInFrames={576}
					playbackRate={12}
					premountFor={fps}
				>
					<Video
						name="IMG_0457"
						src={
							'https://remotion.media/jonnys-videos/roller-skis/footage/IMG_0457.MOV'
						}
						muted
						premountFor={fps}
						objectFit="cover"
						style={{width: '100%', height: '100%'}}
					/>
				</Series.Sequence>
				<Series.Sequence
					name="Lets get to work"
					trimBefore={1202}
					durationInFrames={58}
					premountFor={fps}
				>
					<Video
						name="IMG_0457"
						src={
							'https://remotion.media/jonnys-videos/roller-skis/footage/IMG_0457.MOV'
						}
						volume={3.5}
						premountFor={fps}
						objectFit="cover"
						style={{width: '100%', height: '100%'}}
					/>
					<PoppingWordCaptions
						combineTokensWithinMilliseconds={null}
						name="Captions"
						premountFor={fps}
						width={1600}
						style={{position: 'absolute', bottom: 56, translate: '160px 0px'}}
						captions={[
							{
								text: ' Alright,',
								startMs: 40340,
								endMs: 40580,
								timestampMs: 40460,
								confidence: null,
							},
							{
								text: " let's",
								startMs: 40700,
								endMs: 40940,
								timestampMs: 40820,
								confidence: null,
							},
							{
								text: ' get',
								startMs: 40940,
								endMs: 41120,
								timestampMs: 41030,
								confidence: null,
							},
							{
								text: ' to',
								startMs: 41120,
								endMs: 41380,
								timestampMs: 41250,
								confidence: null,
							},
							{
								text: ' work!',
								startMs: 41380,
								endMs: 41680,
								timestampMs: 41530,
								confidence: null,
							},
						]}
					/>
				</Series.Sequence>
				<Series.Sequence
					name="Skiing off (2x)"
					trimBefore={1260}
					durationInFrames={150}
					playbackRate={2}
					premountFor={fps}
				>
					<Video
						name="IMG_0457"
						src={
							'https://remotion.media/jonnys-videos/roller-skis/footage/IMG_0457.MOV'
						}
						muted
						premountFor={fps}
						objectFit="cover"
						style={{width: '100%', height: '100%'}}
					/>
				</Series.Sequence>
			</Series>
			<TitleCard
				name="Title"
				durationInFrames={84}
				premountFor={fps}
				line1="Roller ski"
				line2="Commute"
				kicker="Zürich · 8 AM"
				accentColor="#2563eb"
			/>
			<SpeedBadge
				name="6x badge"
				from={6}
				durationInFrames={82}
				premountFor={fps}
				speed="6×"
				style={{position: 'absolute', right: 80, top: 70}}
			/>
			<SpeedBadge
				name="8x badge"
				from={127}
				durationInFrames={72}
				premountFor={fps}
				speed={'12x'}
				style={{position: 'absolute', right: 80, top: 70}}
			/>
			<SpeedBadge
				name="2x badge"
				from={257}
				durationInFrames={75}
				premountFor={fps}
				speed="2×"
				style={{position: 'absolute', right: 80, top: 70}}
			/>
		</AbsoluteFill>
	);
};

export const GearUp = Interactive.withSchema({
	Component: GearUpInner,
	componentName: '<GearUp>',
	schema: {},
	wrapInSequence: true,
	layout: 'absolute-fill',
});
