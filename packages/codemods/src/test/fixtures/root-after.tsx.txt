import React from 'react';
import {Composition} from 'remotion';

const HelloWorld = () => {
	return <div>Hello World</div>;
};

export const Root: React.FC = () => {
	return (
		<>
			<Composition
				component={HelloWorld}
				durationInFrames={120}
				fps={30}
				height={1080}
				width={1080}
				id="HelloWorld"
			/>
			<Composition
				component={HelloWorld}
				durationInFrames={120}
				fps={30}
				height={1080}
				width={1080}
				id="Comp2"
			/>
			<Composition
				component={HelloWorld}
				durationInFrames={120}
				fps={30}
				height={1080}
				width={1080}
				id="Comp3"
				defaultProps={{abc: 'def', newDate: new Date('2022-01-02')}}
			/>
		</>
	);
};
