import React, {useState} from 'react';
import {AbsoluteFill, useDelayRender} from 'remotion';

export const Timeout: React.FC = () => {
	const {delayRender} = useDelayRender();
	useState(() => delayRender('This error should appear'));

	return <AbsoluteFill>hi there</AbsoluteFill>;
};
