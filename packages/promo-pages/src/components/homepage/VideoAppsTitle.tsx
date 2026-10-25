import React from 'react';

export const SectionTitle: React.FC<{readonly children: React.ReactNode}> = ({
	children,
}) => {
	return (
		<div className="text-center [.experimental-homepage_&]:text-left">
			<h2 className={'fontbrand text-4xl'}>{children}</h2>
		</div>
	);
};
