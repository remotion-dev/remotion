import {alias} from 'lib/alias';
import React from 'react';
import {Composition, z} from 'remotion';
import RiveVehicle from './Rive/RiveExample';

if (alias !== 'alias') {
	throw new Error('should support TS aliases');
}

// Use it to test that UI does not regress on weird CSS
// import './weird-css.css';

export const Index: React.FC = () => {
	return (
		<>
			<Composition
				id="rive-vehicle"
				component={RiveVehicle}
				width={1200}
				height={630}
				fps={30}
				durationInFrames={150}
				schema={z.object({
					hi: z.string(),
					there: z.number(),
				})}
				defaultProps={{
					hi: 'there',
					there: 1,
				}}
			/>
		</>
	);
};
