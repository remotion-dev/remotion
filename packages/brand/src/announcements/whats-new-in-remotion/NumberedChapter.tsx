import {Audio} from '@remotion/media';
import {
	AbsoluteFill,
	continueRender,
	delayRender,
	Sequence,
	spring,
	useCurrentFrame,
	useVideoConfig,
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
	const {fps} = useVideoConfig();
	const frame = useCurrentFrame();

	const delay = fps;

	const jump1 = spring({
		fps,
		frame: frame - delay,
		config: {damping: 200},
		durationInFrames: 10,
	});

	const jump2 = spring({
		fps,
		frame: frame - delay - 7,
		config: {damping: 200},
		durationInFrames: 10,
	});

	return (
		<AbsoluteFill>
			<Sequence from={30} layout="none">
				<Audio src={assetUrl('chime.mp3')} volume={0.05} />
			</Sequence>

			<AbsoluteFill
				style={{
					backgroundColor: 'white',
					justifyContent: 'center',
					alignItems: 'center',
				}}
			>
				<div
					style={{
						height: 120,
						width: 120,
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',
						color: 'white',
						backgroundColor: BLUE,
						fontSize: 50,
						fontWeight: 700,
						borderRadius: '50%',
						fontFamily: 'Variable',
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
					fontWeight: 500,
					fontSize: 46,
					translate: `0 ${-jump2 * 100 + 150}px`,
					opacity: jump2,
					marginTop: 15,
				}}
			>
				<h2>{chapterTitle}</h2>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
