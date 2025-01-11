import React from 'react';

export const VideoAppsTitle: React.FC = () => {
	return (
		<div className={'text-center'}>
			<h2 className={'font-brand text-4xl'}>
				Build video <span className={'font-brand'}>apps</span>
			</h2>
			<p>
				Use our suite of tools to build apps that lets others create videos.
			</p>
		</div>
	);
};

export const PricingTitle: React.FC = () => {
	return (
		<div className={'text-center'}>
			<h2 className={'font-brand text-4xl'}>Pricing</h2>
			<br />
		</div>
	);
};

export const DemoTitle: React.FC = () => {
	return (
		<div className={'text-center'}>
			<h2 className={'font-brand text-4xl'}>Demo</h2>
			<br />
		</div>
	);
};
