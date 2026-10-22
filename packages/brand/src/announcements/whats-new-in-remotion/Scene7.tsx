import {Audio, Video} from '@remotion/media';
import {
	AbsoluteFill,
	Easing,
	Interactive,
	Sequence,
	interpolate,
	useCurrentFrame,
} from 'remotion';
import {assetUrl} from './assets';
import {NumberedChapter} from './NumberedChapter';

const AgentsBRoll: React.FC = () => {
	const frame = useCurrentFrame();
	return (
		<AbsoluteFill
			style={{
				backgroundColor: '#141414',
				justifyContent: 'center',
				alignItems: 'center',
				opacity: interpolate(frame, [0, 6, 144, 150], [0, 1, 1, 0], {
					extrapolateLeft: 'clamp',
					extrapolateRight: 'clamp',
				}),
			}}
		>
			<Video
				name="Agent workflow screen recording"
				src={assetUrl('agents-screen-recording.mov')}
				muted
				playbackRate={2}
				style={{
					height: '70%',
					objectFit: 'contain',
					transformOrigin: 'top center',
					scale: interpolate(frame, [0, 150], [1, 1.08], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					}),
				}}
			/>
		</AbsoluteFill>
	);
};

export const Scene7: React.FC = () => {
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
						[15, 45, 120, 150, 700, 730, 1000, 1030],
						[
							'0% 0px',
							'-20% 0px',
							'-20% 0px',
							'0% 0px',
							'0% 0px',
							'-20% 0px',
							'-20% 0px',
							'0% 0px',
						],
						{
							easing: [
								Easing.out(Easing.cubic),
								Easing.linear,
								Easing.in(Easing.cubic),
								Easing.linear,
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
					src={assetUrl('whats7.mov')}
					trimBefore={126}
					trimAfter={1179}
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
						[15, 45, 120, 150],
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
				<NumberedChapter
					chapterNumber={6}
					chapterTitle="Work better with Agents"
				/>
			</Interactive.Div>
			<Sequence
				name="Agents screen recording"
				from={530}
				durationInFrames={150}
				layout="none"
			>
				<AgentsBRoll />
			</Sequence>
			<Sequence name="Agent improvements" from={700} layout="none">
				<Interactive.Div
					name="Details panel"
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
							[700, 730, 1000, 1030],
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
							backgroundColor: 'white',
							flexDirection: 'column',
							display: 'flex',
							padding: '0 40px',
						}}
					>
						<Interactive.Div
							name="Agentic flow heading"
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
							Agentic flow
						</Interactive.Div>
						<Interactive.Div
							name="Single Studio Server"
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
							}}
						>
							Single Studio Server
						</Interactive.Div>
						<Interactive.Div
							name="No multiple lockfile warning"
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
								opacity: interpolate(frame, [740, 752], [0, 1], {
									easing: Easing.spring({damping: 200}),
									extrapolateLeft: 'clamp',
									extrapolateRight: 'clamp',
								}),
								translate: interpolate(
									frame,
									[740, 752],
									['0px 20px', '0px 0px'],
									{
										easing: Easing.spring({damping: 200}),
										extrapolateLeft: 'clamp',
										extrapolateRight: 'clamp',
									},
								),
							}}
						>
							No multiple lockfile warning
						</Interactive.Div>
						<Audio
							name="No multiple lockfile warning sound"
							from={40}
							src={assetUrl('list-item-sfx.m4a')}
							volume={0.8}
						/>
						<Interactive.Div
							name="Zod 4 supported"
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
								opacity: interpolate(frame, [940, 952], [0, 1], {
									easing: Easing.spring({damping: 200}),
									extrapolateLeft: 'clamp',
									extrapolateRight: 'clamp',
								}),
								translate: interpolate(
									frame,
									[940, 952],
									['0px 20px', '0px 0px'],
									{
										easing: Easing.spring({damping: 200}),
										extrapolateLeft: 'clamp',
										extrapolateRight: 'clamp',
									},
								),
							}}
						>
							Zod 4 supported
						</Interactive.Div>
						<Audio
							name="Zod 4 supported sound"
							from={240}
							src={assetUrl('list-item-sfx.m4a')}
							volume={0.8}
						/>
					</AbsoluteFill>
				</Interactive.Div>
			</Sequence>
		</AbsoluteFill>
	);
};
