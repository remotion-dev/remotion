import {Video} from '@remotion/media';
import {Interactive, interpolate, useCurrentFrame, Easing} from 'remotion';
import {ArrowLogo} from './ArrowLogo';
import {ArrowLogoRemotion} from './ArrowLogoRemotion';
import {asset} from './assets';

export const TEXT_BACKGROUND_DURATION_IN_FRAMES = 226;

const TextBackgroundCompositionInner: React.FC = () => {
	const frame = useCurrentFrame();
	return (
		<>
			<Video
				name="DJ show intro"
				src={asset('text-background.mov')}
				style={{
					width: 1920,
					height: 1080,
				}}
				muted
				trimBefore={2916}
				durationInFrames={TEXT_BACKGROUND_DURATION_IN_FRAMES}
			/>
			<ArrowLogo
				name="ArrowLogo"
				width={1920}
				height={1080}
				durationInFrames={62}
				style={{
					position: 'absolute',
					scale: 0.606,
					translate: interpolate(
						frame,
						[72, 80, 122, 134],
						[
							'1137.6px -318.1px',
							'-262.4px -318.1px',
							'-262.4px -318.1px',
							'-1662.4px -318.1px',
						],
						{
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							easing: Easing.inOut(Easing.cubic),
						},
					),
					transformOrigin: interpolate(frame, [99], ['43.51% 92.58%'], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					}),
					rotate: interpolate(frame, [72, 84], ['45deg', '-43deg'], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
						easing: [
							Easing.spring({
								damping: 200,
								mass: 1,
								stiffness: 100,
								allowTail: true,
								durationRestThreshold: 0.02,
								overshootClamping: false,
							}),
						],
					}),
				}}
				from={72}
			/>
			<ArrowLogoRemotion
				name="ArrowLogoRemotion"
				width={1920}
				height={1080}
				durationInFrames={240}
				style={{
					position: 'absolute',
					translate: interpolate(
						frame,
						[134, 140],
						['1197.5px 320.6px', '-202.5px 320.6px'],
						{
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							easing: Easing.inOut(Easing.cubic),
						},
					),
					scale: 0.736,
					transformOrigin: '50.46% 15.88%',
				}}
				from={134}
			/>
		</>
	);
};

export const TextBackgroundComposition = Interactive.create({
	Component: TextBackgroundCompositionInner,
	layout: 'absolute-fill',
});
