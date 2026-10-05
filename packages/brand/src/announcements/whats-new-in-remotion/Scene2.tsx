import {Video} from '@remotion/media';
import {
	AbsoluteFill,
	Easing,
	Interactive,
	Sequence,
	interpolate,
	useCurrentFrame,
} from 'remotion';
import {assetUrl} from './assets';
import {LightLeakGrid} from './LightLeakGrid';
import {NumberedChapter} from './NumberedChapter';
import {Prompt} from './Prompt';

export const Scene2: React.FC = () => {
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
						[15, 45, 150, 180],
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
					src={assetUrl('whats2.mov')}
					trimBefore={191}
					trimAfter={954}
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
					backgroundColor: 'white',
					translate: interpolate(
						frame,
						[15, 45, 150, 180],
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
				<NumberedChapter chapterNumber={1} chapterTitle="Light Leaks" />
			</Interactive.Div>
			<Sequence
				name="Light leak screen recording"
				from={540}
				durationInFrames={90}
				layout="none"
			>
				<Interactive.Div
					name="screen-recording background"
					style={{
						position: 'absolute',
						inset: 0,
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',
						backgroundColor: 'white',
						opacity: interpolate(frame, [540, 546, 624, 630], [0, 1, 1, 0], {
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
							scale: interpolate(frame, [540, 630], [1, 1.05], {
								extrapolateLeft: 'clamp',
								extrapolateRight: 'clamp',
							}),
						}}
					>
						<Video
							name="screen-recording"
							src={assetUrl('screen-recording.mov')}
							muted
							style={{
								height: '100%',
								objectFit: 'contain',
								translate: interpolate(
									frame,
									[540, 630],
									['0px 0%', '0px 0%'],
									{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
								),
							}}
						/>
					</Interactive.Div>
				</Interactive.Div>
			</Sequence>
			<Prompt
				name="Agent prompt"
				from={655}
				durationInFrames={111}
				style={{
					opacity: interpolate(frame, [760, 766], [1, 0], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					}),
				}}
				prompt="Add a Light Leak transition between scenes"
				thinkingIndex={5}
			/>
			<Sequence name="Light leak variations" from={240} durationInFrames={180}>
				<Interactive.Div
					name="Light leak grid fade"
					style={{
						position: 'absolute',
						inset: 0,
						opacity: interpolate(frame, [240, 246, 414, 420], [0, 1, 1, 0], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						}),
					}}
				>
					<LightLeakGrid />
				</Interactive.Div>
			</Sequence>
		</AbsoluteFill>
	);
};
