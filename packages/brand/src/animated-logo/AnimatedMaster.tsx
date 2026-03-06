import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {AnimatedLogo} from './AnimatedLogo';
import {Arcs} from './Arcs';
import {FilmRoll} from './film-roll';

export const AnimatedMaster: React.FC = () => {
	return (
		<AbsoluteFill>
			<AbsoluteFill>
				<FilmRoll />
			</AbsoluteFill>
			<Sequence from={55}>
				<Arcs />
			</Sequence>
			<Sequence from={108}>
				<AnimatedLogo theme="light" />
			</Sequence>
		</AbsoluteFill>
	);
};
