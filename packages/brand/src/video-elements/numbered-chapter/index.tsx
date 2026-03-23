import {
	AbsoluteFill,
	Audio,
	spring,
	staticFile,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {z} from 'zod';
import {BLUE} from '../../colors';
import {loadFont} from '../../load-font';

loadFont();

export const numberedChapterSchema = z.object({
	chapterNumber: z.number(),
	chapterTitle: z.string(),
});

type NumberedChapterProps = z.infer<typeof numberedChapterSchema>;

export const NumberedChapter: React.FC<NumberedChapterProps> = ({
	chapterNumber,
	chapterTitle,
}) => {
	const {fps} = useVideoConfig();
	const frame = useCurrentFrame();
	const jump1 = spring({
		fps,
		frame,
		config: {
			damping: 200,
		},
		durationInFrames: 10,
	});

	const jump2 = spring({
		fps,
		frame: frame - 7,
		config: {
			damping: 200,
		},
		durationInFrames: 10,
	});

	return (
		<AbsoluteFill>
			<Audio src={staticFile('chime.mp3')} />
			<AbsoluteFill
				style={{
					backgroundColor: 'white',
					justifyContent: 'center',
					alignItems: 'center',
				}}
			>
				<div
					style={{
						height: 200,
						width: 200,
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',
						color: 'white',
						backgroundColor: BLUE,
						fontSize: 80,
						fontWeight: 900,
						borderRadius: '50%',
						fontFamily: 'GT Planar',
						fontFeatureSettings: "'ss03' 1",
						scale: String(jump1),
						translate: `0 ${-jump2 * 50}px`,
					}}
				>
					{chapterNumber}
				</div>
			</AbsoluteFill>
			<AbsoluteFill
				style={{
					justifyContent: 'center',
					alignItems: 'center',
					fontFamily: 'GT Planar',
					fontWeight: 700,
					fontSize: 40,
					fontFeatureSettings: "'ss03' 1",
					translate: `0 ${-jump2 * 100 + 220}px`,
					opacity: jump2,
				}}
			>
				<h2>{chapterTitle}</h2>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
