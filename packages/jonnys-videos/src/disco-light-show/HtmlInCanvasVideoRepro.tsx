import {dropShadow} from '@remotion/effects/drop-shadow';
import {scale} from '@remotion/effects/scale';
import {Video} from '@remotion/media';
import {Arrow} from '@remotion/shapes';
import {HtmlInCanvas, Img, Sequence} from 'remotion';

const IMAGE =
	"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Ccircle cx='100' cy='100' r='90' fill='blue'/%3E%3C/svg%3E";

export const HtmlInCanvasVideoRepro: React.FC = () => {
	return (
		<HtmlInCanvas name="Video inside HtmlInCanvas" width={1280} height={720}>
			<Video
				src="https://remotion.media/video.mp4"
				objectFit="cover"
				style={{width: '100%', height: '100%'}}
			/>
			<Sequence from={90}>
				<Arrow
					length={300}
					headWidth={185}
					headLength={120}
					shaftWidth={80}
					direction="right"
					fill="white"
					effects={[scale({scale: 0.8}), dropShadow({radius: 82})]}
				/>
				<Img
					src={IMAGE}
					style={{width: 200, height: 200, translate: '400px 0'}}
					effects={[dropShadow({radius: 82})]}
				/>
			</Sequence>
		</HtmlInCanvas>
	);
};
