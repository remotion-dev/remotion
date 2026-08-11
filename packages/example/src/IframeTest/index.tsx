import React from 'react';
import {IFrame, useVideoConfig} from 'remotion';

const IFrameTest: React.FC = () => {
	const {width, height} = useVideoConfig();
	return <IFrame style={{width, height}} src="https://remotion.dev" />;
};

export default IFrameTest;
