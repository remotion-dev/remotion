import React from 'react';

export const SectionTitle: React.FC<{readonly children: React.ReactNode}> = ({
	children,
}) => {
	return (
		<div className={'text-center'}>
			<h2 className={'fontbrand text-4xl'}>{children}</h2>
		</div>
	);
};
