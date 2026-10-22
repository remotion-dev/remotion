import {Video} from '@remotion/media';
import {
	AbsoluteFill,
	Easing,
	Interactive,
	interpolate,
	useCurrentFrame,
} from 'remotion';
import {assetUrl} from './assets';
import {NumberedChapter} from './NumberedChapter';

export const Scene9: React.FC = () => {
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
						[15, 45, 120, 150],
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
					src={assetUrl('whats9.mov')}
					trimBefore={45}
					trimAfter={555}
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
					chapterNumber={8}
					chapterTitle="Preview: Visual Mode"
				/>
			</Interactive.Div>
		</AbsoluteFill>
	);
};
