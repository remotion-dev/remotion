import {AbsoluteFill, CanvasImage, Series} from 'remotion';

export const BrowserScaleScene = () => {
	return (
		<Series>
			<Series.Sequence durationInFrames={60} name="Browser — scale 1">
				<AbsoluteFill
					name="Scale 1 browser screenshot"
					style={{backgroundColor: '#20242a'}}
				>
					<CanvasImage
						fit="cover"
						height={1080}
						name="Browser screenshot at scale 1"
						src="https://remotion.media/webmcp-promo/browser-scale-1.jpg"
						width={1920}
					/>
				</AbsoluteFill>
			</Series.Sequence>
			<Series.Sequence
				durationInFrames={60}
				name="Browser — scale 1.2"
				premountFor={30}
			>
				<AbsoluteFill
					name="Scale 1.2 browser screenshot"
					style={{backgroundColor: '#20242a'}}
				>
					<CanvasImage
						fit="cover"
						height={1080}
						name="Browser screenshot at scale 1.2"
						src="https://remotion.media/webmcp-promo/browser-scale-1-2.jpg"
						width={1920}
					/>
				</AbsoluteFill>
			</Series.Sequence>
		</Series>
	);
};
