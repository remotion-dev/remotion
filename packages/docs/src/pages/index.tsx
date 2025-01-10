import Layout from '@theme/Layout';
import React from 'react';

if (
	typeof window !== 'undefined' &&
	window.location?.origin?.includes('convert.remotion.dev')
) {
	window.location.href = 'https://remotion.dev/convert';
}

const NewLanding: React.FC = () => {
	return (
		<Layout>
			<div>homepage is developed in packages/convert/app/_index.tsx</div>
		</Layout>
	);
};

export default NewLanding;
