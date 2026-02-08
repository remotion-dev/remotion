import {useHistory} from '@docusaurus/router';
import Layout from '@theme/Layout';
import React, {useEffect} from 'react';

export default () => {
	const history = useHistory();

	useEffect(() => {
		const slug = new URLSearchParams(window.location.search).get('prompt');
		if (slug) {
			history.replace(`/prompts/${slug}`);
		} else {
			history.replace('/prompts');
		}
	}, [history]);

	return (
		<Layout>
			<div style={{padding: 40, textAlign: 'center'}}>Redirecting...</div>
		</Layout>
	);
};
