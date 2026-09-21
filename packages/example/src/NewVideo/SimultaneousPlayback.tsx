import {Video} from '@remotion/media';
import {CalculateMetadataFunction, Composition} from 'remotion';
import {z} from 'zod';
import {getMediaMetadata} from '../get-media-metadata';

const src = 'https://remotion.media/video.mp4';

export const simultaneousPlaybackSchema = z.object({
	instances: z.number().int().min(1).max(64),
});

type SimultaneousPlaybackProps = z.infer<typeof simultaneousPlaybackSchema>;

const calculateMetadata: CalculateMetadataFunction<
	SimultaneousPlaybackProps
> = async () => {
	const {durationInSeconds, dimensions, fps} = await getMediaMetadata(src);

	return {
		durationInFrames: Math.round(durationInSeconds * fps!),
		fps: fps!,
		width: dimensions!.width,
		height: dimensions!.height,
	};
};

const SimultaneousPlayback = ({instances}: SimultaneousPlaybackProps) => {
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
			{Array.from({length: instances}, (_, index) => (
				<Video
					key={index}
					src={src}
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
			))}
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
			}}
		/>
	);
};
