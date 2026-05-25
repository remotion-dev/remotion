import React from 'react';
import {ChooseTemplate} from './ChooseTemplate';
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
				Create videos and video apps with React.
			</h1>
			<p
				style={{
					textShadow: '0 5px 30px var(--background)',
				}}
				className="font-medium text-center text-lg"
			>
				Use code, data, and AI agents to generate real MP4 videos. <br />
				Build once, customize endlessly, and render at scale.
			</p>
			<br />
			<div>
				<GetStarted />
			</div>
			<br />
			<br />
			<ChooseTemplate />
		</div>
	);
};
