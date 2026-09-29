import {Audio, Video} from '@remotion/media';
import {
	AbsoluteFill,
	Easing,
	Interactive,
	interpolate,
	useCurrentFrame,
} from 'remotion';
import {assetUrl} from './assets';
import {NumberedChapter} from './NumberedChapter';

const OverlayContent: React.FC = () => {
	const frame = useCurrentFrame();

	return (
		<AbsoluteFill style={{backgroundColor: 'white'}}>
			<AbsoluteFill
				name="Chapter title fade"
				style={{
					opacity: interpolate(frame, [185, 193], [1, 0], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					}),
				}}
			>
				<NumberedChapter chapterNumber={4} chapterTitle="New Skills" />
			</AbsoluteFill>
			<AbsoluteFill
				name="Skills list fade"
				style={{
					opacity: interpolate(frame, [193, 201], [0, 1], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					}),
				}}
			>
				<AbsoluteFill
					style={{
						backgroundColor: 'white',
						flexDirection: 'column',
						display: 'flex',
						padding: '0 40px',
					}}
				>
					<Interactive.Div
						name="New Skills heading"
						style={{
							flex: 1,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							fontFamily: 'GT Planar',
							fontSize: 42,
							fontWeight: 700,
							color: '#111',
							borderBottom: '1px solid #e0e0e0',
						}}
					>
						New Skills
					</Interactive.Div>
					<Interactive.Div
						name="Voiceovers with ElevenLabs"
						style={{
							flex: 1,
							display: 'flex',
							alignItems: 'center',
							fontFamily: 'GT Planar',
							fontSize: 34,
							fontWeight: 500,
							color: '#333',
							paddingLeft: 20,
							borderBottom: '1px solid #e0e0e0',
							opacity: interpolate(frame, [255, 267], [0, 1], {
								easing: Easing.spring({damping: 200}),
								extrapolateLeft: 'clamp',
								extrapolateRight: 'clamp',
							}),
							translate: interpolate(
								frame,
								[255, 267],
								['0px 20px', '0px 0px'],
								{
									easing: Easing.spring({damping: 200}),
									extrapolateLeft: 'clamp',
									extrapolateRight: 'clamp',
								},
							),
						}}
					>
						Voiceovers with ElevenLabs
					</Interactive.Div>
					<Audio
						name="Voiceovers with ElevenLabs sound"
						from={255}
						src={assetUrl('list-item-sfx.m4a')}
						volume={0.8}
					/>
					<Interactive.Div
						name="Working with FFmpeg"
						style={{
							flex: 1,
							display: 'flex',
							alignItems: 'center',
							fontFamily: 'GT Planar',
							fontSize: 34,
							fontWeight: 500,
							color: '#333',
							paddingLeft: 20,
							borderBottom: '1px solid #e0e0e0',
							opacity: interpolate(frame, [330, 342], [0, 1], {
								easing: Easing.spring({damping: 200}),
								extrapolateLeft: 'clamp',
								extrapolateRight: 'clamp',
							}),
							translate: interpolate(
								frame,
								[330, 342],
								['0px 20px', '0px 0px'],
								{
									easing: Easing.spring({damping: 200}),
									extrapolateLeft: 'clamp',
									extrapolateRight: 'clamp',
								},
							),
						}}
					>
						Working with FFmpeg
					</Interactive.Div>
					<Audio
						name="Working with FFmpeg sound"
						from={330}
						src={assetUrl('list-item-sfx.m4a')}
						volume={0.8}
					/>
					<Interactive.Div
						name="Audio visualization"
						style={{
							flex: 1,
							display: 'flex',
							alignItems: 'center',
							fontFamily: 'GT Planar',
							fontSize: 34,
							fontWeight: 500,
							color: '#333',
							paddingLeft: 20,
							borderBottom: '1px solid #e0e0e0',
							opacity: interpolate(frame, [420, 432], [0, 1], {
								easing: Easing.spring({damping: 200}),
								extrapolateLeft: 'clamp',
								extrapolateRight: 'clamp',
							}),
							translate: interpolate(
								frame,
								[420, 432],
								['0px 20px', '0px 0px'],
								{
									easing: Easing.spring({damping: 200}),
									extrapolateLeft: 'clamp',
									extrapolateRight: 'clamp',
								},
							),
						}}
					>
						Audio visualization
					</Interactive.Div>
					<Audio
						name="Audio visualization sound"
						from={420}
						src={assetUrl('list-item-sfx.m4a')}
						volume={0.8}
					/>
					<Interactive.Div
						name="Exporting transparent videos"
						style={{
							flex: 1,
							display: 'flex',
							alignItems: 'center',
							fontFamily: 'GT Planar',
							fontSize: 34,
							fontWeight: 500,
							color: '#333',
							paddingLeft: 20,
							borderBottom: 'none',
							opacity: interpolate(frame, [520, 532], [0, 1], {
								easing: Easing.spring({damping: 200}),
								extrapolateLeft: 'clamp',
								extrapolateRight: 'clamp',
							}),
							translate: interpolate(
								frame,
								[520, 532],
								['0px 20px', '0px 0px'],
								{
									easing: Easing.spring({damping: 200}),
									extrapolateLeft: 'clamp',
									extrapolateRight: 'clamp',
								},
							),
						}}
					>
						Exporting transparent videos
					</Interactive.Div>
					<Audio
						name="Exporting transparent videos sound"
						from={520}
						src={assetUrl('list-item-sfx.m4a')}
						volume={0.8}
					/>
				</AbsoluteFill>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

export const Scene5: React.FC = () => {
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
						[15, 45, 638.1, 668.1],
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
					src={assetUrl('whats5.mov')}
					trimBefore={91}
					trimAfter={760}
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
						[15, 45, 638.1, 668.1],
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
				<OverlayContent />
			</Interactive.Div>
		</AbsoluteFill>
	);
};
