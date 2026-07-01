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
					translate: '-135.9px -91.7px',
				}}
			>
				<Map lineStartFrame={masterFlightCurveStartFrame} />
			</Sequence>
			<Sequence
				durationInFrames={247}
				style={{
					translate: '308.1px 185.2px',
					scale: 0.665,
				}}
			>
				<CodingPrompt />
			</Sequence>
		</>
	);
};
