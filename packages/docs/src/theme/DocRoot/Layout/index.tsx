import {useDocsSidebar} from '@docusaurus/plugin-content-docs/client';
import {useLocation} from '@docusaurus/router';
import {HtmlClassNameProvider} from '@docusaurus/theme-common';
import DocRootLayout from '@theme-original/DocRoot/Layout';
import type {Props} from '@theme/DocRoot/Layout';
import React, {type ReactNode} from 'react';
import '../../../css/catalog.css';

export default function DocRootLayoutWrapper(props: Props): ReactNode {
	const sidebar = useDocsSidebar();
	const {pathname} = useLocation();

	// Opt other catalog sidebars into this skin when they adopt the layout.
	if (
		sidebar?.name !== 'elementsSidebar' &&
		pathname.replace(/\/$/, '') !== '/elements/libraries'
	) {
		return <DocRootLayout {...props} />;
	}

	return (
		<HtmlClassNameProvider className="catalog-layout">
			<DocRootLayout {...props} />
		</HtmlClassNameProvider>
	);
}
