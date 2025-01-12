import React from 'react';
import {ChooseTemplate} from './ChooseTemplate';
import {GetStarted} from './GetStartedStrip';

export const WriteInReact: React.FC = () => {
	return (
		<div>
			<h1
				className="text-5xl lg:text-[5em] text-center fontbrand font-black leading-none "
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
				Create real MP4 videos with React. <br />
				Parametrize content, render server-side and build applications.
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
