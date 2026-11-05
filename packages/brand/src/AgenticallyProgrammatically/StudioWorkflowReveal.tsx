import {Video} from '@remotion/media';
import {Easing, Interactive, interpolate, useCurrentFrame} from 'remotion';

const StudioWorkflowRevealContent = () => {
	const frame = useCurrentFrame();

	return (
		<Interactive.Div
			name="Reveal Studio and return to the video"
			style={{
				position: 'absolute',
				width: 1390,
				height: 742,
				backgroundColor: '#101114',
				border: '1px solid #35373d',
				borderRadius: 30,
				boxSizing: 'border-box',
				overflow: 'hidden',
				transformOrigin: 'top left',
				scale: interpolate(
					frame,
					[12, 57, 125, 170],
					[1920 / 606, 1904 / 1390, 1904 / 1390, 1920 / 606],
					{
						easing: Easing.inOut(Easing.cubic),
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					},
				),
				translate: interpolate(
					frame,
					[12, 57, 125, 170],
					[
						`${(-365 * 1920) / 606}px ${(-84 * 1920) / 606}px`,
						`8px ${1080 + 36 - (742 * 1904) / 1390}px`,
						`8px ${1080 + 36 - (742 * 1904) / 1390}px`,
						`${(-365 * 1920) / 606}px ${(-84 * 1920) / 606}px`,
					],
					{
						easing: Easing.inOut(Easing.cubic),
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					},
				),
			}}
		>
			<Video
				name="Studio playing this video"
				src="https://remotion.media/studio-close-ups/agentically-studio-reveal-png4x-lossless-467d439c9811.webm"
				muted
				durationInFrames={177}
				style={{
					position: 'absolute',
					left: 18,
					top: 18,
					width: 1352,
					height: 704,
					borderRadius: 12,
				}}
			/>
			<Interactive.Div
				name="Live presenter in the Studio preview"
				style={{
					position: 'absolute',
					left: 364,
					top: 83,
					width: 606,
					height: (606 / 1920) * 1080,
					overflow: 'hidden',
				}}
			>
				<div
					style={{
						width: 1920,
						height: 1080,
						transformOrigin: 'top left',
						scale: 606 / 1920,
					}}
				>
					<Video
						name="here7.mov — original camera footage"
						src="https://remotion.media/here-2026-11-03/here7-48a6fe4485a0.mov"
						trimBefore={185}
						muted
						cropLeft={0.143429487}
						cropRight={0.087339744}
						cropTop={0.185185185}
						cropBottom={0.045584046}
						style={{
							position: 'absolute',
							left: 0,
							top: 0,
							width: '130%',
							height: '130%',
							objectFit: 'cover',
							translate: '-358px -260px',
						}}
					/>
				</div>
			</Interactive.Div>
		</Interactive.Div>
	);
};

export const StudioWorkflowReveal = Interactive.create({
	Component: StudioWorkflowRevealContent,
	layout: 'absolute-fill',
	schema: {...Interactive.backgroundSchema},
});
