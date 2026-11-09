import {Audio} from '@remotion/media';
import {Interactive, Track} from 'remotion';
import {BeatPlaceholder} from './StudioUpdateBeat';

const StudioUpdateBeatTimelineContent = () => {
	return (
		<>
			<Track name="Musical phrases and accents">
				<BeatPlaceholder
					name="01 - Opening"
					from={0}
					durationInFrames={49}
					title="OPENING"
					cue="Establish the texture · long hold"
				/>
				<BeatPlaceholder
					name="02 - Lift"
					from={49}
					durationInFrames={59}
					title="LIFT"
					cue="Follow the next musical phrase"
				/>
				<BeatPlaceholder
					name="03 - First hit"
					from={108}
					durationInFrames={50}
					title="FIRST HIT"
					cue="Land on the low accent"
				/>
				<BeatPlaceholder
					name="04 - Answer"
					from={158}
					durationInFrames={50}
					title="ANSWER"
					cue="Let the repeated phrase play"
				/>
				<BeatPlaceholder
					name="05 - Pickup"
					from={208}
					durationInFrames={34}
					title="PICKUP"
					cue="Shorten into the transition"
				/>
				<BeatPlaceholder
					name="06 - Breathe"
					from={242}
					durationInFrames={56}
					title="BREATHE"
					cue="Hold through the break"
				/>
				<BeatPlaceholder
					name="07 - Groove returns"
					from={298}
					durationInFrames={51}
					title="GROOVE RETURNS"
					cue="Land with the rhythm"
				/>
				<BeatPlaceholder
					name="08 - Rattle pickup"
					from={349}
					durationInFrames={11}
					title="RATTLE PICKUP"
					cue="Set up the rapid fill"
				/>
				<BeatPlaceholder
					name="09 - Rattle 01"
					from={360}
					durationInFrames={3}
					title="RATTLE 01"
					cue="Short percussion accent"
				/>
				<BeatPlaceholder
					name="10 - Rattle 02"
					from={363}
					durationInFrames={3}
					title="RATTLE 02"
					cue="Short percussion accent"
				/>
				<BeatPlaceholder
					name="11 - Rattle 03"
					from={366}
					durationInFrames={3}
					title="RATTLE 03"
					cue="Short percussion accent"
				/>
				<BeatPlaceholder
					name="12 - Rattle 04"
					from={369}
					durationInFrames={3}
					title="RATTLE 04"
					cue="Short percussion accent"
				/>
				<BeatPlaceholder
					name="13 - Rattle 05"
					from={372}
					durationInFrames={3}
					title="RATTLE 05"
					cue="Short percussion accent"
				/>
				<BeatPlaceholder
					name="14 - Rattle 06"
					from={375}
					durationInFrames={3}
					title="RATTLE 06"
					cue="Short percussion accent"
				/>
				<BeatPlaceholder
					name="15 - Rattle 07"
					from={378}
					durationInFrames={3}
					title="RATTLE 07"
					cue="Short percussion accent"
				/>
				<BeatPlaceholder
					name="16 - Rattle 08"
					from={381}
					durationInFrames={16}
					title="RATTLE 08"
					cue="Hold the final hit"
				/>
				<BeatPlaceholder
					name="17 - Push"
					from={397}
					durationInFrames={26}
					title="PUSH"
					cue="Return to the groove"
				/>
				<BeatPlaceholder
					name="18 - Snap"
					from={423}
					durationInFrames={11}
					title="SNAP"
					cue="Quick syncopated answer"
				/>
				<BeatPlaceholder
					name="19 - Release"
					from={434}
					durationInFrames={38}
					title="RELEASE"
					cue="Give the phrase space"
				/>
				<BeatPlaceholder
					name="20 - Next phrase"
					from={472}
					durationInFrames={38}
					title="NEXT PHRASE"
					cue="Follow the musical response"
				/>
				<BeatPlaceholder
					name="21 - Build"
					from={510}
					durationInFrames={36}
					title="BUILD"
					cue="Hold into the next accent"
				/>
				<BeatPlaceholder
					name="22 - Pickup"
					from={546}
					durationInFrames={26}
					title="PICKUP"
					cue="Prepare the snare fill"
				/>
				<BeatPlaceholder
					name="23 - Snare 01"
					from={572}
					durationInFrames={4}
					title="SNARE 01"
					cue="First fill accent"
				/>
				<BeatPlaceholder
					name="24 - Snare 02"
					from={576}
					durationInFrames={4}
					title="SNARE 02"
					cue="Four-frame cut"
				/>
				<BeatPlaceholder
					name="25 - Snare 03"
					from={580}
					durationInFrames={4}
					title="SNARE 03"
					cue="Four-frame cut"
				/>
				<BeatPlaceholder
					name="26 - Snare 04"
					from={584}
					durationInFrames={4}
					title="SNARE 04"
					cue="Four-frame cut"
				/>
				<BeatPlaceholder
					name="27 - Snare 05"
					from={588}
					durationInFrames={4}
					title="SNARE 05"
					cue="Four-frame cut"
				/>
				<BeatPlaceholder
					name="28 - Snare 06"
					from={592}
					durationInFrames={4}
					title="SNARE 06"
					cue="Land the fill"
				/>
				<BeatPlaceholder
					name="29 - Resolve"
					from={596}
					durationInFrames={24}
					title="RESOLVE"
					cue="Settle back into the groove"
				/>
				<BeatPlaceholder
					name="30 - Accent"
					from={620}
					durationInFrames={25}
					title="ACCENT"
					cue="Cut with the next phrase"
				/>
				<BeatPlaceholder
					name="31 - Breathe again"
					from={645}
					durationInFrames={38}
					title="BREATHE AGAIN"
					cue="Hold through the breakdown"
				/>
				<BeatPlaceholder
					name="32 - Bass pickup"
					from={683}
					durationInFrames={3}
					title="BASS PICKUP"
					cue="Set up the stutter"
				/>
				<BeatPlaceholder
					name="33 - Bass stutter 01"
					from={686}
					durationInFrames={3}
					title="BASS STUTTER 01"
					cue="Short bass accent"
				/>
				<BeatPlaceholder
					name="34 - Bass stutter 02"
					from={689}
					durationInFrames={6}
					title="BASS STUTTER 02"
					cue="Hold before the release"
				/>
				<BeatPlaceholder
					name="35 - Release the groove"
					from={695}
					durationInFrames={25}
					title="RELEASE THE GROOVE"
					cue="Let the rhythm move again"
				/>
				<BeatPlaceholder
					name="36 - Answering phrase"
					from={720}
					durationInFrames={37}
					title="ANSWERING PHRASE"
					cue="A longer visual thought"
				/>
				<BeatPlaceholder
					name="37 - Build again"
					from={757}
					durationInFrames={45}
					title="BUILD AGAIN"
					cue="Carry the musical phrase"
				/>
				<BeatPlaceholder
					name="38 - Open up"
					from={802}
					durationInFrames={67}
					title="OPEN UP"
					cue="Longest hold before the finish"
				/>
				<BeatPlaceholder
					name="39 - Final pickup"
					from={869}
					durationInFrames={21}
					title="FINAL PICKUP"
					cue="Start the closing run"
				/>
				<BeatPlaceholder
					name="40 - Answer"
					from={890}
					durationInFrames={21}
					title="ANSWER"
					cue="Short closing phrase"
				/>
				<BeatPlaceholder
					name="41 - Push forward"
					from={911}
					durationInFrames={27}
					title="PUSH FORWARD"
					cue="Build toward the resolution"
				/>
				<BeatPlaceholder
					name="42 - Final accent"
					from={938}
					durationInFrames={15}
					title="FINAL ACCENT"
					cue="Quick cut on the hit"
				/>
				<BeatPlaceholder
					name="43 - Resolve"
					from={953}
					durationInFrames={16}
					title="RESOLVE"
					cue="Release the final action"
				/>
				<BeatPlaceholder
					name="44 - End hold"
					from={969}
					durationInFrames={24}
					title="END HOLD"
					cue="Let the soundtrack finish"
				/>
			</Track>
			<Track name="Soundtrack">
				<Audio
					name="Takiti (Instrumental Version) - Lawd Ito"
					src="https://remotion.media/studio-update/takiti-instrumental-lawd-ito-adapted-2026-11-02-448ab724379d.wav"
					from={0}
					durationInFrames={993}
				/>
			</Track>
		</>
	);
};

export const StudioUpdateBeatTimeline = Interactive.create({
	Component: StudioUpdateBeatTimelineContent,
	layout: 'absolute-fill',
	schema: {},
});
