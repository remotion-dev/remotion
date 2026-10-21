import {Audio} from '@remotion/media';
import {Interactive, interpolate, Sequence, Track} from 'remotion';
import {asset} from '../assets';
import {DiscoBallBg} from '../DiscoBallBg';
import {SocialSafeZones} from '../SocialSafeZones';
import {LightsCaptions} from './LightsCaptions';
import {LightsFootage} from './LightsFootage';
import {LIGHTS_DURATION_IN_FRAMES, LIGHTS_VOICEOVER_SRC} from './voiceover';

const AnimateTheLightsInner = () => (
	<>
		<DiscoBallBg
			name="Same dark paper background"
			width={1080}
			height={1920}
			durationInFrames={LIGHTS_DURATION_IN_FRAMES}
		/>
		<Track name="Footage">
			<LightsFootage
				name="Solo light-show footage"
				from={0}
				durationInFrames={LIGHTS_DURATION_IN_FRAMES}
				width={1080}
				height={1920}
				src={asset('solo-dmx-light-show-8c06c9856456.mp4')}
				footageRate={1}
			/>
		</Track>
		<Track name="Music">
			<Audio
				name="Kein Kokain — instrumental"
				src={asset('kein-kokain-instrumental-fad54dabc4a4.mp3')}
				trimBefore={0.95075 * 30}
				durationInFrames={LIGHTS_DURATION_IN_FRAMES}
				volume={(frame) =>
					interpolate(
						frame,
						[
							0,
							7,
							LIGHTS_DURATION_IN_FRAMES - 25,
							LIGHTS_DURATION_IN_FRAMES - 1,
						],
						[0, 0.07, 0.07, 0],
						{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
					)
				}
			/>
		</Track>
		<SocialSafeZones
			name="Social safe zones — toggle visibility"
			width={1080}
			height={1920}
			durationInFrames={LIGHTS_DURATION_IN_FRAMES}
			platform="instagram"
			hidden
			style={{pointerEvents: 'none', zIndex: 2147483647}}
		/>
		<Sequence
			name="Narration and captions"
			durationInFrames={LIGHTS_DURATION_IN_FRAMES}
			width={1080}
			height={1920}
			style={{zIndex: 2147483647, pointerEvents: 'none'}}
		>
			<Audio name="ElevenLabs — Derek" src={LIGHTS_VOICEOVER_SRC} />
			<LightsCaptions
				name="Word-synchronized captions"
				width={1080}
				height={360}
				style={{
					position: 'absolute',
					translate: '0px 1260px',
					scale: 0.9,
					transformOrigin: '50% 0%',
				}}
			/>
		</Sequence>
	</>
);

export const AnimateTheLights = Interactive.create({
	Component: AnimateTheLightsInner,
	layout: 'absolute-fill',
});
