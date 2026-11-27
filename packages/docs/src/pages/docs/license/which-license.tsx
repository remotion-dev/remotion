import {Redirect, useLocation} from '@docusaurus/router';
import React from 'react';

const WhichLicense: React.FC = () => {
	const {search, hash} = useLocation();

	return <Redirect to={{pathname: '/license/quiz', search, hash}} />;
};

export default WhichLicense;
