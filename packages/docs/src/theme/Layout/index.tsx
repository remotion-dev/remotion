import type {WrapperProps} from '@docusaurus/types';
import {AskAi} from '@remotion/promo-pages/dist/Ai.js';
import '@remotion/promo-pages/dist/tailwind.css';
import Layout from '@theme-original/Layout';
import type LayoutType from '@theme/Layout';
import React, {type ReactNode} from 'react';

type Props = WrapperProps<typeof LayoutType>;

const LayoutWrapper = (props: Props): ReactNode => {
	return (
		<>
			<Layout {...props} />
			<script
				src="https://crawlchat.app/embed.js"
				id="crawlchat-script"
				async
				data-id="67c0a28c5b075f0bb35e5366"
			/>
			<AskAi />
		</>
	);
};

export default LayoutWrapper;
