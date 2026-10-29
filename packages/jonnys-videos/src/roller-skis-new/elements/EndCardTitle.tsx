import {Audio} from '@remotion/media';
import {Easing, Interactive, interpolate, useCurrentFrame} from 'remotion';
import {fontFamily} from './font';
const EndCardTitleInner = ({
	heading,
	title,
}: {
	readonly heading: string;
	readonly title: string;
}) => {
	const frame = useCurrentFrame();
	return (
		<>
			<div
				style={{
					position: 'absolute',
					inset: 0,
					display: 'flex',
					flexDirection: 'column',
					fontFamily,
					justifyContent: 'center',
					alignItems: 'center',
				}}
			>
				<div
					style={{
						color: 'white',
						fontSize: 64,
						fontWeight: 700,
						letterSpacing: 16,
						textTransform: 'uppercase',
						opacity: interpolate(frame, [4, 14], [0, 1], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						}),
						translate: interpolate(frame, [4, 18], ['0px 30px', '0px 0px'], {
							easing: Easing.bezier(0.16, 1, 0.3, 1),
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						}),
					}}
				>
					{heading}
				</div>
				<div
					style={{
						position: 'relative',
						marginTop: 10,
						padding: '0px 48px',
						scale: interpolate(frame, [14, 28], [0.3, 1], {
							easing: Easing.spring({damping: 11}),
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							output: 'perceptual-scale',
						}),
						opacity: interpolate(frame, [14, 17], [0, 1], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						}),
						rotate: interpolate(frame, [14, 30], ['-8deg', '-2deg'], {
							easing: Easing.bezier(0.16, 1, 0.3, 1),
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						}),
					}}
				>
					<div
						style={{
							position: 'absolute',
							inset: 0,
							backgroundColor: '#dc2626',
							clipPath: `inset(0% ${
								interpolate(frame, [20, 32], [1, 0], {
									easing: Easing.bezier(0.65, 0, 0.35, 1),
									extrapolateLeft: 'clamp',
									extrapolateRight: 'clamp',
								}) * 100
							}% 0% 0% round 24px)`,
							borderRadius: 24,
						}}
					/>
					<div
						style={{
							position: 'relative',
							color: 'white',
							fontSize: 260,
							fontWeight: 900,
							letterSpacing: -6,
							lineHeight: 1.05,
							textTransform: 'uppercase',
							textShadow: '0 12px 40px rgba(0,0,0,0.4)',
						}}
					>
						{title}
					</div>
				</div>
			</div>
			<Audio
				name="Whoosh"
				src="https://remotion.media/whoosh.wav"
				from={12}
				volume={0.6}
			/>
		</>
	);
};
export const EndCardTitle = Interactive.create({
	Component: EndCardTitleInner,
	layout: 'absolute-fill',
	schema: {
		heading: {type: 'string', default: 'Next time:', description: 'Heading'},
		title: {type: 'string', default: 'Brakes.', description: 'Title'},
	},
});
