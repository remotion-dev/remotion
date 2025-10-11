import type {WrapperProps} from '@docusaurus/types';
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
				async
				id="crawlchat-script"
				data-id="67c0a28c5b075f0bb35e5366"
				data-ask-ai="true"
				data-ask-ai-background-color="#282A36"
				data-ask-ai-color="#ffffff"
				data-ask-ai-text="Ask AI"
				data-ask-ai-position="br"
				data-ask-ai-radius="20px"
			/>
		</>
	);
};

export default LayoutWrapper;
