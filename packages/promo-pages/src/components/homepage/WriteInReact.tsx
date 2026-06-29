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
				Make videos programmatically.
			</h1>
			<p
				style={{
					textShadow: '0 5px 30px var(--background)',
				}}
				className="font-medium text-center text-lg"
			>
				Video tools for the agent era. <br />
				Motion graphics, video editing, automations and apps.
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
