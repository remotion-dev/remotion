import {Video} from '@remotion/media';
import React, {useState} from 'react';
import {AbsoluteFill, Composition} from 'remotion';
import {calculateMetadataFn} from './NewVideo';

const src = 'https://remotion.media/video.mp4';

const Component: React.FC = () => {
	const [trimBefore, setTrimBefore] = useState(0);

	return (
		<>
			<Video src={src} trimBefore={trimBefore} debugOverlay />
			<AbsoluteFill
				style={{
					alignItems: 'center',
					justifyContent: 'center',
					pointerEvents: 'none',
				}}
			>
				<button
					type="button"
					onClick={() => setTrimBefore((prev) => prev + 10)}
					style={{
						pointerEvents: 'auto',
						background: 'red',
						color: 'white',
						fontFamily: 'sans-serif',
						fontSize: 120,
						fontWeight: 'bold',
						padding: '80px 160px',
						border: 'none',
						borderRadius: 20,
						cursor: 'pointer',
					}}
				>
					trimBefore +10 (current: {trimBefore})
				</button>
			</AbsoluteFill>
		</>
	);
};

export const AudioSmoothnessTrimButtonComp: React.FC = () => {
	return (
		<Composition
			component={Component}
			id="audio-smoothness-trim-button"
			calculateMetadata={calculateMetadataFn}
		/>
	);
};
