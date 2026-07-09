import BrowserOnly from '@docusaurus/BrowserOnly';
import Head from '@docusaurus/Head';
import {
	BrowserStudio,
	createBlankTemplateProject,
} from '@remotion/browser-studio';
import type React from 'react';

const page: React.CSSProperties = {
	backgroundColor: '#111111',
	height: '100dvh',
	inset: 0,
	overflow: 'hidden',
	position: 'fixed',
	width: '100vw',
};

const fallback: React.CSSProperties = {
	alignItems: 'center',
	display: 'flex',
	fontFamily: 'Arial, Helvetica, sans-serif',
	height: '100%',
	justifyContent: 'center',
	width: '100%',
};

const standaloneCss = `
	html,
	body,
	#__docusaurus {
		background: #111111;
		height: 100%;
		margin: 0;
		overflow: hidden;
		width: 100%;
	}

	.navbar,
	.footer,
	#crawlchat-script {
		display: none !important;
	}
`;

const NewRemotionProject = () => {
	return (
		<>
			<Head>
				<title>New Remotion Project</title>
				<style>{standaloneCss}</style>
			</Head>
			<div style={page}>
				<BrowserOnly fallback={<div style={fallback}>Loading...</div>}>
					{() => (
						<BrowserStudio
							iframeSrc="/experimental_new/frame.html"
							project={createBlankTemplateProject()}
							readOnly
						/>
					)}
				</BrowserOnly>
			</div>
		</>
	);
};

export default NewRemotionProject;
