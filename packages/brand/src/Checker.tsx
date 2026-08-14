import React from 'react';
import {Solid, Sequence} from 'remotion';
import {paper} from '@remotion/effects/paper';
import {ThreeDCheck} from './3DCheck/index';

export const Checker: React.FC = () => {
	return (
		<>
			<Solid
				width={900}
				height={900}
				color={'#ffffff'}
				style={{
					position: 'absolute',
				}}
				effects={[
					paper({
						colorFront: '#ffffff',
						contrast: 0.04,
					}),
				]}
			/>
			<Sequence
				name="3DCheck"
				width={300}
				height={300}
				durationInFrames={1000}
				style={{
					position: 'absolute',
					translate: '0px 231.6px',
				}}
			>
				<ThreeDCheck />
			</Sequence>
		</>
	);
};
