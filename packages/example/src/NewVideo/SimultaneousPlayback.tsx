import {Video} from '@remotion/media';
import {CalculateMetadataFunction, Composition, random} from 'remotion';
import {z} from 'zod';
import {getMediaMetadata} from '../get-media-metadata';

const src = 'https://remotion.media/video.mp4';

// Pexels IDs (https://www.pexels.com/video/<id>/), in a fixed, mixed order.
// Each hosted clip is normalized to 10s, 1080p, H.264 High, 30fps, ~5Mbps,
// with a 60-frame GOP, faststart and no audio.
const sourcePool = [
	854100, 7224880, 6943034, 7727415, 853959, 4264864, 1093652, 8626265, 8061378,
	15155443, 1722694, 8103389, 2098989, 10297366, 5580677, 13211307,
].map(
	(id) => `https://remotion.media/simultaneous-playback/v1/pexels-${id}.mp4`,
);

export const simultaneousPlaybackSchema = z.object({
	instances: z.number().int().min(1).max(64),
	differentSources: z.boolean(),
});

type SimultaneousPlaybackProps = z.infer<typeof simultaneousPlaybackSchema>;

const calculateMetadata: CalculateMetadataFunction<
	SimultaneousPlaybackProps
> = async ({props}) => {
	if (props.differentSources) {
		return {
			durationInFrames: 300,
			fps: 30,
			width: 1920,
			height: 1080,
		};
	}

	const {durationInSeconds, dimensions, fps} = await getMediaMetadata(src);

	return {
		durationInFrames: Math.round(durationInSeconds * fps!),
		fps: fps!,
		width: dimensions!.width,
		height: dimensions!.height,
	};
};

const SimultaneousPlayback = ({
	instances,
	differentSources,
}: SimultaneousPlaybackProps) => {
	const columns = Math.ceil(Math.sqrt(instances));
	const rows = Math.ceil(instances / columns);

	return (
		<div
			style={{
				backgroundColor: 'black',
				display: 'grid',
				gridTemplateColumns: `repeat(${columns}, 1fr)`,
				gridTemplateRows: `repeat(${rows}, 1fr)`,
				height: '100%',
				width: '100%',
			}}
		>
			{Array.from({length: instances}, (_, index) => {
				// Keep the first 16 distinct. Beyond that, reuse sources randomly but
				// deterministically so rerenders and benchmark runs keep the same URLs.
				const sourceIndex =
					index < sourcePool.length
						? index
						: Math.floor(
								random(`simultaneous-playback-${index}`) * sourcePool.length,
							);

				return (
					<Video
						key={index}
						src={differentSources ? sourcePool[sourceIndex] : src}
						muted
						debugOverlay
						objectFit="cover"
						style={{
							height: '100%',
							minHeight: 0,
							minWidth: 0,
							width: '100%',
						}}
					/>
				);
			})}
		</div>
	);
};

export const SimultaneousPlaybackComp = () => {
	return (
		<Composition
			id="SimultaneousPlayback"
			component={SimultaneousPlayback}
			calculateMetadata={calculateMetadata}
			schema={simultaneousPlaybackSchema}
			defaultProps={{
				instances: 4,
				differentSources: true,
			}}
		/>
	);
};
