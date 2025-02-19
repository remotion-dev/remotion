import React, {useCallback, useRef} from 'react';
import './transparent-video.css';

export const TransparentVideoDemo: React.FC = () => {
	const ref = useRef<HTMLVideoElement>(null);
	const onClick = useCallback(() => {
		ref.current?.classList.toggle('transparent');
	}, []);
	return (
		<div>
			<video
				ref={ref}
				src="/img/transparent-video.webm"
				controls
				autoPlay
				loop
				playsInline
			/>
			<p className="tr-centered" onClick={onClick}>
				<button type="button">Toggle transparency</button>
			</p>
		</div>
	);
};
