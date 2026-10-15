import {Video} from '@remotion/media';
import React from 'react';
import {Track, AbsoluteFill, Interactive, Series} from 'remotion';
import {PoppingWordCaptions} from '../elements/popping-word-captions';
import {SpeedBadge} from '../elements/SpeedBadge';
import {TitleCard} from '../elements/TitleCard';

const GearUpInner: React.FC = () => {
	return (
		<AbsoluteFill showInTimeline={false} style={{backgroundColor: 'black'}}>
			<Series>
				<Series.Sequence
					name="Strapping in (6x)"
					trimBefore={60}
					durationInFrames={528}
					playbackRate={6}
				>
					<Video
						name="IMG_0457"
						src={
							'https://remotion.media/jonnys-videos/roller-skis/footage/IMG_0457.MOV'
						}
						muted
						objectFit="cover"
						style={{width: '100%', height: '100%'}}
					/>
				</Series.Sequence>
				<Series.Sequence name="Damn it" trimBefore={591} durationInFrames={39}>
					<Video
						name="IMG_0457"
						src={
							'https://remotion.media/jonnys-videos/roller-skis/footage/IMG_0457.MOV'
						}
						volume={4}
						objectFit="cover"
						style={{width: '100%', height: '100%'}}
					/>
					<PoppingWordCaptions
						combineTokensWithinMilliseconds={null}
						name="Captions"
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
				>
					<Video
						name="IMG_0457"
						src={
							'https://remotion.media/jonnys-videos/roller-skis/footage/IMG_0457.MOV'
						}
						muted
						objectFit="cover"
						style={{width: '100%', height: '100%'}}
					/>
				</Series.Sequence>
				<Series.Sequence
					name="Lets get to work"
					trimBefore={1202}
					durationInFrames={58}
				>
					<Video
						name="IMG_0457"
						src={
							'https://remotion.media/jonnys-videos/roller-skis/footage/IMG_0457.MOV'
						}
						volume={3.5}
						objectFit="cover"
						style={{width: '100%', height: '100%'}}
					/>
					<PoppingWordCaptions
						combineTokensWithinMilliseconds={null}
						name="Captions"
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
				>
					<Video
						name="IMG_0457"
						src={
							'https://remotion.media/jonnys-videos/roller-skis/footage/IMG_0457.MOV'
						}
						muted
						objectFit="cover"
						style={{width: '100%', height: '100%'}}
					/>
				</Series.Sequence>
			</Series>
			<TitleCard
				name="Title"
				durationInFrames={84}
				line1="Roller ski"
				line2="Commute"
				kicker="Zürich · 8 AM"
				accentColor="#2563eb"
			/>
			<Track name="Speed badges">
				<SpeedBadge
					name="6x badge"
					from={6}
					durationInFrames={82}
					speed="6×"
					style={{position: 'absolute', right: 80, top: 70}}
				/>
				<SpeedBadge
					name="8x badge"
					from={127}
					durationInFrames={72}
					speed={'12x'}
					style={{position: 'absolute', right: 80, top: 70}}
				/>
				<SpeedBadge
					name="2x badge"
					from={257}
					durationInFrames={75}
					speed="2×"
					style={{position: 'absolute', right: 80, top: 70}}
				/>
			</Track>
		</AbsoluteFill>
	);
};

export const GearUp = Interactive.create({
	Component: GearUpInner,
	layout: 'absolute-fill',
});
