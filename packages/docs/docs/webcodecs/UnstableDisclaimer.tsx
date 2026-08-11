import React from 'react';

export const UnstableDisclaimer: React.FC = () => {
	return (
		<div>
			This package is experimental.
			<br />
			We might change the API at any time, until we remove this notice.
		</div>
	);
};
