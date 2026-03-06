import React from 'react';
import {Sequence} from 'remotion';
import {Theme} from './colors';
import {Logo} from './Logo';
import {Recorder} from './Recorder';

export const All: React.FC<{
	theme: Theme;
}> = ({theme}) => {
	return (
		<Sequence>
			<Recorder theme={theme} />
			<Logo theme={theme} />
		</Sequence>
	);
};
