import {linearProgressiveBlur} from '@remotion/effects/linear-progressive-blur';
import {Video} from '@remotion/media';
import {HtmlInCanvas} from 'remotion';

export const ExploreRemotionConvert = () => {
	return (
		<HtmlInCanvas
			name="Convert with progressive blur"
			width={1080}
			height={1080}
			durationInFrames={366}
			style={{backgroundColor: '#f7f8fa'}}
			effects={[
				linearProgressiveBlur({
					start: [0.15, 0.4],
					end: [1.2, 1.2],
					endBlur: 22,
				}),
			]}
		>
			<Video
				name="Conversion after scrolling stops"
				src="https://remotion.media/explore-remotion/convert-source-2026-10-25-4abc383bee51.mp4"
				durationInFrames={366}
				muted
				style={{
					position: 'absolute',
					width: 1774,
					height: 1440,
					left: 24,
					top: -40,
					scale: 0.82,
					rotate: '0 1 -0.1 22deg',
					transformOrigin: 'top left',
				}}
			/>
		</HtmlInCanvas>
	);
};
