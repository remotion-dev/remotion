import React, {useRef} from 'react';
import './transparent-video.css';

export const OverlayInDavinci: React.FC = () => {
	const ref = useRef<HTMLVideoElement>(null);

	return (
		<div>
			<video
				ref={ref}
				src="https://pub-646d808d9cb240cea53bedc76dd3cd0c.r2.dev/OverlayInDavinci.mp4"
				controls
				autoPlay
				loop
				playsInline
			/>
		</div>
	);
};
