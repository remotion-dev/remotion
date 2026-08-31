import React from 'react';
import {MovingPillCaptions} from './moving-pill-captions.element';
import {AudioOscilloscope} from './oscilloscope.element';

export const MovingPillCaptionsComposition: React.FC = () => {
	return (
		<>
			<MovingPillCaptions
				durationInFrames={210}
				name="Moving Pill Captions"
				style={{
					position: 'absolute',
					translate: '-12.2px -10.3px',
				}}
			/>
			<AudioOscilloscope
				durationInFrames={271}
				name="Audio Oscilloscope"
				style={{
					position: 'absolute',
					translate: '-28.2px -67.4px',
				}}
			/>
		</>
	);
};
