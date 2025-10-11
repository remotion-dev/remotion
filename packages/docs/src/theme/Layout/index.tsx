import {useHistory} from '@docusaurus/router';
import type {WrapperProps} from '@docusaurus/types';
import '@remotion/promo-pages/dist/tailwind.css';
import Layout from '@theme-original/Layout';
import type LayoutType from '@theme/Layout';
import {useCrawlChatSidePanel} from 'crawlchat-client';
import React, {type ReactNode} from 'react';

type Props = WrapperProps<typeof LayoutType>;

const LayoutWrapper = (props: Props): ReactNode => {
	useCrawlChatSidePanel({history: useHistory()});

	return <Layout {...props} />;
};

export default LayoutWrapper;
