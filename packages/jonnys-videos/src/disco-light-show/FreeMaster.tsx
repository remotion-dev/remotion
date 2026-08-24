import {Audio} from '@remotion/media';
import React from 'react';
import {Sequence, Solid} from 'remotion';
import {AnimatedCaptions, CAPTIONS_HEIGHT} from './AnimatedCaptions';
import {asset} from './assets';
import {
	FIRST_CUSTOMER_CHART_DURATION_IN_FRAMES,
	FirstCustomerChart,
} from './FirstCustomerChart';
import {
	PREMIUM_VERSION_DURATION_IN_FRAMES,
	PremiumVersion,
} from './PremiumVersion';
import {
	UNRULY_OUTCOME_DURATION_IN_FRAMES,
	UnrulyOutcome,
} from './UnrulyOutcome';
import {ZURICH_PHOTO_DURATION_IN_FRAMES, ZurichPhoto} from './ZurichPhoto';

const FREE_MASTER_AUDIO_FILE =
	'ElevenLabs_2026-08-23T17_39_27_Derek - Fun & Energetic _pvc_sp115_s50_sb75_se0_b_m2.mp3';
const FREE_MASTER_CAPTIONS_FILE = 'free-master-captions.json';
const PREMIUM_VERSION_START_FRAME = 100;
const UNRULY_OUTCOME_START_FRAME = 148;
const FIRST_CUSTOMER_CHART_START_FRAME = 645;
const SWITZERLAND_SCENE_START_FRAME = 816;

export const FreeMaster: React.FC = () => {
	return (
		<>
			<Audio src={asset(FREE_MASTER_AUDIO_FILE)} durationInFrames={1674.71} />
			<Solid
				width={1080}
				height={1920}
				color={'#161616'}
				style={{
					position: 'absolute',
				}}
			/>
			<Sequence
				name="Premium version"
				from={PREMIUM_VERSION_START_FRAME}
				durationInFrames={PREMIUM_VERSION_DURATION_IN_FRAMES}
				premountFor={30}
			>
				<PremiumVersion />
			</Sequence>
			<Sequence
				name="Unruly outcome"
				from={UNRULY_OUTCOME_START_FRAME}
				durationInFrames={UNRULY_OUTCOME_DURATION_IN_FRAMES}
				premountFor={30}
			>
				<UnrulyOutcome />
			</Sequence>
			<Sequence
				name="First customer chart"
				from={FIRST_CUSTOMER_CHART_START_FRAME}
				durationInFrames={FIRST_CUSTOMER_CHART_DURATION_IN_FRAMES}
				premountFor={30}
			>
				<FirstCustomerChart />
			</Sequence>
			<Sequence
				name="Switzerland photograph and watch"
				from={SWITZERLAND_SCENE_START_FRAME}
				durationInFrames={ZURICH_PHOTO_DURATION_IN_FRAMES}
				premountFor={30}
			>
				<ZurichPhoto />
			</Sequence>
			<Sequence
				name="AnimatedCaptions"
				width={1080}
				height={CAPTIONS_HEIGHT}
				style={{
					position: 'absolute',
					translate: '0px 1132.3px',
				}}
			>
				<AnimatedCaptions
					captionsFile={FREE_MASTER_CAPTIONS_FILE}
					voiceoverFile={null}
				/>
			</Sequence>
		</>
	);
};
