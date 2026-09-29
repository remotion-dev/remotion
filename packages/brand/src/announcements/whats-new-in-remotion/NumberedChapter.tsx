import {Audio} from '@remotion/media';
import {
	AbsoluteFill,
	continueRender,
	delayRender,
	Easing,
	Interactive,
	interpolate,
	useCurrentFrame,
} from 'remotion';
import {assetUrl} from './assets';

export const BLUE = '#4290f5';

let fontLoaded = false;

const loadFont = async () => {
	if (fontLoaded) return;
	const handle = delayRender();
	const face = new FontFace(
		'Variable',
		`url(${assetUrl('variable.woff2')}) format('woff2')`,
	);
	await face.load();
	fontLoaded = true;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	(document.fonts as any).add(face);
	continueRender(handle);
};

loadFont();

type NumberedChapterProps = {
	chapterNumber: number;
	chapterTitle: string;
};

export const NumberedChapter: React.FC<NumberedChapterProps> = ({
	chapterNumber,
	chapterTitle,
}) => {
	const frame = useCurrentFrame();

	return (
		<AbsoluteFill>
			<Audio
				name="Chapter chime"
				from={30}
				src={assetUrl('chime.mp3')}
				volume={0.05}
			/>

			<AbsoluteFill
				style={{
					backgroundColor: 'white',
					justifyContent: 'center',
					alignItems: 'center',
				}}
			>
				<Interactive.Div
					name="Chapter number"
					style={{
						height: 120,
						width: 120,
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',
						color: 'white',
						backgroundColor: '#4290f5',
						fontSize: 50,
						fontWeight: 700,
						borderRadius: '50%',
						fontFamily: 'Variable',
						fontFeatureSettings: "'ss03' 1",
						scale: interpolate(frame, [30, 40], [0, 1], {
							easing: Easing.spring({damping: 200}),
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						}),
						translate: interpolate(frame, [37, 47], ['0px 0px', '0px -50px'], {
							easing: Easing.spring({damping: 200}),
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						}),
					}}
				>
					{chapterNumber}
				</Interactive.Div>
			</AbsoluteFill>
			<AbsoluteFill
				style={{
					justifyContent: 'center',
					alignItems: 'center',
					fontFamily: 'GT Planar',
					fontWeight: 500,
					fontSize: 46,
					translate: interpolate(frame, [37, 47], ['0px 150px', '0px 50px'], {
						easing: Easing.spring({damping: 200}),
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					}),
					opacity: interpolate(frame, [37, 47], [0, 1], {
						easing: Easing.spring({damping: 200}),
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					}),
					marginTop: 15,
				}}
			>
				<Interactive.H2 name="Chapter title">{chapterTitle}</Interactive.H2>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
