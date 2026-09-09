import React from 'react';

export const AutomateTitle: React.FC = () => {
	return (
		<div>
			<h1
				className="text-4xl sm:text-5xl lg:text-[5em] text-center fontbrand font-black leading-none text-balance"
				style={{
					textShadow: '0 5px 30px var(--background)',
				}}
			>
				Automate video production
			</h1>
			<p
				style={{
					textShadow: '0 5px 30px var(--background)',
				}}
				className="font-medium text-center text-lg"
			>
				Build simple workflows or entire video editors. <br />
				Scale rendering and do business.
			</p>
		</div>
	);
};
