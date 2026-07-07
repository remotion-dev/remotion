import React from 'react';
import {Sequence} from 'remotion';
import {CodingPrompt} from './CodingPrompt';
import {Map} from './Map';

export const homepageAssetMasterDurationInFrames = 240;
const masterFlightCurveStartFrame = 86;

export const HomepageAssetMaster: React.FC = () => {
	return (
		<>
			<Sequence
				durationInFrames={247}
				style={{
					translate: '-60.5px -168.7px',
					scale: 0.742,
				}}
			>
				<Map lineStartFrame={masterFlightCurveStartFrame} />
			</Sequence>
			<Sequence
				durationInFrames={247}
				style={{
					translate: '88.5px 170.7px',
					scale: 0.665,
				}}
			>
				<CodingPrompt />
			</Sequence>
		</>
	);
};
