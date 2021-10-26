import React from 'react';
import {Composition, getInputProps} from 'remotion';
import BetaText from './BetaText';
import {ColorInterpolation} from './ColorInterpolation';
import {Framer} from './Framer';
import {MissingImg} from './MissingImg';
import RemoteVideo from './RemoteVideo';
import {SkipZeroFrame} from './SkipZeroFrame';
import {SeriesTesting} from './StaggerTesting';
import {TenFrameTester} from './TenFrameTester';
import ThreeBasic from './ThreeBasic';
import {VideoSpeed} from './VideoSpeed';
import {VideoTesting} from './VideoTesting';

// Use it to test that UI does not regress on weird CSS
//import './weird-css.css';

export const Index: React.FC = () => {
	return (
		<>
			<Composition
				id="color-interpolation"
				component={ColorInterpolation}
				width={1280}
				height={720}
				fps={30}
				durationInFrames={100}
			/>
		</>
	);
};
