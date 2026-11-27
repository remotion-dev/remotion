import Link from '@docusaurus/Link';
import {useLocation} from '@docusaurus/router';
import {SiteFooter} from '@remotion/promo-pages/dist/SiteFooter.js';
import '@remotion/promo-pages/dist/site-footer.css';
import React from 'react';

export default function Footer() {
	const {pathname} = useLocation();
	return <SiteFooter site="docs" pathname={pathname} LinkComponent={Link} />;
}
