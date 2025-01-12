import React from 'react';

export const VideoAppsTitle: React.FC = () => {
	return (
		<div className={'text-center'}>
			<h2 className={'fontbrand text-4xl'}>
				Build video <span className={'fontbrand'}>apps</span>
			</h2>
			<p>
				Use our suite of tools to build apps that lets others create videos.
			</p>
		</div>
	);
};

export const SectionTitle: React.FC<{readonly children: React.ReactNode}> = ({
	children,
}) => {
	return (
		<div className={'text-center'}>
			<h2 className={'fontbrand text-4xl'}>{children}</h2>
		</div>
	);
};
