import React, {useState} from 'react';
import {AbsoluteFill, delayRender} from 'remotion';

export const Timeout: React.FC = () => {
	useState(() => delayRender('This error should appear'));

	return <AbsoluteFill>hi there</AbsoluteFill>;
};
