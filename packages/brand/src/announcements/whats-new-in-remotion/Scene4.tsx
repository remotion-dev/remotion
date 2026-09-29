import {Video} from '@remotion/media';
import {
	AbsoluteFill,
	Easing,
	Img,
	Interactive,
	Sequence,
	interpolate,
	useCurrentFrame,
} from 'remotion';
import {assetUrl} from './assets';
import {CodeBRoll} from './CodeBRoll';

const VERCEL_CODE = `
const { sandboxFilePath } = await renderMediaOnVercel({
  sandbox,
  compositionId: 'MyComp',
  inputProps: { title: 'Hello World' },
});
`.trim();

export const Scene4: React.FC = () => {
	const frame = useCurrentFrame();

	return (
		<AbsoluteFill>
			<Interactive.Div
				name="Presenter position"
				style={{
					position: 'absolute',
					top: 0,
					left: 0,
					width: '100%',
					height: '100%',
					display: 'flex',
					flexDirection: 'column',
					translate: interpolate(
						frame,
						[15, 45, 79.8, 109.8],
						['0% 0px', '-20% 0px', '-20% 0px', '0% 0px'],
						{
							easing: [
								Easing.out(Easing.cubic),
								Easing.linear,
								Easing.in(Easing.cubic),
							],
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						},
					),
				}}
			>
				<Video
					name="Presenter video"
					src={assetUrl('whats4.mov')}
					trimBefore={45}
					trimAfter={1164}
				/>
			</Interactive.Div>
			<Interactive.Div
				name="Chapter panel"
				style={{
					position: 'absolute',
					top: 0,
					bottom: 0,
					left: '60%',
					width: '40%',
					display: 'flex',
					flexDirection: 'column',
					overflow: 'hidden',
					backgroundColor: 'black',
					translate: interpolate(
						frame,
						[15, 45, 79.8, 109.8],
						['102% 0px', '0% 0px', '0% 0px', '102% 0px'],
						{
							easing: [
								Easing.out(Easing.cubic),
								Easing.linear,
								Easing.in(Easing.cubic),
							],
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						},
					),
				}}
			>
				<AbsoluteFill
					style={{
						justifyContent: 'center',
						alignItems: 'center',
					}}
				>
					<Video
						name="Vercel tetrahedron"
						src={assetUrl('tetrahedron.mp4')}
						muted
						style={{
							height: '100%',
							objectFit: 'contain',
						}}
					/>
				</AbsoluteFill>
			</Interactive.Div>
			<Sequence
				name="Vercel announcement"
				from={160}
				durationInFrames={90}
				premountFor={30}
			>
				<AbsoluteFill
					style={{
						backgroundColor: 'black',
						justifyContent: 'center',
						alignItems: 'center',
					}}
				>
					<Video
						name="Render on Vercel announcement"
						src={assetUrl('remotion-on-vercel.mp4')}
						muted
						style={{
							height: '100%',
							objectFit: 'contain',
						}}
					/>
				</AbsoluteFill>
			</Sequence>
			<Sequence
				name="Vercel website"
				from={368}
				durationInFrames={120}
				layout="none"
			>
				<Interactive.Div
					name="vercel-screenshot background"
					style={{
						position: 'absolute',
						inset: 0,
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',
						backgroundColor: 'white',
						opacity: interpolate(frame, [368, 374, 482, 488], [0, 1, 1, 0], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						}),
					}}
				>
					<Interactive.Div
						name="B-roll zoom"
						style={{
							height: '100%',
							transformOrigin: 'top center',
							scale: interpolate(frame, [368, 488], [1, 1.12], {
								extrapolateLeft: 'clamp',
								extrapolateRight: 'clamp',
							}),
						}}
					>
						<Img
							name="vercel-screenshot"
							src={assetUrl('vercel-screenshot.png')}
							style={{
								height: '100%',
								objectFit: 'contain',
								translate: interpolate(
									frame,
									[368, 488],
									['0px 0%', '0px 0%'],
									{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
								),
							}}
						/>
					</Interactive.Div>
				</Interactive.Div>
			</Sequence>
			<Sequence
				name="Vercel screen recording"
				from={615}
				durationInFrames={120}
				layout="none"
			>
				<Interactive.Div
					name="vercel-screen-recording background"
					style={{
						position: 'absolute',
						inset: 0,
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',
						backgroundColor: 'white',
						opacity: interpolate(frame, [615, 621, 729, 735], [0, 1, 1, 0], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						}),
					}}
				>
					<Interactive.Div
						name="B-roll zoom"
						style={{
							height: '100%',
							transformOrigin: 'top center',
							scale: interpolate(frame, [615, 735], [1, 1.05], {
								extrapolateLeft: 'clamp',
								extrapolateRight: 'clamp',
							}),
						}}
					>
						<Video
							name="vercel-screen-recording"
							src={assetUrl('vercel-screen-recording.mov')}
							muted
							style={{
								height: '100%',
								objectFit: 'contain',
								translate: interpolate(
									frame,
									[615, 735],
									['0px 0%', '0px 0%'],
									{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
								),
							}}
						/>
					</Interactive.Div>
				</Interactive.Div>
			</Sequence>
			<Sequence
				name="Vercel code example"
				from={920}
				durationInFrames={120}
				layout="none"
			>
				<CodeBRoll
					code={VERCEL_CODE}
					lang="ts"
					topExplainer="renderMediaOnVercel()"
				/>
			</Sequence>
			<Sequence name="YouTube tutorial" from={1040} layout="none">
				<AbsoluteFill
					style={{
						padding: 70,
						justifyContent: 'flex-start',
						alignItems: 'flex-start',
					}}
				>
					<Interactive.Div
						name="YouTube tutorial reference"
						style={{
							backgroundColor: 'white',
							fontFamily: 'GT Planar',
							padding: '24px 44px',
							fontSize: 36,
							top: 70,
							borderRadius: 18,
							boxShadow: '0 0 30px rgba(0, 0, 0, 0.1)',
							fontWeight: 'bold',
							translate: interpolate(
								frame,
								[1040, 1063, 1104, 1127],
								['0px -400px', '0px 0px', '0px 0px', '0px -400px'],
								{
									easing: [
										Easing.spring({damping: 200}),
										Easing.linear,
										Easing.spring({damping: 200}),
									],
									extrapolateLeft: 'clamp',
									extrapolateRight: 'clamp',
								},
							),
							rotate: interpolate(
								frame,
								[1040, 1063, 1104, 1127],
								['9deg', '0deg', '0deg', '9deg'],
								{
									easing: [
										Easing.spring({damping: 200}),
										Easing.linear,
										Easing.spring({damping: 200}),
									],
									extrapolateLeft: 'clamp',
									extrapolateRight: 'clamp',
								},
							),
						}}
					>
						The tutorial is out now out on YouTube!
					</Interactive.Div>
				</AbsoluteFill>
			</Sequence>
		</AbsoluteFill>
	);
};
