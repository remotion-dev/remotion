import React from 'react';
import {GetStarted} from './GetStartedStrip';

export const WriteInReact: React.FC = () => {
	return (
		<div>
			<h1
				className="text-4xl sm:text-5xl lg:text-[5em] text-center fontbrand font-black leading-none text-balance"
				style={{
					textShadow: '0 5px 30px var(--background)',
				}}
			>
				Make videos programmatically.
			</h1>
			<p
				style={{
					textShadow: '0 5px 30px var(--background)',
				}}
				className="font-medium text-center text-lg"
			>
				Create videos and motion graphics with React. <br />
				Use coding agents, render in bulk and build apps.
			</p>
			<br />
			<div>
				<GetStarted />
			</div>
			<br />
			<br />
		</div>
	);
};
