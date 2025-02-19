import React, {useRef} from 'react';
import './transparent-video.css';

export const OverlayInDavinci: React.FC = () => {
	const ref = useRef<HTMLVideoElement>(null);

	return (
		<div>
			<video
				ref={ref}
				src="https://remotion-assets.s3.eu-central-1.amazonaws.com/OverlayInDavinci.mp4"
				controls
				autoPlay
				loop
				playsInline
			/>
		</div>
	);
};
