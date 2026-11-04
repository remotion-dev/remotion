import {HtmlInCanvas, Sequence} from 'remotion';
import {RenderModalCodecPreview} from '../../RenderModalCodec';

export const ExploreRemotionRenderModalCodec = () => {
	return (
		<HtmlInCanvas width={1080} height={1080}>
			<div
				style={{
					position: 'absolute',
					left: -420,
					top: 0,
					width: 1920,
					height: 1080,
				}}
			>
				<Sequence name="RenderModalCodec" durationInFrames={127}>
					<RenderModalCodecPreview />
				</Sequence>
			</div>
		</HtmlInCanvas>
	);
};
