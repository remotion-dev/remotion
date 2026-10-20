import {Video} from '@remotion/media';
import {TransitionSeries} from '@remotion/transitions';
import React from 'react';
import {AbsoluteFill, Interactive} from 'remotion';
import {asset} from '../assets';

// Suggested 6-second picks from the party recording (~/Downloads/IMG_7933.MOV),
// hosted as short, hashed assets on remotion.media. Each sequence name holds
// the source time and a description. Delete the ones you don't want: later
// clips ripple forward automatically.
export const PARTY_SUGGESTIONS_DURATION_IN_FRAMES = 3145;

const PartySuggestionsInner: React.FC = () => {
	return (
		<AbsoluteFill style={{backgroundColor: 'black'}}>
			<TransitionSeries name="Party suggestions">
				<TransitionSeries.Sequence
					name="dance-02 · 36:12 · Solo at the DJ desk, stage-show visuals"
					durationInFrames={108}
				>
					<Video
						name="dance-02"
						src={asset('party-suggestions-dance-02-aed7a641812e.mp4')}
						trimBefore={0}
						style={{width: '100%', height: '100%'}}
					/>
				</TransitionSeries.Sequence>
				<TransitionSeries.Sequence
					name="dance-07 · 47:18 · Warm spotlight, moving at the desk"
					durationInFrames={180}
				>
					<Video
						name="dance-07"
						src={asset('party-suggestions-dance-07-4040ceb674ee.mp4')}
						trimBefore={0}
						style={{width: '100%', height: '100%'}}
					/>
				</TransitionSeries.Sequence>
				<TransitionSeries.Sequence
					name="dance-08 · 48:10 · Emoji visuals, purple light"
					durationInFrames={97}
				>
					<Video
						name="dance-08"
						src={asset('party-suggestions-dance-08-90e0f3202c0a.mp4')}
						trimBefore={0}
						style={{width: '100%', height: '100%'}}
					/>
				</TransitionSeries.Sequence>
				<TransitionSeries.Sequence
					name="lights-05 · 26:30 · Green 'Sing!' visuals, arm up"
					durationInFrames={135}
				>
					<Video
						name="lights-05"
						src={asset('party-suggestions-lights-05-57a7432e2860.mp4')}
						trimBefore={0}
						style={{width: '100%', height: '100%'}}
					/>
				</TransitionSeries.Sequence>
				<TransitionSeries.Sequence
					name="lights-06 · 29:00 · Green laser over the crowd, tracker-stabilized (faces visible)"
					durationInFrames={105}
				>
					<Video
						name="lights-06"
						src={asset('party-suggestions-lights-06-0bda6908023a.mp4')}
						trimBefore={0}
						style={{width: '100%', height: '100%'}}
					/>
				</TransitionSeries.Sequence>
				<TransitionSeries.Sequence
					name="lights-08 · 29:46 · Green laser over the crowd, stabilized (faces visible)"
					durationInFrames={180}
				>
					<Video
						name="lights-08"
						src={asset('party-suggestions-lights-08-01e337b9985e.mp4')}
						trimBefore={0}
						style={{width: '100%', height: '100%'}}
					/>
				</TransitionSeries.Sequence>
				<TransitionSeries.Sequence
					name="crowd-01 · 35:13 · Crowd dancing in blue light, stabilized (faces visible)"
					durationInFrames={180}
				>
					<Video
						name="crowd-01"
						src={asset('party-suggestions-crowd-01-32cd50338504.mp4')}
						trimBefore={0}
						style={{width: '100%', height: '100%'}}
					/>
				</TransitionSeries.Sequence>
				<TransitionSeries.Sequence
					name="dance-11 · 35:49 · Selfie close-up in front of the projection"
					durationInFrames={180}
				>
					<Video
						name="dance-11"
						src={asset('party-suggestions-dance-11-e79ea6d0ad74.mp4')}
						trimBefore={0}
						style={{width: '100%', height: '100%'}}
					/>
				</TransitionSeries.Sequence>
				<TransitionSeries.Sequence
					name="dance-13 · 39:46 · Magenta moving head, 'round baby right'"
					durationInFrames={180}
				>
					<Video
						name="dance-13"
						src={asset('party-suggestions-dance-13-63d817158999.mp4')}
						trimBefore={0}
						style={{width: '100%', height: '100%'}}
					/>
				</TransitionSeries.Sequence>
				<TransitionSeries.Sequence
					name="dance-15 · 45:58 · Warm yellow light, lyric visuals"
					durationInFrames={180}
				>
					<Video
						name="dance-15"
						src={asset('party-suggestions-dance-15-0d2f1fe56496.mp4')}
						trimBefore={0}
						style={{width: '100%', height: '100%'}}
					/>
				</TransitionSeries.Sequence>
				<TransitionSeries.Sequence
					name="dance-16 · 46:53 · 'Tell' lyrics, arm out"
					durationInFrames={180}
				>
					<Video
						name="dance-16"
						src={asset('party-suggestions-dance-16-c16b7e823141.mp4')}
						trimBefore={0}
						style={{width: '100%', height: '100%'}}
					/>
				</TransitionSeries.Sequence>
			</TransitionSeries>
		</AbsoluteFill>
	);
};

export const PartySuggestions = Interactive.create({
	Component: PartySuggestionsInner,
	layout: 'absolute-fill',
});
