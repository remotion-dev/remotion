import {Video, VideoObjectFit} from '@remotion/media';
import React from 'react';
import {AbsoluteFill, Composition, staticFile} from 'remotion';
import {z} from 'zod';

const objectFitSchema = z.object({
	objectFit: z.enum(['fill', 'contain', 'cover', 'none', 'scale-down']),
});

const ObjectFitTest: React.FC<z.infer<typeof objectFitSchema>> = ({
	objectFit,
}) => {
	return (
		<AbsoluteFill style={{backgroundColor: '#333'}}>
			<Video
				src={staticFile('bigbuckbunny.mp4')}
				style={{width: '100%', height: '100%'}}
				objectFit={objectFit as VideoObjectFit}
				muted
			/>
		</AbsoluteFill>
	);
};

export const ObjectFitTestComp = () => {
	return (
		<Composition
			id="ObjectFitTest"
			component={ObjectFitTest}
			width={1080}
			height={1920}
			fps={30}
			durationInFrames={150}
			schema={objectFitSchema}
			defaultProps={{
				objectFit: 'cover' as const,
			}}
		/>
	);
};
