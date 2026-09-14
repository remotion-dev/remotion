import {Video} from '@remotion/media';
import {Sequence, interpolate, useCurrentFrame, Easing} from 'remotion';
import {ArrowLogo} from './ArrowLogo';
import {ArrowLogoRemotion} from './ArrowLogoRemotion';
import {asset} from './assets';

export const TEXT_BACKGROUND_DURATION_IN_FRAMES = 226;

export const TextBackgroundComposition: React.FC = () => {
	const frame = useCurrentFrame();
	return (
		<>
			<Sequence>
				<Video
					src={asset('text-background.mov')}
					style={{
						width: 1920,
						height: 1080,
					}}
					muted
					trimBefore={2916}
					durationInFrames={TEXT_BACKGROUND_DURATION_IN_FRAMES}
				/>
			</Sequence>
			<Sequence
				name="ArrowLogo"
				width={1920}
				height={1080}
				durationInFrames={137}
				style={{
					position: 'absolute',
					scale: interpolate(frame, [94, 99], [0, 0.606], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
						output: 'perceptual-scale',
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
					translate: interpolate(
						frame,
						[94, 99],
						['-214px -287px', '-262.4px -318.1px'],
						{
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
						},
					),
					transformOrigin: interpolate(frame, [99], ['43.51% 92.58%'], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					}),
					rotate: interpolate(frame, [94, 103], ['45deg', '-43deg'], {
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
				from={94}
			>
				<ArrowLogo />
			</Sequence>
			<Sequence
				name="ArrowLogoRemotion"
				width={1920}
				height={1080}
				durationInFrames={240}
				style={{
					position: 'absolute',
					translate: '-202.5px 320.6px',
					scale: interpolate(frame, [134, 140], [0, 0.736], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
						output: 'perceptual-scale',
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
					transformOrigin: '50.46% 15.88%',
				}}
				from={134}
			>
				<ArrowLogoRemotion />
			</Sequence>
		</>
	);
};
