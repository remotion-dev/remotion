import {Thumbnail, ThumbnailRef} from '@remotion/player';
import React, {useEffect, useRef} from 'react';
import {VideoautoplayDemo} from './VideoAutoplay';

export const ThumbnailDemo: React.FC = () => {
	const ref = useRef<ThumbnailRef>(null);

	useEffect(() => {
		ref.current?.addEventListener('resume', () => {
			console.log('resume');
		});
		ref.current?.addEventListener('waiting', () => {
			console.log('waiting');
		});
	}, []);

	return (
		<div style={{margin: '2rem'}}>
			<Thumbnail
				ref={ref}
				inputProps={{}}
				component={VideoautoplayDemo}
				compositionWidth={500}
				compositionHeight={432}
				frameToDisplay={40}
				durationInFrames={2700}
				fps={30}
				style={{
					width: 100,
					height: 100,
				}}
			/>
		</div>
	);
};
