import {useHistory, useLocation} from '@docusaurus/router';
import type {WrapperProps} from '@docusaurus/types';
import '@remotion/promo-pages/dist/tailwind.css';
import Layout from '@theme-original/Layout';
import type LayoutType from '@theme/Layout';
import {useCrawlChatSidePanel} from 'crawlchat-client';
import React, {useEffect, type ReactNode} from 'react';

type Props = WrapperProps<typeof LayoutType>;

const isStandaloneRoute = (pathname: string) =>
	pathname === '/experimental_new' || pathname.startsWith('/experimental_new/');

const CRAWLCHAT_SCRIPT_ID = 'crawlchat-script';

// The script must be injected imperatively rather than rendered as JSX:
// embed.js declares a top-level `class CrawlChatEmbed` and mutates the DOM
// on load, so having it in the server-rendered HTML breaks hydration
// (React error #418) and any re-render of the <script> element executes it
// a second time ("Identifier 'CrawlChatEmbed' has already been declared").
const useCrawlChatScript = () => {
	useEffect(() => {
		if (document.getElementById(CRAWLCHAT_SCRIPT_ID)) {
			return;
		}

		const script = document.createElement('script');
		script.src = 'https://crawlchat.app/embed.js';
		script.async = true;
		script.id = CRAWLCHAT_SCRIPT_ID;
		script.dataset.id = '67c0a28c5b075f0bb35e5366';
		script.dataset.sidepanel = 'true';
		script.dataset.small = 'true';
		document.body.appendChild(script);
		// No cleanup: removing the tag would not undo the global declaration,
		// and re-inserting it later would throw.
	}, []);
};

const LayoutWithCrawlChat = (props: Props): ReactNode => {
	useCrawlChatSidePanel({history: useHistory()});
	useCrawlChatScript();

	return <Layout {...props} />;
};

const LayoutWrapper = (props: Props): ReactNode => {
	const {pathname} = useLocation();

	if (isStandaloneRoute(pathname)) {
		return props.children;
	}

	return <LayoutWithCrawlChat {...props} />;
};

export default LayoutWrapper;
