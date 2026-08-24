import {Audio} from '@remotion/media';
import React from 'react';
import {Sequence, Solid} from 'remotion';
import {
	AnimatedCaptions,
	CAPTIONS_HEIGHT,
} from '../components/AnimatedCaptions';
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

const HOW_CAN_REMOTION_BE_FREE_AUDIO_FILE = 'voiceover-2.mp3';
const HOW_CAN_REMOTION_BE_FREE_CAPTIONS_FILE = 'captions-2.json';
const PREMIUM_VERSION_START_FRAME = 99;
const UNRULY_OUTCOME_START_FRAME = 134;
const FIRST_CUSTOMER_CHART_START_FRAME = 649;
const SWITZERLAND_SCENE_START_FRAME = 866;

export const HowCanRemotionBeFree: React.FC = () => {
	return (
		<>
			<Audio
				src={asset(HOW_CAN_REMOTION_BE_FREE_AUDIO_FILE)}
				durationInFrames={1801.67}
			/>
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
					translate: '0px 780px',
				}}
			>
				<AnimatedCaptions
					captionsSrc={asset(HOW_CAN_REMOTION_BE_FREE_CAPTIONS_FILE)}
					voiceoverSrc={null}
				/>
			</Sequence>
		</>
	);
};
